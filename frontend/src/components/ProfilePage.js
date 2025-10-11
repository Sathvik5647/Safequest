import React, { useState, useEffect } from 'react';
import { Award, Star, Target, Trophy, ArrowLeft, Home, Edit2, Trash2, Eye, MessageCircle, Heart, Calendar } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import { useAppContext } from '../AppContext';

const ACHIEVEMENT_ICONS = {
  FIRST_STORY: <Star className="w-6 h-6 text-yellow-500" />,
  SAFETY_STREAK: <Target className="w-6 h-6 text-blue-500" />,
  PERFECT_SCORE: <Trophy className="w-6 h-6 text-purple-500" />,
  STORY_MASTER: <Award className="w-6 h-6 text-green-500" />
};

const ACHIEVEMENT_DETAILS = {
  FIRST_STORY: { title: 'First Story', description: 'Completed your first story!' },
  SAFETY_STREAK: { title: 'Safety Streak', description: 'Made 5 safe choices in a row!' },
  PERFECT_SCORE: { title: 'Perfect Score', description: 'Completed a story with all safe choices!' },
  STORY_MASTER: { title: 'Story Master', description: 'Completed 5 stories!' }
};

const ProfilePage = ({ user, userStories, blogPosts, userStats, setStage }) => {
  const { 
    myBlogPosts, 
    fetchMyBlogPosts, 
    token,
    likeBlogPost,
    deleteBlogPost 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'blogs' && token && myBlogPosts.length === 0) {
      setLoading(true);
      fetchMyBlogPosts().finally(() => setLoading(false));
    }
  }, [activeTab, token, fetchMyBlogPosts, myBlogPosts.length]);

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlogPost(postId);
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await likeBlogPost(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative p-4 overflow-y-auto pb-8">
      <AnimatedBackground />
      
      {/* Back to Home Button */}
      <div className="relative z-10 mb-6">
        <button
          onClick={() => setStage('dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/30 transition-colors"
        >
          <Home size={18} />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto animate-fade-in relative z-10">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-white">{(user.username || user.email).charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white">{user.username || user.email}</h2>
              <div className="flex gap-6 mt-4 justify-center md:justify-start">
                <div><span className="font-bold text-xl text-white">{userStories.length}</span> <span className="text-white/70">Adventures</span></div>
                <div><span className="font-bold text-xl text-white">{myBlogPosts.length}</span> <span className="text-white/70">Blogs</span></div>
                <div><span className="font-bold text-xl text-white">{userStories.reduce((acc, story) => acc + (story.finalScore || 0), 0)}</span> <span className="text-white/70">Total Score</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 mb-6">
          <div className="flex gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                activeTab === 'blogs' 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              My Blogs ({myBlogPosts.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && userStats && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">Your Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.storiesCompleted}</div>
                  <div className="text-sm text-white/70">Stories Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.perfectStories}</div>
                  <div className="text-sm text-white/70">Perfect Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.safeChoicesStreak}</div>
                  <div className="text-sm text-white/70">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userStats.achievements?.length || 0}</div>
                  <div className="text-sm text-white/70">Achievements</div>
                </div>
              </div>
            </div>

            {userStats.achievements?.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-white">Your Achievements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userStats.achievements.map((achievement) => (
                    <div key={achievement} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      {ACHIEVEMENT_ICONS[achievement]}
                      <div>
                        <div className="font-semibold text-white">{ACHIEVEMENT_DETAILS[achievement].title}</div>
                        <div className="text-sm text-white/70">{ACHIEVEMENT_DETAILS[achievement].description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Blogs Tab */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-white text-xl">Loading your blog posts...</div>
              </div>
            ) : (
              <>
                {myBlogPosts.length > 0 ? (
                  <div className="space-y-6">
                    {myBlogPosts.map(post => (
                      <div key={post._id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-colors">
                        {/* Post Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">{(user.username || user.email).charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{user.username || user.email}</h4>
                              <div className="flex items-center gap-2 text-white/60 text-sm">
                                <Calendar size={14} />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Management Controls */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setStage('edit-blog')} // TODO: implement blog editing in profile
                              className="p-2 bg-blue-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-500 transition-colors"
                              title="Edit post"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors"
                              title="Delete post"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Post Content */}
                        <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>
                        <p className="text-white/80 leading-relaxed mb-4">
                          {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                        </p>

                        {/* Post Image */}
                        {post.imageUrl && (
                          <div className="max-w-md mx-auto mb-4">
                            <img
                              src={post.imageUrl}
                              alt="Blog post"
                              className="w-full h-40 object-cover rounded-lg shadow-lg"
                            />
                          </div>
                        )}

                        {/* Post Stats */}
                        <div className="flex items-center gap-6 pt-4 border-t border-white/20">
                          <button
                            onClick={() => handleLikePost(post._id)}
                            className="flex items-center gap-2 text-white/70 hover:text-red-400 transition-colors"
                          >
                            <Heart size={18} />
                            <span>{post.likes?.length || 0}</span>
                          </button>
                          <div className="flex items-center gap-2 text-white/70">
                            <MessageCircle size={18} />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Blog Posts Yet</h3>
                    <p className="text-white/70 mb-6">Share your adventure experiences with the community!</p>
                    <button
                      onClick={() => setStage('blog')}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-colors"
                    >
                      Create Your First Blog Post
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;