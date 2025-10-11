import React, { useState, useEffect } from 'react';
import { User, Upload, LogOut, Settings, BookOpen, Trophy, Bell, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import AdventureDoors from './AdventureDoors';
import Tutorial from './Tutorial';
import { useAppContext } from '../AppContext';

const WelcomeDashboard = ({ user, onNavigate, setUser, handleLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const username = user?.username || user?.email?.split('@')[0] || 'Adventurer';
  
  const { 
    isRecentSignup, 
    setIsRecentSignup, 
    showTutorial, 
    setShowTutorial, 
    tutorialStep, 
    setTutorialStep, 
    tutorialStage, 
    setTutorialStage,
    characters,
    selectedCharacter
  } = useAppContext();

  // Get user's selected character or default to first character
  const userCharacter = selectedCharacter || (user?.avatar ? characters.find(c => c.id === user.avatar) : null) || characters[0];

  // Start tutorial for new users
  useEffect(() => {
    if (isRecentSignup && !showTutorial) {
      setShowTutorial(true);
      setTutorialStage('dashboard');
      setTutorialStep(0);
    }
  }, [isRecentSignup, showTutorial, setShowTutorial, setTutorialStage, setTutorialStep]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setUser({ ...user, profilePicture: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionClick = (option) => {
    switch(option) {
      case 'My Adventures':
        onNavigate('adventures');
        break;
      case 'Achievements':
        onNavigate('profile');
        break;
      case 'Notifications':
        // Handle notifications
        break;
      case 'Help & Support':
        // Handle help
        break;
      default:
        console.log(`${option} clicked!`);
    }
    setIsDropdownOpen(false);
  };

  const handleTutorialNext = () => {
    setTutorialStep(tutorialStep + 1);
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    setIsRecentSignup(false);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    setIsRecentSignup(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center p-4 relative">
      <AnimatedBackground />

      {/* Profile Section */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          {/* Profile Icon */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={isDropdownOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`absolute top-14 right-0 w-64 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 p-4 ${isDropdownOpen ? 'block' : 'hidden'}`}
            style={{
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 border border-white/30">
                  <Upload className="w-3 h-3" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* User Info Section */}
            <div className="bg-white/10 rounded-lg p-3 mb-4 border border-white/20">
              <div className="text-center mb-2">
                <h3 className="font-bold text-base text-white mb-1">{username}</h3>
                <div className="h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <span className="text-base">📧</span>
                  <span className="font-medium">Email:</span>
                  <span className="text-white/80 truncate text-xs">{user?.email || 'user@gmail.com'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <span className="text-base">🎭</span>
                  <span className="font-medium">Role:</span>
                  <span className="text-white/80 font-medium">{user?.role || 'Student'}</span>
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div className="space-y-1 mb-4">
              <button 
                onClick={() => onNavigate('settings')} 
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all duration-300 group text-sm"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Account Settings</span>
              </button>
              
              <button 
                onClick={() => onNavigate('avatar-selection')} 
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all duration-300 group text-sm"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">Change Avatar</span>
              </button>
              
              <button 
                onClick={() => handleOptionClick('My Adventures')} 
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all duration-300 group text-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">My Adventures</span>
              </button>
              
              <button 
                onClick={() => handleOptionClick('Achievements')} 
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all duration-300 group text-sm"
              >
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">Achievements</span>
              </button>
              
              <button 
                onClick={() => handleOptionClick('Notifications')} 
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all duration-300 group text-sm"
              >
                <Bell className="w-4 h-4" />
                <span className="font-medium">Notifications</span>
              </button>
              
              <button 
                onClick={() => handleOptionClick('Help & Support')} 
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-all duration-300 group text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="font-medium">Help & Support</span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="border-t border-white/20 pt-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-all duration-300 font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Adventure Doors */}
      <div className="relative z-10 mt-8 flex-1 flex items-center justify-center">
        <AdventureDoors onNavigate={onNavigate} />
      </div>

      {/* Tutorial for new users */}
      {showTutorial && tutorialStage === 'dashboard' && (
        <Tutorial
          character={userCharacter}
          stage="dashboard"
          step={tutorialStep}
          onNext={handleTutorialNext}
          onSkip={handleTutorialSkip}
          onComplete={handleTutorialComplete}
        />
      )}
    </div>
  );
};

export default WelcomeDashboard;