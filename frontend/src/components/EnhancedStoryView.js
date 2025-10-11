import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Volume2, VolumeX, Star } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCharacter from './features/AnimatedCharacter';
 
const EnhancedStoryView = ({ 
  currentStory, 
  currentChoices, 
  handleChoice,
  goHome, 
  character,
  storyImage,
  isImageLoading,
  lastFeedback,
  score,
  isLoadingNextPart
}) => {  
  const { currentEmotion: storyEmotion } = useAppContext();
  const { token, setStage } = useAppContext(); // Get token and setStage
  const [displayedText, setDisplayedText] = useState(''); // The text of the current chunk
  const [isTyping, setIsTyping] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const typeIntervalRef = useRef(null);

  const [imageHasError, setImageHasError] = useState(false);
  const characterAnimationComplete = true; // Keep this logic gate for now
  const [isShaking, setIsShaking] = useState(false);

  // New state for chunked text display
  const [storyChunks, setStoryChunks] = useState([]); // This will now be the currentStory array
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  // State for pre-fetched audio
  const audioCache = useRef({}); // Caches audio URLs for chunks
  const currentAudio = useRef(null);
  const activeTtsControllers = useRef({}); // Map text -> AbortController for in-flight TTS
  const suppressTTSRef = useRef(false); // Global suppress flag during feedback/loading
  const playedFeedbackForRef = useRef(''); // Dedupe feedback playback
  const [characterAnimation, setCharacterAnimation] = useState(null);
  const previousStoryRef = useRef('');

  // Use a ref to access the latest autoAdvance value inside useEffect without re-triggering it.
  const autoAdvanceRef = useRef(autoAdvance);
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);

  const handleExitStory = async () => {
    // Exit fullscreen first
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Exit fullscreen failed.", error);
    }
    // Then, navigate to the adventures page
    setStage('adventures');
  };

  // Define audio-related functions before they're used in useEffect dependencies
  const cleanupActiveTtsControllers = useCallback(() => {
    // Abort all active TTS requests
    Object.values(activeTtsControllers.current).forEach(controller => {
      try { controller.abort(); } catch (_) {}
    });
    activeTtsControllers.current = {};
  }, []);

  const stopCurrentAudio = useCallback(() => {
    // Stop any currently playing audio immediately
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      currentAudio.current = null;
      setIsSpeaking(false);
    }
  }, []);

  const fetchAudio = useCallback(async (text, options = {}) => {
    // If the character is Rio, use Luna's voice to make it female.
    if (audioCache.current[text] && audioCache.current[text] !== 'error') return; // Already fetched or fetching
    if (suppressTTSRef.current && !options.ignoreSuppress) return; // Suppressed during feedback/loading

    const ttsCharacterName = character.name === 'Rio the Nature Guide' ? 'Luna the Explorer' : character.name;
    
    // Cancel any existing request for this text
    if (activeTtsControllers.current[text]) {
      try { activeTtsControllers.current[text].abort(); } catch (_) {}
    }
    
    audioCache.current[text] = 'fetching'; // Mark as in-progress
    
    try {
      const controller = new AbortController();
      activeTtsControllers.current[text] = controller;
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ text, characterName: ttsCharacterName }),
        signal: controller.signal,
      });
      
      if (!response.ok) throw new Error('Failed to fetch TTS audio.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Only set the cache if this controller is still active (not aborted)
      if (activeTtsControllers.current[text] === controller) {
        audioCache.current[text] = url;
        delete activeTtsControllers.current[text];
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('TTS API call failed:', error);
        audioCache.current[text] = 'error'; // Mark as failed to prevent retries
      }
      delete activeTtsControllers.current[text];
    }
  }, [token, character.name]);

  const playAudio = useCallback((text, onEndCallback, forcePlay = false) => {
    // Allow feedback audio to play even when suppressed
    if (suppressTTSRef.current && !forcePlay) {
      if (onEndCallback) onEndCallback(false);
      return;
    }
    
    const audioUrl = audioCache.current[text];
    if (!audioUrl || audioUrl === 'error' || audioUrl === 'fetching') {
      if (onEndCallback) onEndCallback(false); // Audio not ready or failed
      return;
    }

    // Stop any previous audio to prevent overlap
    stopCurrentAudio();

    const audio = new Audio(audioUrl);
    currentAudio.current = audio;
    let hasCalledCallback = false;

    const endPlayback = (success) => {
      if (!hasCalledCallback) {
        hasCalledCallback = true;
        setIsSpeaking(false);
        if (currentAudio.current === audio) {
          currentAudio.current = null;
        }
        if (onEndCallback) onEndCallback(success);
      }
    };

    audio.addEventListener('ended', () => endPlayback(true));
    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      endPlayback(false);
    });

    setIsSpeaking(true);
    audio.play().catch(e => {
      console.error('Audio play() failed:', e);
      endPlayback(false);
    });
  }, [setIsSpeaking, stopCurrentAudio]);

  // Fullscreen is managed in StorySetup/AppContext and explicitly exited via the exit button.

  // Effect to handle story transitions and feedback
  useEffect(() => {
    // Update suppression state based on UI phases
    suppressTTSRef.current = Boolean(lastFeedback) || Boolean(isLoadingNextPart);

    // If feedback is being shown, narrate it once and stop any ongoing/pending TTS
    if (lastFeedback) {
      // Stop any currently playing audio immediately
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
        currentAudio.current = null;
        setIsSpeaking(false);
      }
      // Abort any in-flight TTS requests
      cleanupActiveTtsControllers();

      // Dedupe feedback speech to avoid double playback (e.g., Strict Mode/effects)
      if (isSpeechEnabled && playedFeedbackForRef.current !== lastFeedback.text) {
        playedFeedbackForRef.current = lastFeedback.text;
        // We temporarily allow fetch/play even though suppress is true, because this is feedback
        // Use a local call that bypasses suppression checks
        (async () => {
          await fetchAudio(lastFeedback.text, { ignoreSuppress: true });
          // Use forcePlay=true to bypass suppression for feedback
          playAudio(lastFeedback.text, null, true);
        })();
      }

      // Clear all story-related states when feedback is shown
      setStoryChunks([]);
      setCurrentChunkIndex(0);
      setWaitingForInput(false);
      setShowChoices(false);
      setSelectedChoiceIndex(0);
      setDisplayedText('');
      audioCache.current = {};
      return;
    }

    if (currentStory && currentStory.length > 0 && characterAnimationComplete) {
      // Check if this is a new story by comparing first sentence text
      const firstChunkText = currentStory[0]?.text || '';
      if (firstChunkText && firstChunkText !== previousStoryRef.current) {
        setStoryChunks(currentStory);
        setCurrentChunkIndex(0);
        setWaitingForInput(false);
        setShowChoices(false);
        setSelectedChoiceIndex(0);
        setDisplayedText('');
        audioCache.current = {}; // Clear audio cache for new story
        previousStoryRef.current = firstChunkText; // Update the reference to the actual text
      }
    }
  }, [currentStory, characterAnimationComplete, lastFeedback, isSpeechEnabled, fetchAudio, playAudio, cleanupActiveTtsControllers]);



  const advanceChunk = useCallback(() => {
    // Stop previous audio before advancing to prevent overlap
    stopCurrentAudio();
    
    setIsShaking(true);
    setCharacterAnimation('bounce');
    setTimeout(() => {
      setIsShaking(false);
      setCharacterAnimation(null);
    }, 500);
    
    setCurrentChunkIndex(prevIndex => {
      const isLastChunk = prevIndex >= storyChunks.length - 1;
      // Pre-fetch choices audio if we are about to show them
      if (isLastChunk && isSpeechEnabled && currentChoices.length > 0) {
        const choicesText = currentChoices
          .map((c, i) => `Choice ${i + 1}: ${c.text}`)
          .join(', ');
        const fullNarration = `What will you do? ${choicesText}`;
        fetchAudio(fullNarration); // This starts the fetch early
      }
      if (isLastChunk) {
        setShowChoices(true);
        // Narrate choices as soon as they are shown
        if (isSpeechEnabled) {
          playAudio(`What will you do? ${currentChoices.map((c, i) => `Choice ${i + 1}: ${c.text}`).join(', ')}`, null);
        }
        return prevIndex;
      }
      return prevIndex + 1;
    });
  }, [storyChunks.length, isSpeechEnabled, currentChoices, fetchAudio, playAudio, stopCurrentAudio]);

  const skipTyping = useCallback(() => {
    if (isTyping) {
      clearInterval(typeIntervalRef.current);
      setIsTyping(false);
      const fullChunkText = storyChunks[currentChunkIndex]?.text || '';
      setDisplayedText(fullChunkText);
      setWaitingForInput(true);
      
      // Stop any currently playing audio when skipping to prevent overlap
      stopCurrentAudio();
      
      if (isSpeechEnabled) {
        playAudio(fullChunkText, () => {
          // After skipping, the delay is always shorter.
          if (autoAdvance) setTimeout(advanceChunk, 500); 
        });
      }
    }
  }, [isTyping, storyChunks, currentChunkIndex, isSpeechEnabled, autoAdvance, playAudio, advanceChunk, stopCurrentAudio]);

  // Typewriter effect
  useEffect(() => {
    // Reset states when feedback is shown
    if (lastFeedback) {
      setShowChoices(false);
      setDisplayedText('');
      setStoryChunks([]);
      setCurrentChunkIndex(0);
      return;
    }
    // Suppress narration entirely while loading the next part
    if (isLoadingNextPart) {
      // Stop any currently playing audio and abort pending
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current.currentTime = 0;
        currentAudio.current = null;
        setIsSpeaking(false);
      }
      cleanupActiveTtsControllers();
      return;
    }
    
    if (storyChunks.length === 0 || currentChunkIndex >= storyChunks.length || showChoices) {
      return;
    }
    const chunkToDisplay = storyChunks[currentChunkIndex]?.text || '';
    let currentIndex = 0;
    setDisplayedText('');
    setIsTyping(true);
    setWaitingForInput(false);
  
    // Pre-fetch audio for the current and next chunk
    if (isSpeechEnabled && chunkToDisplay) {
      fetchAudio(chunkToDisplay);
      if (currentChunkIndex + 1 < storyChunks.length) fetchAudio(storyChunks[currentChunkIndex + 1].text);
    }

    typeIntervalRef.current = setInterval(() => {
      if (currentIndex < chunkToDisplay.length) {
        setDisplayedText(chunkToDisplay.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeIntervalRef.current);
        setIsTyping(false);
        
        // Stop any previous audio before playing new audio
        stopCurrentAudio();
        
        if (autoAdvanceRef.current) {
          if (isSpeechEnabled) {
            // Start audio immediately when typing completes for better sync
            playAudio(chunkToDisplay, (success) => {
              const delay = success ? 500 : 800; // 0.5s on success, 0.8s on failure
              setTimeout(advanceChunk, delay);
            });
          } else {
            setTimeout(advanceChunk, 1500); // Longer delay when voice is muted to give reading time
          }
        } else {
          setWaitingForInput(true);
          if (isSpeechEnabled) playAudio(chunkToDisplay, null);
        }
      }
    }, 30);
  
    return () => {
      clearInterval(typeIntervalRef.current);
    };
  }, [storyChunks, currentChunkIndex, isSpeechEnabled, fetchAudio, playAudio, advanceChunk, showChoices, isLoadingNextPart, lastFeedback, stopCurrentAudio]);

  // Effect to handle toggling auto-advance ON while waiting for input
  useEffect(() => {
    // If auto-advance is enabled by the user while the story is paused,
    // immediately advance to the next chunk.
    if (autoAdvance && waitingForInput) {
      advanceChunk();
    }
  }, [autoAdvance, waitingForInput, advanceChunk]);

  // Effect to listen for 'Enter' key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      // This listener handles skipping and advancing the narration.
      if (event.key === 'Enter' && !autoAdvance && !showChoices) {
        if (waitingForInput) {
          // If waiting, Enter advances to the next chunk.
          advanceChunk();
        } else if (isTyping) {
          // If typing, Enter skips the animation.
          skipTyping();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waitingForInput, isTyping, autoAdvance, showChoices, skipTyping, advanceChunk]);

  const handleChoiceSelection = useCallback((choice) => {
    // Stop any currently playing audio when a choice is selected
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      setIsSpeaking(false);
    }
    handleChoice(choice);
  }, [handleChoice, setIsSpeaking]);

  // Effect for choice navigation with arrow keys
  useEffect(() => {
    if (!showChoices) return;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        setSelectedChoiceIndex(prevIndex => (prevIndex + 1) % currentChoices.length);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setSelectedChoiceIndex(prevIndex => (prevIndex - 1 + currentChoices.length) % currentChoices.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (currentChoices[selectedChoiceIndex]) {
          handleChoiceSelection(currentChoices[selectedChoiceIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showChoices, selectedChoiceIndex, currentChoices, handleChoiceSelection]);

  // Effect to narrate choices when they appear
  useEffect(() => {
    // This cleanup function stops narration only when a new story is loaded,
    // preventing it from cutting off the choice narration.
    return () => {
      if (currentAudio.current) {
        currentAudio.current.pause();
      }
      // Abort any in-flight TTS on story change/unmount
      cleanupActiveTtsControllers();
    };
  }, [currentStory, cleanupActiveTtsControllers]);

  // Reset image error state when a new image URL is provided
  useEffect(() => {
    setImageHasError(false);
  }, [storyImage]);

  const handleSpeechToggle = () => {
    // This function now primarily handles stopping/replaying the current chunk's audio.
    // The global isSpeechEnabled state is for turning the feature on/off entirely.
    if (isSpeaking && currentAudio.current) {
      // If audio is currently playing, stop it.
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
      setIsSpeaking(false);
    } else if (isSpeechEnabled && !isTyping) {
      // If speech is enabled and we're not typing, play the current text.
      // This allows replaying the audio for the current chunk.
      playAudio(displayedText, null);
    } else if (!isSpeechEnabled) {
      // If speech is globally disabled, this button will re-enable it.
      setIsSpeechEnabled(true);
    }
  };

  const choiceEmojis = ['🎯', '🌟', '💪', '🔍', '💡', '🛡️'];
  const getRandomEmoji = (index) => choiceEmojis[index % choiceEmojis.length];
  
  // Determine the current emotion from the story chunk
  const currentEmotion = storyChunks[currentChunkIndex]?.expression || storyEmotion || 'neutral';

  return (
    <div
      className="fixed inset-0 animate-fade-in z-50 text-white"
      style={{
        backgroundImage: storyImage && !imageHasError ? `url(${storyImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: storyImage && !imageHasError ? 'transparent' : '#111827', // bg-gray-900
        overflow: 'hidden', // Prevent any potential overflow from the container
      }}
    >{(!storyImage || imageHasError) && !isImageLoading && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-900">
          <span className="text-gray-400">Scene unavailable</span>
        </div>
      )}
      {/* This invisible image element is to detect loading errors */}
      {storyImage && !imageHasError && (
        <img src={storyImage} onError={() => setImageHasError(true)} className="hidden" alt="" />
      )}

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

      {/* Score Display */}
      <div 
        className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 text-accent px-3 py-1.5 rounded-lg shadow-md border border-white/20"
        title="Your Score"
      >
        <Star className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-sm text-white">{score} points</span>
      </div>
      {/* Home Button */}
      <button
        onClick={handleExitStory}
        className="absolute top-4 right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
        title="Exit Story"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Content Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 flex flex-col items-center text-center">
        <AnimatePresence>
          <motion.div
            key="story-shell"
            className={`w-full max-w-6xl mx-auto flex items-end gap-8`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              layoutId="character-container"
              layout
              className={`${lastFeedback || isLoadingNextPart ? 'w-1/2 max-w-xl mx-auto' : 'w-1/3'} h-[420px] md:h-[520px] flex-shrink-0 relative`}
              style={{ transformOrigin: 'bottom center' }}
              animate={{ scale: lastFeedback || isLoadingNextPart ? 1.06 : 1.0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center">
                <AnimatedCharacter
                  character={character}
                  emotion={lastFeedback ? (lastFeedback.safe ? 'proud' : 'concerned') : (isLoadingNextPart ? 'thinking' : (showChoices ? 'neutral' : currentEmotion))}
                  effectsEnabled={!isShaking && !isImageLoading}
                  animate={characterAnimation}
                />
              </div>
              <AnimatePresence>
                {lastFeedback && (
                  <motion.div key="feedback-bubble" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="absolute bottom-full mb-4 w-full">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 md:p-5 border-2 border-white/20">
                      <p className="text-lg md:text-xl leading-relaxed text-center italic">{lastFeedback.text}</p>
                    </div>
                  </motion.div>
                )}
                {(!lastFeedback && isLoadingNextPart) && (
                  <motion.div key="loading-bubble" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="absolute bottom-full mb-4 w-full">
                    <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 md:p-5 border-2 border-white/20">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm leading-relaxed text-center text-gray-300">Loading the next part of your adventure...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className={`${lastFeedback || isLoadingNextPart ? 'w-full' : 'w-2/3 transform -translate-x-[70px] -translate-y-[70px]'}`}>
              {(!lastFeedback && !isLoadingNextPart) ? (
                showChoices ? (
                  <div className="animate-fade-in space-y-6 text-center">
                    <h3 className="text-3xl font-bold">What will you do? 🤔</h3>
                    <div className="flex flex-col items-center gap-4 w-full">
                      {currentChoices.map((choice, index) => (
                        <button
                          key={index}
                          onClick={() => handleChoiceSelection(choice)}
                          onMouseEnter={() => setSelectedChoiceIndex(index)}
                          className={`group w-full text-center bg-black/50 backdrop-blur-sm rounded-xl p-4 border-2 transition-all duration-200 ease-in-out transform ${
                            selectedChoiceIndex === index ? 'border-primary scale-105 bg-primary/20' : 'border-white/20 hover:border-primary/50'
                          }`}
                        >
                          <p className="font-semibold leading-snug text-lg">
                            <span className="text-primary mr-3">{getRandomEmoji(index)}</span>
                            {choice.text}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="animate-slide-up-fade">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 md:p-5 border-2 border-white/20 w-full">
                      <div className="flex justify-between items-center mb-3">
                        {storyChunks.length > 1 && (
                          <div className="text-xs text-gray-400 font-mono">
                            {currentChunkIndex + 1} / {storyChunks.length}
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <button onClick={handleSpeechToggle} className="text-gray-400 hover:text-white transition-colors">
                            {isSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                          </button>
                          <div className="flex items-center gap-2 text-gray-400">
                            <input type="checkbox" id="autoAdvance" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} className="form-checkbox h-4 w-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary" />
                            <label htmlFor="autoAdvance" className="text-xs font-mono">Auto</label>
                          </div>
                        </div>
                      </div>
                      <p className="text-lg md:text-xl leading-relaxed text-left min-h-[6rem] relative">
                        {displayedText}
                        {isTyping && <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse" />}
                        {waitingForInput && !autoAdvance && (
                          <span className="absolute bottom-2 right-3 text-primary animate-pulse">▼</span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="h-48" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedStoryView;
                
                    