import os
from flask import Flask, request, jsonify, send_file, after_this_request
from TTS.api import TTS
import torch
import tempfile
import wave
import re
from io import BytesIO

# --- Setup ---
# Check if a GPU is available for faster processing, otherwise use CPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"TTS using device: {device}")

# Define the model to use. This is a high-quality, multi-speaker English model.
# The VCTK model offers a wide variety of voices.
model_name = "tts_models/en/vctk/vits"

# Load the TTS model into memory. This can take a moment when the server starts.
print(f"Loading TTS model: {model_name}...")
tts = TTS(model_name).to(device)
print("TTS model loaded successfully.")

# Initialize the Flask web server
app = Flask(__name__)

# --- Voice Configuration ---
# Map character names to specific speaker IDs from the VCTK model.
# This allows each character to have a unique and consistent voice.
VOICE_MAPPING = {
    "Max the Guardian": "p232",   # A clear, standard British male voice.
    "Luna the Explorer": "p237",  # An American female voice.
    "Zara the Inventor": "p240",  # A standard British female voice.
    "Rio the Nature Guide": "p226" # A Scottish male voice, giving a distinct feel.
}

# --- Emotion Configuration ---
# Define the emotions supported by your TTS model. For VITS, these are common examples.
# You may need to adjust these based on the specific model you are using.
SUPPORTED_EMOTIONS = {
    "happy", "sad", "angry", "surprised", "neutral", "disgusted"
}

# --- Helper Functions ---
def split_into_sentences(text):
    """Splits text into sentences using regex, handling various punctuation."""
    # This regex splits the text by '.', '!', '?', and newline characters,
    # while keeping the delimiters. It also handles ellipses (...).
    sentences = re.split(r'(?<=[.!?\n])\s*', text)
    # Filter out any empty strings that might result from the split
    return [s.strip() for s in sentences if s.strip()]

def combine_wav_files(file_paths, output_path):
    """Combines multiple WAV files into a single WAV file."""
    if not file_paths:
        return

    output_wav = wave.open(output_path, 'wb')
    
    # Use the parameters of the first file for the output file
    with wave.open(file_paths[0], 'rb') as first_wav:
        output_wav.setparams(first_wav.getparams())

        # Write the frames of the first file
        output_wav.writeframes(first_wav.readframes(first_wav.getnframes()))

    # Append the audio data from the rest of the files
    for file_path in file_paths[1:]:
        with wave.open(file_path, 'rb') as input_wav:
            output_wav.writeframes(input_wav.readframes(input_wav.getnframes()))

    output_wav.close()
    print(f"Combined audio saved to: {output_path}")


# --- API Endpoint ---
@app.route('/api/tts', methods=['POST'])
def synthesize_speech():
    data = request.get_json()
    text = data.get('text')
    character_name = data.get('characterName')

    if not text:
        return jsonify({"error": "Text is required"}), 400

    try:
        sentences = split_into_sentences(text)
        if not sentences:
            return jsonify({"error": "No valid sentences found in text"}), 400

        # Determine which speaker to use based on the character name.
        # Fallback to a default voice if the character isn't in our mapping.
        speaker_id = VOICE_MAPPING.get(character_name, "p225") # p225 is a default female voice
        print(f"Using voice '{speaker_id}' for character '{character_name}'")

        temp_sentence_files = [] # To hold paths of individual sentence audio files
        final_audio_path = None    # To hold path of the combined audio file
        
        try:
            print(f"Synthesizing {len(sentences)} sentences...")
            for i, sentence in enumerate(sentences):
                # Create a temporary file for each sentence's audio
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_audio_file:
                    temp_path = tmp_audio_file.name
                    temp_sentence_files.append(temp_path)
                
                print(f"  [{i+1}/{len(sentences)}] Synthesizing: '{sentence[:30]}...'")
                tts.tts_to_file(text=sentence, speaker=speaker_id, file_path=temp_path)

            # Create a final temporary file for the combined audio
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as final_audio_file:
                final_audio_path = final_audio_file.name
            
            combine_wav_files(temp_sentence_files, final_audio_path)

            # Read the final audio file into an in-memory buffer
            with open(final_audio_path, 'rb') as f:
                audio_buffer = BytesIO(f.read())
            audio_buffer.seek(0) # Rewind the buffer to the beginning

            return send_file(audio_buffer, mimetype='audio/wav')

        finally:
            # This block will run whether the try block succeeds or fails,
            # ensuring that we always clean up the temporary files from disk.
            try:
                for f in temp_sentence_files:
                    os.remove(f)
                if final_audio_path:
                    os.remove(final_audio_path)
                print(f"Cleaned up {len(temp_sentence_files) + (1 if final_audio_path else 0)} temporary files from disk.")
            except Exception as e:
                print(f"Error during final file cleanup: {e}")

    except Exception as e:
        print(f"Error during TTS synthesis: {e}")
        return jsonify({"error": "Failed to generate speech"}), 500

# --- Run the Server ---
if __name__ == '__main__':
    # Run the server on port 5002 to avoid conflicts with your other services
    # Set threaded=False to ensure that only one request is processed at a time.
    # This is crucial because the underlying TTS model is not thread-safe.
    app.run(host='0.0.0.0', port=5002, threaded=False)
