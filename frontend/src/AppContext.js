import React, { createContext, useState, useEffect, useContext } from 'react';
import { Shield, Sparkles, Lightbulb, Leaf } from 'lucide-react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Stages: intro, welcome, login, signup, dashboard, interests, characterSelection, loading, story, feedback, end, profile, blog, create-blog, view-blog
  const [stage, setStage] = useState(() => {
    // Check if user has seen intro before
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    return hasSeenIntro ? 'welcome' : 'intro';
  });
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isRecentSignup, setIsRecentSignup] = useState(false);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialStage, setTutorialStage] = useState(''); // 'dashboard' or 'story-setup'
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [completedTutorialStages, setCompletedTutorialStages] = useState(() => {
    const saved = localStorage.getItem('completedTutorialStages');
    return saved ? JSON.parse(saved) : [];
  });

  // Story state
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [storyProgress, setStoryProgress] = useState([]);
  const [currentStory, setCurrentStory] = useState([]); // Will now be an array of chunks
  const [currentChoices, setCurrentChoices] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('neutral'); // Add state for emotion
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [score, setScore] = useState(0);
  const [ttsNarrationText, setTtsNarrationText] = useState(''); // New state for combined TTS text
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [lastFeedback, setLastFeedback] = useState(null);

  // Blog state
  const [myBlogPosts, setMyBlogPosts] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [newComment, setNewComment] = useState('');

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isLoadingNextPart, setIsLoadingNextPart] = useState(false); // New state for loading next part
  const [isAutoAdvance, setIsAutoAdvance] = useState(true); // New state for auto-advance

  const interests = [
    { id: 'space', name: 'Space Adventure', emoji: '🚀', color: 'from-purple-500 to-blue-500' },
    { id: 'animals', name: 'Animal Friends', emoji: '🐾', color: 'from-green-500 to-emerald-500' },
    { id: 'sports', name: 'Sports Hero', emoji: '⚽', color: 'from-orange-500 to-red-500' },
    { id: 'tech', name: 'Tech Wizard', emoji: '💻', color: 'from-cyan-500 to-blue-500' },
    { id: 'art', name: 'Creative Artist', emoji: '🎨', color: 'from-pink-500 to-purple-500' },
    { id: 'nature', name: 'Nature Explorer', emoji: '🌿', color: 'from-green-600 to-teal-500' },
  ];

  const characters = [
    { id: 'luna', name: 'Luna the Explorer', description: 'Brave and curious, always ready for adventure!', trait: 'Courage', avatar: '/mages/luna.png', icon: Sparkles, emoji: '🌟', color: 'from-purple-500 to-pink-500' },
    { id: 'max', name: 'Max the Guardian', description: 'Wise and protective, thinks before acting!', trait: 'Wisdom', avatar: '/mages/max.png', icon: Shield, emoji: '🛡️', color: 'from-blue-500 to-cyan-500' },
    { id: 'zara', name: 'Zara the Inventor', description: 'Creative problem-solver with amazing ideas!', trait: 'Creativity', avatar: '/mages/zara.png', icon: Lightbulb, emoji: '💡', color: 'from-orange-500 to-yellow-500' },
    { id: 'rio', name: 'Rio the Nature Guide', description: 'Calm and observant, connected to nature!', trait: 'Harmony', avatar: '/mages/rio.png', icon: Leaf, emoji: '🌿', color: 'from-green-500 to-emerald-500' },
  ];

  // Achievement and stats state
  const [userStats, setUserStats] = useState({
    storiesCompleted: 0,
    safeChoicesStreak: 0,
    perfectStories: 0,
    achievements: []
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setStage('welcome');
  };

  const login = (userToken, userData) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
    fetchUserStats(userToken);
    fetchUserStories(userToken, false);
    setStage('dashboard');
  };

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await fetch('/api/auth/user', {
            headers: { 'x-auth-token': token }
          });
          if (response.ok) {
            const userData = await response.json();
            const storedUsername = localStorage.getItem('username');
            const effectiveUsername = userData.username || storedUsername || (userData.email ? userData.email.split('@')[0] : '');
            if (effectiveUsername) {
              localStorage.setItem('username', effectiveUsername);
            }
            setUser({ ...userData, username: effectiveUsername });
            // Set selected character based on user's avatar
            if (userData.avatar) {
              const userCharacter = characters.find(c => c.id === userData.avatar);
              if (userCharacter) {
                setSelectedCharacter(userCharacter);
              }
            }
            fetchUserStories(token, false);
            fetchUserStats(token);
            fetchUserBlogPosts(token, false);
            checkTutorialStatus(token);
            // Only go to dashboard if user is not in avatar-selection stage and not a recent signup
            if (stage !== 'avatar-selection' && !isRecentSignup) {
              setStage('dashboard');
            }
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Could not load user", error);
          handleLogout();
        }
      }
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'x-auth-token': token,
  });

  const generateStory = async (interests, decisions = []) => {
    setIsImageLoading(true);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, character: selectedCharacter, decisions })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to generate story:", error);
      setStage('dashboard');
      alert('Sorry, we could not generate a story. Please try again.');
      return null;
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleAuth = async (authType) => {
    setError('');
    if (authType === 'signup' && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      console.log(`Attempting ${authType} with:`, { email, username: authType === 'signup' ? username : undefined });
      const response = await fetch(`/api/auth/${authType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authType === 'signup' ? { email, password, confirmPassword, username } : { email, password }),
      });
      const data = await response.json();
      console.log(`${authType} response:`, { status: response.status, data });
      if (!response.ok) {
        throw new Error(data.msg || 'Authentication failed');
      }
      const userToken = data.token;
      localStorage.setItem('token', data.token);
      setToken(userToken);
      const providedUsername = (authType === 'signup' && username) ? username : username;
      const derivedUsername = data.user?.username || providedUsername || (email ? email.split('@')[0] : '');
      if (derivedUsername) {
        localStorage.setItem('username', derivedUsername);
      }
      setUser(data.user?.username ? data.user : { ...data.user, username: derivedUsername });
      fetchUserStats(userToken);
      // Go to avatar selection only for new signups, dashboard for existing logins
      if (authType === 'signup') {
        setIsRecentSignup(true);
        setStage('avatar-selection');
      } else {
        setStage('dashboard');
      }
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      // keep username in localStorage for consistency; optionally clear in UI state
    } catch (err) {
      setError(err.message);
    }
  };

  // Tutorial completion functions
  const completeTutorialStage = (stage) => {
    const newCompletedStages = [...completedTutorialStages];
    if (!newCompletedStages.includes(stage)) {
      newCompletedStages.push(stage);
      setCompletedTutorialStages(newCompletedStages);
      // Persist to localStorage
      localStorage.setItem('completedTutorialStages', JSON.stringify(newCompletedStages));
      console.log(`Tutorial stage '${stage}' completed. Total stages: ${newCompletedStages.length}`);
    }

    // Define all required tutorial stages
    const allTutorialStages = ['dashboard', 'story-setup'];
    
    // Check if all stages are completed
    const allStagesCompleted = allTutorialStages.every(requiredStage => 
      newCompletedStages.includes(requiredStage)
    );

    if (allStagesCompleted) {
      console.log('All tutorial stages completed! Marking tutorial as complete.');
      completeTutorial();
    }
  };

  const completeTutorial = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/auth/tutorial-complete', {
        method: 'PUT',
        headers: { 'x-auth-token': token },
      });
      if (response.ok) {
        const data = await response.json();
        setTutorialCompleted(true);
        setShowTutorial(false);
        setTutorialStep(0);
        setTutorialStage('');
        setCompletedTutorialStages([]);
        // Clear localStorage
        localStorage.removeItem('completedTutorialStages');
        console.log('All tutorial stages completed successfully');
      }
    } catch (err) {
      console.error('Failed to complete tutorial:', err);
    }
  };

  const checkTutorialStatus = async (userToken) => {
    if (!userToken) return;
    try {
      const response = await fetch('/api/auth/tutorial-status', {
        headers: { 'x-auth-token': userToken },
      });
      if (response.ok) {
        const data = await response.json();
        setTutorialCompleted(data.tutorialCompleted);
        
        // Only show tutorial for users who haven't completed ALL stages
        if (!data.tutorialCompleted) {
          const allTutorialStages = ['dashboard', 'story-setup'];
          const allStagesCompleted = allTutorialStages.every(requiredStage => 
            completedTutorialStages.includes(requiredStage)
          );
          
          // If not all local stages are completed, show tutorial for appropriate stage
          if (!allStagesCompleted && stage === 'dashboard' && !completedTutorialStages.includes('dashboard')) {
            setShowTutorial(true);
            setTutorialStage('dashboard');
            setTutorialStep(0);
          }
        }
      }
    } catch (err) {
      console.error('Failed to check tutorial status:', err);
    }
  };

  const fetchUserStats = async (userToken) => {
    if (!userToken) return;
    try {
      const response = await fetch('/api/achievements/stats', {
        headers: { 'x-auth-token': userToken },
      });
      if (!response.ok) throw new Error('Could not fetch stats');
      const stats = await response.json();
      setUserStats(stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserStories = async (userToken, shouldChangeStage = true) => {
    if (!userToken) return;
    if (shouldChangeStage) setStage('loading');
    try {
      const response = await fetch('/api/stories', { headers: { 'Content-Type': 'application/json', 'x-auth-token': userToken } });
      if (!response.ok) throw new Error('Could not fetch stories');
      let stories = await response.json();
      // Enrich stories with full character data on the frontend
      stories = stories.map(story => {
        const fullCharacter = characters.find(c => c.id === story.character?.id);
        return { ...story, character: fullCharacter || story.character };
      });
      setUserStories(stories);
      if (shouldChangeStage) setStage('dashboard');
    } catch (err) {
      console.error(err);
      alert('Could not load your stories.');
      if (shouldChangeStage) setStage('dashboard');
    }
  };

  const fetchUserBlogPosts = async (userToken, shouldChangeStage = true) => {
    if (!userToken) return;
    if (shouldChangeStage) setStage('loading');
    try {
      const response = await fetch('/api/blogposts', { headers: { 'Content-Type': 'application/json', 'x-auth-token': userToken } });
      if (!response.ok) throw new Error('Could not fetch blog posts');
      const posts = await response.json();
      setBlogPosts(posts);
      if (shouldChangeStage) setStage('blog');
    } catch (err) {
      console.error(err);
      alert('Could not load your blog posts.');
      if (shouldChangeStage) setStage('dashboard');
    }
  };

  const fetchMyBlogPosts = async () => {
    if (!token) return;
    setStage('loading');
    try {
      const response = await fetch('/api/blogposts/me', { headers: getAuthHeaders() });
      if (!response.ok) throw new Error('Could not fetch your blog posts');
      const posts = await response.json();
      setMyBlogPosts(posts);
      setStage('my-blogs');
    } catch (err) {
      console.error(err);
      alert('Could not load your blog posts.');
      setStage('dashboard');
    }
  };

  const createBlogPost = async () => {
    if (!blogTitle.trim() || !blogContent.trim()) {
      alert('Title and content cannot be empty.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', blogTitle);
      formData.append('content', blogContent);
      if (blogImageFile) formData.append('image', blogImageFile);
      const response = await fetch('/api/blogposts', {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create blog post');
      const newPost = await response.json();
      setBlogPosts([newPost, ...blogPosts]);
      setBlogTitle('');
      setBlogContent('');
      setBlogImageFile(null);
      setStage('blog');
    } catch (err) {
      console.error(err);
      alert('Failed to create blog post.');
    }
  };

  const updateBlogPost = async () => {
    if (!selectedBlogPost) return;
    if (!blogTitle.trim() || !blogContent.trim()) {
      alert('Title and content cannot be empty.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', blogTitle);
      formData.append('content', blogContent);
      if (blogImageFile) formData.append('image', blogImageFile);
      const response = await fetch(`/api/blogposts/${selectedBlogPost._id}`, {
        method: 'PUT',
        headers: { 'x-auth-token': token },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update blog post');
      const updatedPost = await response.json();
      setBlogPosts(blogPosts.map(post => (post._id === updatedPost._id ? updatedPost : post)));
      setSelectedBlogPost(null);
      setBlogTitle('');
      setBlogContent('');
      setBlogImageFile(null);
      setStage('blog');
    } catch (err) {
      console.error(err);
      alert('Failed to update blog post.');
    }
  };

  const deleteBlogPost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const response = await fetch(`/api/blogposts/${postId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to delete blog post');
      setBlogPosts(blogPosts.filter(post => post._id !== postId));
      setStage('blog');
    } catch (err) {
      console.error(err);
      alert('Failed to delete blog post.');
    }
  };

  const likeBlogPost = async (postId) => {
    try {
      const response = await fetch(`/api/blogposts/${postId}/like`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to like post');
      const updatedPost = await response.json();
      setBlogPosts(blogPosts.map(p => p._id === postId ? updatedPost : p));
      if (selectedBlogPost?._id === postId) {
        setSelectedBlogPost(updatedPost);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to like the post.');
    }
  };

  const addCommentToBlogPost = async (postId) => {
    if (!newComment.trim()) return;
    try {
      const response = await fetch(`/api/blogposts/${postId}/comment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: newComment }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      const updatedPost = await response.json();
      setBlogPosts(blogPosts.map(p => p._id === postId ? updatedPost : p));
      setSelectedBlogPost(updatedPost);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to add the comment.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const newUserMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, newUserMessage];

    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot.');
      }

      const assistantMessage = await response.json();
      setChatMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const goToProfile = () => {
    fetchUserStats(token);
    setStage('profile');
  };

  const goToBlog = () => fetchUserBlogPosts(token);

  const goToCreateBlog = () => {
    setBlogTitle('');
    setBlogContent('');
    setSelectedBlogPost(null);
    setStage('create-blog');
  };

  const goToViewBlog = (post) => {
    setSelectedBlogPost(post);
    setBlogTitle(post.title);
    setBlogContent(post.content);
    setStage('view-blog');
  };

  const startNewStory = () => {
    setCurrentStoryId(null);
    setStoryProgress([]);
    setScore(0); // This is reset when starting a story, but I'll keep it here for clarity
    setSelectedInterest(null);
    setSelectedCharacter(null);
    setStage('interests');
  };

  const continueStory = (story) => {
    // Attempt to enter fullscreen on user gesture
    try {
      if (document && document.documentElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    setCurrentStoryId(story._id);
    setStoryProgress(story.fullStory);
    setScore(story.finalScore);
    setSelectedInterest(story.initialInterests[0] || null); // Assuming single interest is stored in an array
    
    // Find the full character object from the main list to ensure all properties (like avatar) are present.
    const fullCharacter = characters.find(c => c.id === story.character.id);
    setSelectedCharacter(fullCharacter || story.character);

    const lastProgress = story.fullStory[story.fullStory.length - 1];
    setCurrentStory(lastProgress.story);
    setCurrentChoices(lastProgress.choices || []);
    setCurrentImageUrl(lastProgress.imageUrl || '');
    setStage('story');
  };

  const saveStory = async (progress, finalScore, isComplete = false) => {
    const characterToSave = selectedCharacter ? {
      id: selectedCharacter.id,
      name: selectedCharacter.name,
      description: selectedCharacter.description,
      trait: selectedCharacter.trait,
      avatar: selectedCharacter.avatar,
    } : null;
    const storyData = {
      initialInterests: selectedInterest ? [selectedInterest] : [],
      character: characterToSave,
      fullStory: progress,
      finalScore,
      isComplete,
    };

    try {
      let response;
      if (currentStoryId) {
        response = await fetch(`/api/stories/${currentStoryId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(storyData),
        });
      } else {
        response = await fetch('/api/stories', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(storyData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save story');
      }

      const savedStory = await response.json();
      setCurrentStoryId(savedStory._id);
      return savedStory;
    } catch (err) {
      console.error('Error saving story:', err);
      alert('There was an issue saving your progress.');
      return null;
    }
  };

  const handleInterestToggle = (interestId) => {
    setSelectedInterest(prev => (prev === interestId ? null : interestId));
  };

  const startStory = async (interestOverride = null) => {
    // Auto-select character based on user's avatar
    if (!selectedCharacter && user?.avatar) {
      const userCharacter = characters.find(c => c.id === user.avatar);
      if (userCharacter) {
        setSelectedCharacter(userCharacter);
      }
    }
    
    if (!selectedCharacter && !user?.avatar) {
      alert('Please select a character!');
      return;
    }
    
    const interestToUse = interestOverride || selectedInterest;
    if (!interestToUse) {
      alert('Please select an interest!');
      return;
    }
    // Attempt to enter fullscreen on user gesture
    try {
      if (document && document.documentElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
    setStage('loading');
    const data = await generateStory([interestToUse]);

    if (data) {
      setCurrentStory(data.story);
      setCurrentChoices(data.choices);
      setCurrentImageUrl(data.imageUrl || '');

      // Combine story and choices for a single TTS narration
      const storyTextForTTS = data.story.map(chunk => chunk.text).join(' ');
      const choicesText = data.choices.map((c, i) => `Choice ${i + 1}: ${c.text}`).join('. ');
      setTtsNarrationText(`${storyTextForTTS}. Now, what will you do? ${choicesText}`);

      const newProgress = [{ story: data.story, imageUrl: data.imageUrl || '', choices: data.choices, decision: null }];
      setStoryProgress(newProgress);
      await saveStory(newProgress, 0);
      setStage('story');
    }
  };

  const handleChoice = async (choice) => {
    const currentProgress = JSON.parse(JSON.stringify(storyProgress));

    const lastProgress = currentProgress[currentProgress.length - 1];
    lastProgress.decision = choice;
    lastProgress.feedback = choice.safe ? "Great job! That was a safe choice!" : "Let's think about that choice...";

    const newScore = score + choice.points;
    setScore(newScore);
    // Set feedback but delay the emotion change slightly to allow the animation to start
    setLastFeedback({ safe: choice.safe, text: lastProgress.feedback, emotionSet: false });
    
    // Narrate the feedback
    const feedbackNarration = lastProgress.feedback;
    if (isAutoAdvance) { // Assuming isAutoAdvance implies speech is desired
      setTtsNarrationText(feedbackNarration);
    }

    setTimeout(() => {
      setLastFeedback({ safe: choice.safe, text: lastProgress.feedback, emotionSet: true });
    }, 300); // 300ms delay before expression changes

    if (currentProgress.length === 5) {
      const safeChoices = currentProgress.filter(p => p.decision?.safe).length;
      try {
        const response = await fetch('/api/achievements/update-stats', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            safeChoices,
            totalChoices: currentProgress.length,
            isComplete: true
          })
        });
        if (response.ok) {
          const updatedStats = await response.json();
          setUserStats(updatedStats);
        }
      } catch (error) {
        console.error('Error updating achievements:', error);
      }
    }

    await saveStory(currentProgress, newScore);
    
    // The EnhancedStoryView will now show the feedback in-place for 3 seconds.
    await new Promise(resolve => setTimeout(resolve, 3000)); // Show feedback for 3s
    
    setLastFeedback(null); // Clear feedback
    setIsLoadingNextPart(true); // Start loading indicator
    await new Promise(resolve => setTimeout(resolve, 1500)); // Show loading for 1.5s
    
    const recentProgress = currentProgress.slice(-3);
    const data = await generateStory(selectedInterest ? [selectedInterest] : [], recentProgress);
    if (data) {
      setCurrentStory(data.story);
      setCurrentChoices(data.choices);
      setCurrentImageUrl(data.imageUrl || '');
      setIsLoadingNextPart(false); // Stop loading FIRST

      // Combine story and choices for a single TTS narration
      const storyTextForTTS = data.story.map(chunk => chunk.text).join(' ');
      const choicesText = data.choices.map((c, i) => `Choice ${i + 1}: ${c.text}`).join('. ');
      setTtsNarrationText(`${storyTextForTTS}. Now, what will you do? ${choicesText}`);

      const newProgress = [...currentProgress, { story: data.story, imageUrl: data.imageUrl || '', choices: data.choices, decision: null }];
      setStoryProgress(newProgress);
      await saveStory(newProgress, newScore);
      setStage('story');
    } else {
      await saveStory(currentProgress, newScore, true);
      // Update user stories to reflect the completed adventure
      await fetchUserStories(token, false);
      setStage('end');
      setIsLoadingNextPart(false);
    }
  };

  const goHome = () => {
    setStage('dashboard');
  };

  const value = {
    stage, setStage,
    user, setUser,
    token, setToken,
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    error, setError,
    selectedInterest, setSelectedInterest,
    selectedCharacter, setSelectedCharacter,
    storyProgress, setStoryProgress,
    currentStory, setCurrentStory,
    currentChoices, setCurrentChoices,
    currentEmotion, setCurrentEmotion,
    currentImageUrl, setCurrentImageUrl,
    score, setScore,
    ttsNarrationText, setTtsNarrationText,
    currentStoryId, setCurrentStoryId,
    userStories, setUserStories,
    lastFeedback, setLastFeedback,
    myBlogPosts, setMyBlogPosts,
    blogPosts, setBlogPosts,
    selectedBlogPost, setSelectedBlogPost,
    blogTitle, setBlogTitle,
    blogContent, setBlogContent,
    blogImageFile, setBlogImageFile,
    newComment, setNewComment,
    isChatOpen, setIsChatOpen,
    chatMessages, setChatMessages,
    chatInput, setChatInput,
    isChatLoading, setIsChatLoading,
    isProfileOpen, setIsProfileOpen,
    isImageLoading, setIsImageLoading,
    isAutoAdvance, setIsAutoAdvance,
    isLoadingNextPart,
    interests,
    characters,
    userStats, setUserStats,
    isRecentSignup, setIsRecentSignup,
    showTutorial, setShowTutorial,
    tutorialStep, setTutorialStep,
    tutorialStage, setTutorialStage,
    tutorialCompleted, setTutorialCompleted,
    completedTutorialStages, setCompletedTutorialStages,
    completeTutorialStage,
    completeTutorial,
    checkTutorialStatus,
    handleAuth,
    handleLogout,
    login,
    fetchUserStories,
    fetchUserBlogPosts,
    fetchMyBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    likeBlogPost,
    addCommentToBlogPost,
    handleSendMessage,
    goToProfile,
    goToBlog,
    goToCreateBlog,
    goToViewBlog,
    startNewStory,
    continueStory,
    saveStory,
    handleInterestToggle,
    startStory,
    handleChoice,
    goHome,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};