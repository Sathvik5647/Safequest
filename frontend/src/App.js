import React from 'react';
import { Shield, Star, Home, ThumbsUp, MessageSquare, FilePenLine, ArrowLeft, User, ChevronDown, X, Send } from 'lucide-react';
import { useAppContext } from './AppContext';
import { preloadSounds } from './utils/soundUtils';

import WelcomeScreen from './components/WelcomeScreen';
import WelcomeDashboard from './components/WelcomeDashboard';
import EnhancedStoryView from './components/EnhancedStoryView';
import AdventuresList from './components/AdventuresList';
import AuthForm from './components/AuthForm';
import LoadingScreen from './components/LoadingScreen';
import StorySetup from './components/StorySetup'; // Import the new component
import ProfilePage from './components/ProfilePage'; // This was missing
import AppIntro from './components/AppIntro';
import AvatarSelection from './components/AvatarSelection';
// import AnimatedBackground from './components/AnimatedBackground';
import Settings from './components/Settings';
import BlogPosts from './components/BlogPosts';
import AnimatedBackground from './components/AnimatedBackground';

const SafeQuestApp = () => {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'light');
  
  const {
    stage, setStage, user, setUser, token, email, setEmail, password, setPassword,
    confirmPassword, setConfirmPassword, error, setError, handleAuth, handleLogout, // Removed unused useEffect
    setIsRecentSignup,
    selectedInterest, handleInterestToggle, selectedCharacter, currentEmotion,
    currentStory, currentChoices, handleChoice, goHome, currentImageUrl, isImageLoading, isLoadingNextPart,
    score, isProfileOpen, setIsProfileOpen, fetchMyBlogPosts, fetchUserStories, startStory,
    userStories, continueStory, currentStoryId, // Removed unused variables
    interests,
    lastFeedback, 
    userStats, ttsNarrationText,
    blogPosts, myBlogPosts, selectedBlogPost, blogTitle, setBlogTitle, blogContent, setBlogContent,
    blogImageFile, setBlogImageFile,
    newComment, setNewComment, createBlogPost, updateBlogPost, deleteBlogPost, likeBlogPost, addCommentToBlogPost,
    isChatOpen, setIsChatOpen, chatMessages, chatInput, setChatInput, isChatLoading, handleSendMessage,
    username,
    goToBlog, goToCreateBlog, goToViewBlog, goToProfile, characters, setSelectedCharacter
  } = useAppContext();

  // Preload sound effects
  React.useEffect(() => {
    preloadSounds();
  }, []);

  // Fetch user stories whenever we navigate to adventures
  React.useEffect(() => {
    if (stage === 'adventures' && user && token) {
      fetchUserStories(token, false);
    }
  }, [stage, user, token, fetchUserStories]);

  return (
    <div className={`min-h-screen w-full ${stage === 'intro' ? 'bg-transparent' : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500'} text-foreground font-sans relative overflow-x-hidden overflow-y-auto`} style={{ margin: 0, padding: 0 }}>
      {/* Animated Background for all stages except intro */}
      {stage !== 'intro' && <AnimatedBackground />}
      
      {/* App Intro */}
      {stage === 'intro' && (
        <AppIntro onComplete={() => setStage('welcome')} />
      )}
      {/* Immersive Full-Screen Story View */}
      {stage === 'story' && (
        <EnhancedStoryView 
          currentStory={currentStory} 
          currentChoices={currentChoices} 
          handleChoice={handleChoice} 
          emotion={currentEmotion}
          goHome={goHome}
          character={selectedCharacter}
          storyImage={currentImageUrl}
          isImageLoading={isImageLoading}
          lastFeedback={lastFeedback}
          score={score}
          isLoadingNextPart={isLoadingNextPart}
          narrationText={ttsNarrationText}
        />
      )}
      
      {/* Fullscreen Loading Screen */}
      {stage === 'loading' && (
        <LoadingScreen character={selectedCharacter} />
      )}
      
      {/* Avatar Selection Screen */}
      {stage === 'avatar-selection' && (
        <AvatarSelection 
          onComplete={(selectedAvatarId) => {
            // Update user avatar and selectedCharacter
            const selectedChar = characters.find(c => c.id === selectedAvatarId);
            if (selectedChar) {
              setSelectedCharacter(selectedChar);
            }
            // Keep isRecentSignup true so tutorial can show
            setStage('dashboard');
          }}
          user={user}
          setUser={setUser}
        />
      )}
      
      {/* Welcome Dashboard */}
      {stage === 'dashboard' && user && (
        <WelcomeDashboard
          user={user}
          onNavigate={setStage}
          setUser={setUser}
          handleLogout={handleLogout}
        />
      )}
      
      {/* Main Content Area */}
      <main className="w-full h-full relative z-10">
        {/* Welcome Screen */}
        {stage === 'welcome' && <WelcomeScreen setStage={setStage} />}

        {/* Auth Screens */}
        {(stage === 'login' || stage === 'signup') && (
          <AuthForm
            type={stage}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            handleAuth={handleAuth}
            error={error}
            setError={setError}
            setStage={setStage}
          />
        )}



        {/* Adventures List */}
        {stage === 'adventures' && user && (
          <AdventuresList
            userStories={userStories}
            continueStory={continueStory}
            currentStoryId={currentStoryId}
            onNavigate={setStage}
          />
        )}

        {/* Feedback Screen */}
        {stage === 'feedback' && (
          <div className="max-w-2xl mx-auto text-center space-y-4 animate-fade-in">
            {lastFeedback && (
              <>
                <div className="inline-block p-6 bg-card rounded-full shadow-lg border border-border">
                  {lastFeedback.safe ? (
                    <div className="text-6xl">✅</div>
                  ) : (
                    <div className="text-6xl">💭</div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {lastFeedback.text}
                </h2>
                <p className="text-md text-muted-foreground">
                  Loading next part of your adventure...
                </p>
              </>
            )}
          </div>
        )}

        {/* End of Story Screen */}
        {stage === 'end' && (
          <div className="text-center space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="inline-block p-5 bg-card rounded-full shadow-lg border border-border">
                <div className="text-6xl">✅</div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">The End!</h2>
            <p className="text-lg text-muted-foreground">You've reached the end of this adventure. Your final score is {score}.</p>
            <button onClick={goHome} className="px-6 py-3 bg-primary text-primary-foreground text-lg font-bold rounded-full shadow-lg hover:bg-primary/90 hover:scale-105 transform transition-all duration-200" >
              <span className="flex items-center gap-2"><Home /> Back to Dashboard</span>
            </button>
          </div>
        )}

        {/* Profile Page */}
        {stage === 'profile' && user && (
          <ProfilePage
            user={user}
            userStories={userStories}
            blogPosts={blogPosts}
            userStats={userStats}
            setStage={setStage}
          />
        )}

        {/* Settings Page */}
        {stage === 'settings' && user && (
          <Settings
            user={user}
            setUser={setUser}
            onNavigate={setStage}
            theme={theme}
            setTheme={setTheme}
          />
        )}

        {/* Blog List Page */}
        {stage === 'blog' && (
          <BlogPosts onNavigate={setStage} user={user} />
        )}

        {/* My Blogs Page */}
        {stage === 'my-blogs' && (
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-foreground">My Blogs</h2>
              <button onClick={goToCreateBlog} className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                <FilePenLine className="w-4 h-4" />
                Create New Post
              </button>
            </div>
            {myBlogPosts.length > 0 ? (
              <div className="space-y-6">
                {myBlogPosts.map(post => (
                  <div key={post._id} className="bg-card rounded-lg shadow-lg p-6 border border-border flex flex-col justify-between">
                    <div>
                      {post.imageUrl && (
                        <img src={post.imageUrl} alt={post.title} className="w-full h-56 object-cover rounded-md mb-4 border border-border" />
                      )}
                      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                      <button onClick={() => goToViewBlog(post)} className="text-primary hover:underline text-sm font-semibold">View Blog</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground bg-card p-6 rounded-lg border border-border">You haven't written any blogs yet.</div>
            )}
          </div>
        )}

        {/* Create Blog Post Page */}
        {stage === 'create-blog' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-foreground mb-4">{selectedBlogPost ? 'Edit Blog Post' : 'Create New Blog Post'}</h2>
                <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Post Title"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-input border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <textarea
                  placeholder="Post Content"
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 rounded-md bg-input border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">Upload Image (optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBlogImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                        className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {blogImageFile && (
                        <p className="text-xs text-muted-foreground mt-1">Selected: {blogImageFile.name}</p>
                      )}
                    </div>
                <div className="flex gap-4">
                  <button
                    onClick={selectedBlogPost ? updateBlogPost : createBlogPost}
                    className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    {selectedBlogPost ? 'Update Post' : 'Create Post'}
                  </button>
                  <button
                    onClick={() => setStage('blog')}
                    className="px-5 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md shadow-sm hover:bg-secondary/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Blog Post Page */}
        {stage === 'view-blog' && selectedBlogPost && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <button
              onClick={() => setStage('blog')}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>
            <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border">
              <h2 className="text-4xl font-bold text-foreground mb-2">{selectedBlogPost.title}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Created: {new Date(selectedBlogPost.createdAt).toLocaleDateString()}
              </p>
              <div className="prose prose-lg max-w-none prose-invert">
                {selectedBlogPost.imageUrl && (
                  <img src={selectedBlogPost.imageUrl} alt={selectedBlogPost.title} className="w-full h-80 object-cover rounded-md mb-6 border border-border" />
                )}
                <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">{selectedBlogPost.content}</p>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border">
                <button onClick={() => likeBlogPost(selectedBlogPost._id)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-semibold">{selectedBlogPost.likes?.length || 0}</span>
                </button>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-semibold">{selectedBlogPost.comments?.length || 0}</span>
                </div>
              </div>
              {user && user._id === selectedBlogPost.userId && (
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStage('create-blog')}
                    className="px-5 py-2 bg-yellow-500/80 text-white font-semibold rounded-md shadow-sm hover:bg-yellow-600 transition-colors"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={() => deleteBlogPost(selectedBlogPost._id)}
                    className="px-5 py-2 bg-destructive text-destructive-foreground font-semibold rounded-md shadow-sm hover:bg-destructive/90 transition-colors"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
            {/* Comments Section */}
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Comments</h3>
              <div className="space-y-4">
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-md bg-input border-border focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
                <button onClick={() => addCommentToBlogPost(selectedBlogPost._id)} className="px-4 py-1.5 text-sm bg-primary text-primary-foreground font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-colors">
                  Post Comment
                </button>
              </div>
              <div className="mt-6 space-y-4">
                {selectedBlogPost.comments?.map((comment, index) => (
                  <div key={index} className="bg-accent p-3 rounded-lg border border-border">
                    <p className="text-sm text-foreground">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">- {comment.userEmail} on {new Date(comment.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} {/* This closes the 'view-blog' stage */}
      </main>
        
      {/* New Fullscreen Story Setup Flow */}
      {(stage === 'interests' || stage === 'characterSelection') && (
        <StorySetup
          stage={stage}
          interests={interests}
          selectedInterest={selectedInterest}
          handleInterestToggle={handleInterestToggle}
          proceedToCharacterSelection={() => setStage('enhanced-story-view')}
          characters={characters}
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
          startStory={startStory}
          setStage={setStage}
          goBack={() => setStage('dashboard')}
        />
      )}
      
      {/* Chatbot UI */}
      {token && stage !== 'story' && stage !== 'interests' && stage !== 'characterSelection' && stage !== 'dashboard' && stage !== 'avatar-selection' && stage !== 'settings' && stage !== 'enhanced-story-view' && (
        <>
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 bg-accent text-accent-foreground p-4 rounded-full shadow-lg hover:bg-accent/90 transition-transform hover:scale-110 z-50"
              aria-label="Open Chat"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
          )}

          {isChatOpen && (
            <div className="fixed bottom-6 right-6 w-80 h-[28rem] bg-card rounded-xl shadow-2xl border border-border flex flex-col z-50 animate-fade-in">
              <header className="flex items-center justify-between p-3 bg-background/50 border-b border-border">
                <h3 className="font-bold text-foreground">SafeQuest Bot</h3>
                <button onClick={() => setIsChatOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </header>
              <div className="flex-grow p-3 overflow-y-auto space-y-3">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-input text-foreground'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-2 rounded-lg bg-input text-foreground">
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-grow bg-input px-3 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isChatLoading}
                />
                <button 
                  type="submit" 
                  className="bg-primary p-2 rounded-full text-primary-foreground disabled:bg-muted" 
                  disabled={isChatLoading || !chatInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SafeQuestApp;