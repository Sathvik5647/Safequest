import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  Save,
  Camera,
  Lock,
  Globe,
  Home
} from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

const Settings = ({ user, setUser, onBack, theme, setTheme }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || 'luna',
    privacy: user?.privacy || 'private',
    notifications: user?.notifications !== false // default true
  });

  const avatars = [
    { id: 'luna', name: 'Luna the Explorer', image: '/mages/luna.png' },
    { id: 'max', name: 'Max the Guardian', image: '/mages/max.png' },
    { id: 'zara', name: 'Zara the Inventor', image: '/mages/zara.png' },
    { id: 'rio', name: 'Rio the Nature Guide', image: '/mages/rio.png' },
  ];

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser({ ...user, ...formData });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle profile picture upload
      console.log('File uploaded:', file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: theme === 'dark' ? Moon : Sun },
  ];

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            onClick={onBack}
            className="p-3 bg-white/10 backdrop-blur-lg rounded-full text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        activeTab === tab.id
                          ? 'bg-yellow-300/20 text-yellow-300'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-yellow-300 text-gray-900 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img
                        src={avatars.find(a => a.id === formData.avatar)?.image || '/mages/luna.png'}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-300"
                      />
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 p-2 bg-yellow-300 rounded-full cursor-pointer hover:bg-yellow-200 transition-colors">
                          <Camera className="w-5 h-5 text-gray-900" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Avatar Selection */}
                  {isEditing && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Choose Avatar</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {avatars.map((avatar) => (
                          <button
                            key={avatar.id}
                            onClick={() => setFormData({ ...formData, avatar: avatar.id })}
                            className={`p-2 rounded-xl border-2 transition-colors ${
                              formData.avatar === avatar.id
                                ? 'border-yellow-300 bg-yellow-300/20'
                                : 'border-white/30 hover:border-white/50'
                            }`}
                          >
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="w-full h-16 object-cover rounded-lg"
                            />
                            <p className="text-xs text-white mt-2">{avatar.name.split(' ')[0]}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Username</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                      ) : (
                        <p className="text-white bg-white/5 px-4 py-3 rounded-xl">{formData.username}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
                      <p className="text-white bg-white/5 px-4 py-3 rounded-xl flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {formData.email}
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <button
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 py-3 rounded-xl font-semibold hover:from-yellow-300 hover:to-yellow-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  )}
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-purple-300" />
                        <div>
                          <h3 className="text-white font-medium">Profile Visibility</h3>
                          <p className="text-purple-200 text-sm">Control who can see your profile</p>
                        </div>
                      </div>
                      <select
                        value={formData.privacy}
                        onChange={(e) => setFormData({ ...formData, privacy: e.target.value })}
                        className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="private">Private</option>
                        <option value="friends">Friends Only</option>
                        <option value="public">Public</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-purple-300" />
                        <div>
                          <h3 className="text-white font-medium">Push Notifications</h3>
                          <p className="text-purple-200 text-sm">Receive notifications about your adventures</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications}
                          onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-300"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Appearance Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                          <Moon className="w-5 h-5 text-purple-300" />
                        ) : (
                          <Sun className="w-5 h-5 text-purple-300" />
                        )}
                        <div>
                          <h3 className="text-white font-medium">Theme</h3>
                          <p className="text-purple-200 text-sm">Choose your preferred theme</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="px-4 py-2 bg-yellow-300 text-gray-900 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        {theme === 'dark' ? 'Light' : 'Dark'} Mode
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;