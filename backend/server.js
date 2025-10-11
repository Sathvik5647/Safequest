const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const OpenAI = require('openai');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Readable } = require('stream');
const { ObjectId } = mongoose.Types;
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const port = process.env.PORT || 5000;

// Increase payload size limit to handle large story progress objects
// The default is 100kb, which is too small for long stories.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images statically
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}
app.use('/images', express.static(imagesDir));

const uri = process.env.MONGO_URI;  // or your MongoDB connection string
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// --- User Model ---
const userStatsSchema = new mongoose.Schema({
  storiesCompleted: { type: Number, default: 0 },
  safeChoicesStreak: { type: Number, default: 0 },
  perfectStories: { type: Number, default: 0 },
  achievements: [String],
  lastLoginDate: { type: Date, default: Date.now },
  loginStreak: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: false }, // Not required for Google sign-in
  username: { type: String, required: true },
  avatar: { type: String, default: 'luna' },
  privacy: { type: String, enum: ['private', 'public'], default: 'private' },
  profilePicture: { type: String },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  tutorialCompleted: { type: Boolean, default: false },
  stats: { type: userStatsSchema, default: () => ({}) }
});

const User = mongoose.model('User', userSchema);

// --- Story Model ---
const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  character: { type: Object }, // Add character field
  initialInterests: [String],
  fullStory: [{ // This represents one "turn" or "part" of the story
    story: [{ // This will now be an array of chunks
      text: String,
      expression: {
        type: String,
        enum: ['neutral', 'happy', 'concerned', 'proud', 'protective', 'surprised', 'teaching', 'thinking'],
        default: 'neutral'
      }
    }],
    choices: [{ text: String, safe: Boolean, points: Number }],
    imageUrl: String,
    decision: {
      text: String,
      safe: Boolean,
      points: Number
    },
    feedback: String
  }],
  finalScore: Number,
  isComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Story = mongoose.model('Story', storySchema);

// --- Comment Sub-Schema ---
const characterSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  trait: String,
  image: String
});
const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

// --- BlogPost Model ---
const blogPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema]
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

app.get('/', (req, res) => {
  res.send('SafeQuest Backend is running!');
});

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// --- Auth Routes ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, confirmPassword, username } = req.body;
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords don't match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      username: username || email.split('@')[0], // Use provided username or derive from email
      avatar: 'luna', // Default avatar
      privacy: 'private', // Default privacy
      authProvider: 'local'
    });
    const savedUser = await newUser.save();

    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { 
        id: savedUser._id, 
        email: savedUser.email, 
        username: savedUser.username,
        avatar: savedUser.avatar,
        privacy: savedUser.privacy 
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ msg: 'This account was created using Google. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        username: user.username,
        avatar: user.avatar,
        privacy: user.privacy,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body; // This is the id_token from Google
    if (!credential) {
      return res.status(400).json({ msg: 'Google token is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;

    // If user doesn't exist, create a new one
    if (!user) {
      isNewUser = true;
      user = new User({
        email,
        username: email.split('@')[0], // Derive username from email
        avatar: 'luna', // Default avatar
        privacy: 'private', // Default privacy
        authProvider: 'google',
        // Password is not set for Google users
      });
      await user.save();
    }

    // Create JWT token for our app
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        username: user.username,
        avatar: user.avatar,
        privacy: user.privacy
      },
      isNewUser
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google.' });
  }
});

// @route   GET api/auth/user
// @desc    Get user data from token
// @access  Private
app.get('/api/auth/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   PUT api/auth/update
// @desc    Update user profile (username, avatar, privacy, profilePicture)
// @access  Private
app.put('/api/auth/update', auth, async (req, res) => {
  try {
    const { username, avatar, privacy, profilePicture } = req.body;
    const updateFields = {};
    
    if (username !== undefined) updateFields.username = username;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (privacy !== undefined) updateFields.privacy = privacy;
    if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// @route   PUT api/auth/tutorial-complete
// @desc    Mark tutorial as completed for user
// @access  Private
app.put('/api/auth/tutorial-complete', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { tutorialCompleted: true } },
      { new: true }
    ).select('-password');
    
    res.json({ 
      user, 
      message: 'Tutorial completed successfully',
      tutorialCompleted: true 
    });
  } catch (error) {
    console.error('Tutorial completion error:', error);
    res.status(500).json({ error: 'Failed to update tutorial status' });
  }
});

// @route   GET api/auth/tutorial-status
// @desc    Get tutorial completion status for user
// @access  Private
app.get('/api/auth/tutorial-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('tutorialCompleted');
    res.json({ 
      tutorialCompleted: user.tutorialCompleted || false 
    });
  } catch (error) {
    console.error('Tutorial status error:', error);
    res.status(500).json({ error: 'Failed to get tutorial status' });
  }
});

const extractScenario = (storyText) => {
  // Take first 2 sentences or 150 characters for image prompt
  const sentences = storyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.slice(0, 2).join('. ').substring(0, 150);
};

// Helper function to extract scenario from story text for image generation
const generateStoryImage = async (character, storyText, interests, retries = 3, backoff = 5000) => {
  const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  
  if (!HUGGINGFACE_API_KEY) {
    console.error('Hugging Face API key is not set.');
    return null;
  }

  const scenario = extractScenario(storyText);
  const imagePrompt = `Beautiful, high-quality digital painting of a background scene for a children's story about ${character.name}. Scene: ${scenario}. Style: cinematic, vibrant, colorful, high detail, enchanting, friendly cartoon, animated, safe and age-appropriate. Setting involves: ${interests.join(', ')}. Do not show any people or characters, only the background scenery. No text, words, or watermarks in the image.`;

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Generating image (Attempt ${i + 1}/${retries})...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: imagePrompt,
          parameters: { width: 1024, height: 576 }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 402) {
        console.error('Hugging Face quota exceeded. Cannot generate image.');
        return null; // Quota exceeded, no point in retrying.
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Hugging Face API error! status: ${response.status}, body: ${errorBody}`);
      }

      const imageBlob = await response.blob();
      const buffer = Buffer.from(await imageBlob.arrayBuffer());
      const dataUrl = `data:${imageBlob.type};base64,${buffer.toString('base64')}`;
      
      // Log the size of the generated data URL
      console.log(`Generated image data URL size: ${(dataUrl.length / 1024).toFixed(2)} KB`);
      
      return dataUrl;

    } catch (error) {
      console.error(`Image generation attempt ${i + 1} failed:`, error.name === 'AbortError' ? 'Request timed out' : error.message);
      if (i < retries - 1) {
        const delay = backoff * Math.pow(2, i);
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All image generation attempts failed.');
        return null;
      }
    }
  }
};

// --- Story Generation Route ---
app.post('/api/generate-story', async (req, res) => {
  const { interests, character, decisions } = req.body;
  
  try {
    let prompt;
    if (decisions && decisions.length > 0) {
      const previousContext = decisions.map(d => {
        const storyText = d.story.map(chunk => chunk.text).join(' ');
        return `Story: ${storyText}\nMy Choice: ${d.decision.text}`;
      }).join('\n\n');
      prompt = `Continue this safe, age-appropriate adventure for a 10-14 year old with ${character.name} (${character.trait}) as their guide. The story's theme is ${interests[0]}. 

Previous story context:
${previousContext}

Continue the adventure in ${character.name}'s voice:
- For Courage trait: Use a brave and encouraging tone
- For Wisdom trait: Use a thoughtful and protective tone
- For Creativity trait: Use an inventive and curious tone
- For Mindfulness trait: Use a calm and observant tone

Guidelines:
1. Match the expression field to the emotional tone of your story:
   - "concerned" for warning about dangers
   - "teaching" for explaining safety concepts
   - "proud" for praising good decisions
   - "protective" for safety guidance
   - "surprised" for unexpected situations
   - "thinking" for problem-solving moments
   - "happy" for positive outcomes
   - "neutral" for general narration

2. Create exactly 3 choices for the decision point:
   - Safe choices get +10 points
   - Neutral choices get 0 points
   - Unsafe choices get -5 points

Return your response in this exact JSON format:
{
  "story": "the story text here",
  "expression": "one of: neutral, happy, concerned, proud, protective, surprised, teaching, thinking",
  "choices": [
    {"text": "first choice", "safe": boolean, "points": number},
    {"text": "second choice", "safe": boolean, "points": number},
    {"text": "third choice", "safe": boolean, "points": number}
  ]
}`;
    } else {
      prompt = `Create the beginning of a safe, age-appropriate adventure for a 10-14 year old with ${character.name} (${character.trait}) as their guide. The adventure's theme should be ${interests[0]}.

Write in ${character.name}'s unique voice:
- For Courage trait: Use a brave and encouraging tone
- For Wisdom trait: Use a thoughtful and protective tone
- For Creativity trait: Use an inventive and curious tone
- For Mindfulness trait: Use a calm and observant tone

Guidelines:
1. Match the expression field to the emotional tone of your story:
   - "concerned" for warning about dangers
   - "teaching" for explaining safety concepts
   - "proud" for praising good decisions
   - "protective" for safety guidance
   - "surprised" for unexpected situations
   - "thinking" for problem-solving moments
   - "happy" for positive outcomes
   - "neutral" for general narration

2. End with a clear safety-related decision point with exactly 3 choices:
   - Safe choices get +10 points
   - Neutral choices get 0 points
   - Unsafe choices get -5 points

Return your response in this exact JSON format:
{
  "story": "the story text here",
  "expression": "one of: neutral, happy, concerned, proud, protective, surprised, teaching, thinking",
  "choices": [
    {"text": "first choice", "safe": boolean, "points": number},
    {"text": "second choice", "safe": boolean, "points": number},
    {"text": "third choice", "safe": boolean, "points": number}
  ]
}`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a story generator for SafeQuest, a children's safety education app. 
Your responses must always be in valid JSON format with these exact fields:
{
  "story": "story text here",
  "expression": "one of: neutral, happy, concerned, proud, protective, surprised, teaching, thinking",
  "choices": [array of choice objects]
}
The expression field is required and must match the emotional tone of the story.`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const storyData = JSON.parse(completion.choices[0].message.content);
    
    // Generate image for the story
    const imageUrl = await generateStoryImage(character, storyData.story, interests);
    // const imageUrl = null; // Temporarily disable image generation to avoid MongoDB document size issues with base64 data URLs

    // Split story into chunks and assign an expression to each chunk with simple heuristics
    const pickExpressionForSentence = (sentence) => {
      const s = (sentence || '').toLowerCase();
      // Priority ordering
      if (/watch out|careful|danger|risky|warning|unsafe|be careful|stay away/.test(s)) return 'concerned';
      if (/explain|remember|lesson|tip|here's how|let's learn|note that|teach|teaching|guide/.test(s)) return 'teaching';
      if (/great job|well done|nice work|proud of you|awesome|you did it|fantastic/.test(s)) return 'proud';
      if (/i'll protect|stay close|i've got you|keep you safe|protect|safe together/.test(s)) return 'protective';
      if (/suddenly|unexpectedly|out of nowhere|surprisingly|whoa|wow/.test(s)) return 'surprised';
      if (/think|consider|plan|decide|solve|puzzle|problem|strategy|wonder/.test(s)) return 'thinking';
      if (/happy|smile|fun|excited|cheer|celebrate|yay|joy/.test(s)) return 'happy';
      return storyData.expression || 'neutral';
    };

    const storyChunks = storyData.story
      .split(/(?<=[.!?])\s+/)
      .filter(chunk => chunk.trim().length > 0)
      .map(chunk => ({ text: chunk, expression: pickExpressionForSentence(chunk) }));

    // Combine the main story with the choices for seamless narration
    const structuredStory = [
      ...storyChunks,
      // Add a "thinking" prompt before presenting the choices
      { text: "What should we do next?", expression: "thinking" },
      // Add each choice as a narratable chunk
      ...storyData.choices.map((choice, index) => ({
        text: `Option ${index + 1}: ${choice.text}`,
        expression: "neutral" // Choices are read neutrally
      }))
    ];
    
    // If image generation failed due to quota, inform the client.
    if (imageUrl === null) {
      console.warn('Image could not be generated, likely due to API quota. Sending story without image.');
    }

    // Create a clean story object for the response.
    // This prevents old data like 'feedback' from a previous turn from being sent back to the client.
    const newStoryPart = {
      story: structuredStory,
      choices: storyData.choices,
      imageUrl,
    };
    res.json(newStoryPart);
  } catch (error) {
    console.error('Story generation error:', error);
    res.status(500).json({ error: 'Failed to generate story. Please try again.' });
  }
});

// --- Chatbot Route ---
app.post('/api/chat', auth, async (req, res) => {
  const { messages } = req.body; // Expecting an array of messages { role: 'user' | 'assistant', content: '...' }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required and should be a non-empty array.' });
  }

  try {
    // The system message helps set the personality and instructions for the chatbot.
    const systemMessage = {
      role: 'system',
      content: "You are SafeQuest Bot, a friendly and helpful assistant for the SafeQuest application. You should be supportive, encouraging, and always keep your responses age-appropriate for 10-14 year olds. Do not give safety advice that should come from a parent or guardian, but you can talk about the safety themes in the stories in a general way. Keep your answers concise."
    };

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Using Groq's LLaMA model for chat responses
      messages: [systemMessage, ...messages],
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('Error calling Groq API for chat:', error);
    res.status(500).json({ error: 'Failed to get a response from the chatbot. Please try again.' });
  }
});
// --- Save Story Route ---
app.post('/api/stories', auth, async (req, res) => {
  try {
    const { initialInterests, fullStory, finalScore, isComplete, character } = req.body;
    const newStory = new Story({
      userId: req.user.id,
      initialInterests,
      character: character ? { // Save character details with the story only if character exists
        id: character.id,
        name: character.name,
        description: character.description,
        trait: character.trait,
      } : null,
      // Keep the imageUrl only for the very last step of the story
      fullStory: fullStory.map((step, index) => {
        if (index < fullStory.length - 1) {
          const { imageUrl, ...rest } = step; // Destructure to remove imageUrl
          return rest;
        }
        return step; // Keep the last step as is
      }),
      finalScore,
      isComplete
    });

    // Log document size before saving
    const documentSize = JSON.stringify(newStory.toObject()).length;
    console.log(`Story document size: ${(documentSize / 1024).toFixed(2)} KB`);
    
    const savedStory = await newStory.save();
    res.status(201).json(savedStory);
  } catch (error) {
    console.error('Error saving story:', error);
    console.error('Story data that failed to save:', JSON.stringify({
      characterExists: !!character,
      fullStoryLength: fullStory.length,
      hasImageUrl: fullStory.some(step => step.imageUrl),
      imageUrlSizes: fullStory.map(step => step.imageUrl ? (step.imageUrl.length / 1024).toFixed(2) + ' KB' : 'none')
    }));
    res.status(500).json({ error: 'Failed to save story.' });
  }
});

// --- Get User's Stories Route ---
app.get('/api/stories', auth, async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stories.' });
  }
});

// --- Text-to-Speech Route ---
app.post('/api/tts', auth, async (req, res) => {
  const { text, characterName, expression } = req.body;
  if (!text || !characterName) {
    return res.status(400).json({ error: 'Text and characterName are required.' });
  }

  try {
    // --- Coqui TTS Local Service Implementation ---
    // The local Python service runs on port 5002.
    // We use 127.0.0.1 instead of 'localhost' to avoid IPv6 resolution issues.
    const ttsServiceUrl = 'http://127.0.0.1:5002/api/tts';

    console.log(`Forwarding TTS request for "${characterName}" to local Coqui TTS service...`);

    // Remove periods from the text to avoid unwanted pauses from the TTS engine.
    const cleanedText = text.replace(/\./g, '');

    const response = await fetch(ttsServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanedText, characterName, expression: expression || 'neutral' }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Local TTS service error: ${response.status} - ${errorBody}`);
    }

    // Stream the audio directly to the client
    res.setHeader('Content-Type', 'audio/wav');
    // Convert the web stream from fetch (response.body) to a Node.js readable stream
    // and then pipe it to the Express response object.
    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    console.error('Error generating speech with local Coqui TTS:', error);
    res.status(500).json({ error: 'Failed to generate speech.' });
  }
});
// --- Update Story Route ---
app.put('/api/stories/:id', auth, async (req, res) => {
  try {
    const { fullStory, finalScore, isComplete } = req.body;
    const story = await Story.findOne({ _id: new ObjectId(req.params.id), userId: req.user.id });

    if (!story) {
      return res.status(404).json({ msg: 'Story not found or user not authorized.' });
    }

    // Only perform image stripping if a new scene has been added.
    // This prevents incorrectly removing the image when continuing a story.
    const stepsWithImages = fullStory.filter(step => step.imageUrl).length;
    if (stepsWithImages > 1) {
      story.fullStory = fullStory.map((step, index) => {
        if (index < fullStory.length - 1) {
          const { imageUrl, ...rest } = step; // Destructure to remove imageUrl
          return rest;
        }
        return step; // Keep the last step as is
      });
    } else {
      story.fullStory = fullStory;
    }
    story.finalScore = finalScore;
    story.isComplete = isComplete;

    // Log document size before saving
    const documentSize = JSON.stringify(story.toObject()).length;
    console.log(`Updated story document size: ${(documentSize / 1024).toFixed(2)} KB`);

    // Save the story and ensure the updated document is returned.
    // The { new: true } option is crucial for this.
    await story.save();
    res.json(story);
  } catch (error) {
    console.error('Error updating story:', error);
    console.error('Story data that failed to update:', JSON.stringify({
      storyId: storyId,
      fullStoryLength: fullStory?.length,
      hasImageUrl: fullStory?.some(step => step.imageUrl),
      imageUrlSizes: fullStory?.map(step => step.imageUrl ? (step.imageUrl.length / 1024).toFixed(2) + ' KB' : 'none')
    }));
    res.status(500).json({ error: 'Failed to update story.' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

// --- BlogPost Routes ---

// Get all blog posts for the logged-in user
app.get('/api/blogposts', auth, async (req, res) => {
  try {
    // Use aggregation to sort by number of likes and populate author information
    const posts = await BlogPost.aggregate([
      {
        $lookup: {
          from: 'users', // collection name in MongoDB (usually lowercase and pluralized)
          localField: 'userId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author' // Convert author array to object
      },
      {
        $project: {
          title: 1,
          content: 1,
          userId: 1,
          imageUrl: 1,
          createdAt: 1,
          likes: 1,
          comments: 1,
          likesCount: { $size: { $ifNull: ["$likes", []] } }, // Add a field for the number of likes
          author: {
            _id: '$author._id',
            username: '$author.username',
            totalAdventures: '$author.totalAdventures',
            achievements: '$author.achievements',
            gamesPlayed: '$author.gamesPlayed',
            storiesGenerated: '$author.storiesGenerated'
          }
        }
      },
      { $sort: { likesCount: -1 } } // Sort by the new field in descending order
    ]);
    res.json(posts); // This now returns all posts with author information, sorted by popularity
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts.' });
  }
});

// Get blog posts for ONLY the logged-in user
app.get('/api/blogposts/me', auth, async (req, res) => {
  try {
    const posts = await BlogPost.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user blog posts.' });
  }
});

// Create a new blog post
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});
const upload = multer({ storage });

app.post('/api/blogposts', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ msg: 'Title and content are required.' });
    }
    const imageUrl = req.file ? `/images/${req.file.filename}` : undefined;
    const newPost = new BlogPost({
      userId: req.user.id,
      title,
      content,
      imageUrl
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post.' });
  }
});

// Get a single blog post by ID
app.get('/api/blogposts/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('userId', 'username totalAdventures achievements gamesPlayed storiesGenerated');
    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found or user not authorized.' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post.' });
  }
});

// Update a blog post by ID
app.put('/api/blogposts/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await BlogPost.findOne({ _id: req.params.id, userId: req.user.id });
    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found or user not authorized.' });
    }
    if (title) post.title = title;
    if (content) post.content = content;
    if (req.file) {
      post.imageUrl = `/images/${req.file.filename}`;
    }
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog post.' });
  }
});

// Delete a blog post by ID
app.delete('/api/blogposts/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found or user not authorized.' });
    }
    res.json({ msg: 'Blog post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog post.' });
  }
});

// @route   PUT api/blogposts/:id/like
// @desc    Like or unlike a blog post
// @access  Private
app.put('/api/blogposts/:id/like', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found.' });
    }

    // Check if the post has already been liked by this user
    if (post.likes.some(like => like.equals(req.user.id))) {
      // If yes, remove the like (unlike)
      post.likes = post.likes.filter(
        like => !like.equals(req.user.id)
      );
    } else {
      // If no, add the like
      post.likes.unshift(req.user.id);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/blogposts/:id/comment
// @desc    Add a comment to a blog post
// @access  Private
app.post('/api/blogposts/:id/comment', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email');
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Blog post not found.' });
    }

    const newComment = {
      text: req.body.text,
      userId: req.user.id,
      userEmail: user.email
    };

    post.comments.unshift(newComment);
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// --- Achievement Routes ---

// Get user stats and achievements
app.get('/api/achievements/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user stats after story completion
app.post('/api/achievements/update-stats', auth, async (req, res) => {
  try {
    const { safeChoices, totalChoices, isComplete } = req.body;
    const user = await User.findById(req.user.id);

    // Update stats
    if (isComplete) {
      user.stats.storiesCompleted += 1;
    }

    if (safeChoices === totalChoices) {
      user.stats.perfectStories += 1;
      user.stats.safeChoicesStreak += 1;
    } else {
      user.stats.safeChoicesStreak = 0;
    }

    // Check for new achievements
    const achievements = new Set(user.stats.achievements || []);

    // First story achievement
    if (user.stats.storiesCompleted === 1) {
      achievements.add('FIRST_STORY');
    }

    // Safety streak achievement
    if (user.stats.safeChoicesStreak >= 5) {
      achievements.add('SAFETY_STREAK');
    }

    // Perfect story achievement
    if (user.stats.perfectStories >= 1) {
      achievements.add('PERFECT_SCORE');
    }

    // Story master achievement
    if (user.stats.storiesCompleted >= 5) {
      achievements.add('STORY_MASTER');
    }

    user.stats.achievements = [...achievements];
    await user.save();

    res.json(user.stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
