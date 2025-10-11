import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Calendar, User, ArrowLeft, Eye, Edit2, Trash2, Send, X, Save } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import UserProfileModal from './UserProfileModal';
import { useAppContext } from '../AppContext';

const BlogPosts = ({ onNavigate, user }) => {
  const {
    blogPosts,
    setBlogPosts,
    fetchUserBlogPosts,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    likeBlogPost,
    addCommentToBlogPost,
    newComment,
    setNewComment,
    token
  } = useAppContext();

  const [newPost, setNewPost] = useState({ title: '', content: '', image: null });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'single'
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', image: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlogPosts = async () => {
      console.log('Loading blog posts, token:', !!token); // Debug log
      if (token) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/blogposts', { 
            headers: { 
              'Content-Type': 'application/json', 
              'x-auth-token': token 
            } 
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const posts = await response.json();
          console.log('Fetched blog posts:', posts, 'Array:', Array.isArray(posts)); // Debug log
          setBlogPosts(posts || []); // Ensure we always set an array
        } catch (error) {
          console.error('Failed to load blog posts:', error);
          setError(error.message);
          setBlogPosts([]); // Ensure we set empty array on error
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No token available, setting empty array');
        setLoading(false);
        setBlogPosts([]);
      }
    };
    loadBlogPosts();
  }, [token, setBlogPosts]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (newPost.title.trim() && newPost.content.trim()) {
      try {
        const formData = new FormData();
        formData.append('title', newPost.title);
        formData.append('content', newPost.content);
        if (newPost.image) {
          // Convert base64 to blob if needed
          if (typeof newPost.image === 'string' && newPost.image.startsWith('data:')) {
            const response = await fetch(newPost.image);
            const blob = await response.blob();
            formData.append('image', blob, 'image.jpg');
          } else {
            formData.append('image', newPost.image);
          }
        }

        const response = await fetch('/api/blogposts', {
          method: 'POST',
          headers: { 'x-auth-token': token },
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to create blog post');
        
        const newBlogPost = await response.json();
        setBlogPosts([newBlogPost, ...blogPosts]);
        setNewPost({ title: '', content: '', image: null });
        setShowCreatePost(false);
      } catch (error) {
        console.error(error);
        alert('Failed to create blog post.');
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPost({ ...newPost, image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileClick = (authorData) => {
    console.log('Profile clicked, author data:', authorData);
    setSelectedUserProfile(authorData);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUserProfile(null);
  };

  const handleLike = async (postId) => {
    try {
      await likeBlogPost(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setViewMode('single');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPost(null);
    setEditingPost(null);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      content: post.content,
      image: post.image
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (editForm.title.trim() && editForm.content.trim()) {
      try {
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('content', editForm.content);
        if (editForm.image && editForm.image !== editingPost.imageUrl) {
          if (typeof editForm.image === 'string' && editForm.image.startsWith('data:')) {
            const response = await fetch(editForm.image);
            const blob = await response.blob();
            formData.append('image', blob, 'image.jpg');
          } else {
            formData.append('image', editForm.image);
          }
        }

        const response = await fetch(`/api/blogposts/${editingPost._id}`, {
          method: 'PUT',
          headers: { 'x-auth-token': token },
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to update blog post');
        
        const updatedPost = await response.json();
        setBlogPosts(blogPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        ));
        
        if (selectedPost && selectedPost._id === updatedPost._id) {
          setSelectedPost(updatedPost);
        }
        
        setEditingPost(null);
        setEditForm({ title: '', content: '', image: null });
      } catch (error) {
        console.error(error);
        alert('Failed to update blog post.');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditForm({ title: '', content: '', image: null });
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await fetch(`/api/blogposts/${postId}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token },
        });

        if (!response.ok) throw new Error('Failed to delete blog post');
        
        setBlogPosts(blogPosts.filter(post => post._id !== postId));
        
        if (selectedPost && selectedPost._id === postId) {
          handleBackToList();
        }
      } catch (error) {
        console.error(error);
        alert('Failed to delete blog post.');
      }
    }
  };

  const handleAddComment = async (postId) => {
    if (newComment.trim()) {
      try {
        const response = await fetch(`/api/blogposts/${postId}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ text: newComment }),
        });

        if (!response.ok) throw new Error('Failed to add comment');
        
        const updatedPost = await response.json();
        setBlogPosts(blogPosts.map(p => p._id === postId ? updatedPost : p));
        
        if (selectedPost?._id === postId) {
          setSelectedPost(updatedPost);
        }
        
        setNewComment('');
      } catch (error) {
        console.error(error);
        alert('Failed to add comment.');
      }
    }
  };

  const isOwner = (post) => {
    return user && (post.userId === user.id || post.userId === user._id);
  };

  // Single post view
  if (viewMode === 'single' && selectedPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center p-4 relative overflow-y-auto">
        <AnimatedBackground />
        
        <div className="max-w-4xl mx-auto w-full relative z-10 pb-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToList}
              className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-white">Blog Post</h1>
          </div>

          {/* Single Post Content */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8">
            {/* Edit Form or Post Display */}
            {editingPost && editingPost._id === selectedPost._id ? (
              <form onSubmit={handleSaveEdit} className="space-y-6">
                <input
                  type="text"
                  placeholder="Post title..."
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 text-xl font-bold"
                />
                <textarea
                  placeholder="Tell us about your adventure experience..."
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={8}
                  className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-500/80 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Post Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer group"
                      title="View profile and achievements"
                    >
                      <User size={24} className="text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <div>
                      <div className="text-left">
                        <h4 className="font-semibold text-white text-lg">{user?.username || 'Anonymous'}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar size={14} />
                        {new Date(selectedPost.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Owner Controls */}
                  {isOwner(selectedPost) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPost(selectedPost)}
                        className="p-2 bg-blue-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-500 transition-colors"
                        title="Edit post"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePost(selectedPost.id)}
                        className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-500 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <h1 className="text-3xl font-bold text-white mb-6">{selectedPost.title}</h1>
                
                {/* Post Image */}
                {selectedPost.imageUrl && (
                  <div className="max-w-2xl mx-auto mb-6">
                    <img
                      src={selectedPost.imageUrl}
                      alt="Adventure"
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )}
                
                <div className="text-white/90 leading-relaxed text-lg mb-8 whitespace-pre-wrap">
                  {selectedPost.content}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 py-4 border-t border-white/20 mb-8">
                  <button
                    onClick={() => handleLike(selectedPost._id)}
                    className="flex items-center gap-2 text-white/70 hover:text-red-400 transition-colors"
                  >
                    <Heart size={20} />
                    <span>{selectedPost.likes?.length || 0}</span>
                  </button>
                  <div className="flex items-center gap-2 text-white/70">
                    <MessageCircle size={20} />
                    <span>{selectedPost.comments?.length || 0}</span>
                  </div>
                  <button className="flex items-center gap-2 text-white/70 hover:text-green-400 transition-colors">
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                </div>
              </>
            )}

            {/* Comments Section */}
            {!editingPost && (
              <>
                <div className="border-t border-white/20 pt-8">
                  <h3 className="text-xl font-bold text-white mb-6">Comments ({selectedPost.comments?.length || 0})</h3>
                  
                  {/* Add Comment */}
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost._id)}
                        className="flex-1 p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                      <button
                        onClick={() => handleAddComment(selectedPost._id)}
                        className="px-4 py-3 bg-blue-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-500 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {selectedPost.comments?.map(comment => (
                      <div key={comment._id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">{comment.userEmail}</span>
                          <span className="text-white/60 text-sm">{new Date(comment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white/80">{comment.text}</p>
                      </div>
                    ))}
                    
                    {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                      <div className="text-center py-8 text-white/60">
                        <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No comments yet. Be the first to share your thoughts!</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>


      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
        <AnimatedBackground />
        <div className="text-white text-xl">Loading blog posts...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4 relative overflow-y-auto">
        <AnimatedBackground />
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Failed to load blog posts</div>
          <div className="text-white/70 mb-6">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // List view
  console.log('Rendering BlogPosts, loading:', loading, 'blogPosts:', blogPosts, 'length:', blogPosts?.length); // Debug log
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center p-4 relative overflow-y-auto">
      <AnimatedBackground />
      
      <div className="max-w-4xl mx-auto w-full relative z-10 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-4xl font-bold text-white">Adventure Stories</h1>
          </div>
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-colors"
          >
            Share Your Story
          </button>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Share Your Adventure Experience</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <input
                type="text"
                placeholder="Adventure title..."
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <textarea
                placeholder="Tell us about your adventure experience..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={4}
                className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
              />
              <div className="flex items-center gap-4">
                <label className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                  📷 Add Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {newPost.image && <span className="text-white/70 text-sm">Image selected ✓</span>}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500/80 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-green-500 transition-colors"
                >
                  Share Story
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Blog Posts */}
        <div className="space-y-6">
          {blogPosts.map(post => (
            <div key={post._id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-colors">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer group"
                    title="View profile and achievements"
                    onClick={() => handleProfileClick(post.author || post.userId)}
                  >
                    <User size={20} className="text-white group-hover:scale-110 transition-transform" />
                  </button>
                  <div className="flex-1">
                    <div className="text-left">
                      <h4 className="font-semibold text-white">{post.author?.username || 'Anonymous'}</h4>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Calendar size={14} />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Owner Controls */}
                {isOwner(post) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPost(post)}
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
                )}
              </div>

              {/* Post Content */}
              <h3 className="text-xl font-bold text-white mb-3">{post.title}</h3>
              <p className="text-white/80 leading-relaxed mb-4">
                {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
              </p>
              
              {post.content.length > 200 && (
                <button
                  onClick={() => handleViewPost(post)}
                  className="text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium mb-4 flex items-center gap-1"
                >
                  <Eye size={16} />
                  Read More
                </button>
              )}

              {/* Post Image */}
              {post.imageUrl && (
                <div className="max-w-md mx-auto mb-4">
                  <img
                    src={post.imageUrl}
                    alt="Adventure"
                    className="w-full h-40 object-cover rounded-lg shadow-lg"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center gap-2 text-white/70 hover:text-red-400 transition-colors"
                  >
                    <Heart size={18} />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleViewPost(post)}
                    className="flex items-center gap-2 text-white/70 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{post.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/70 hover:text-green-400 transition-colors">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
                
                <button
                  onClick={() => handleViewPost(post)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Post
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Stories Yet</h3>
            <p className="text-white/70 mb-6">Be the first to share your adventure experience!</p>
            <button
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-colors"
            >
              Share Your First Story
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          userData={selectedUserProfile}
          onClose={closeProfileModal}
        />
      )}
    </div>
  );
};

export default BlogPosts;