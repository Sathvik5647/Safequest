import React from 'react';
import { X, Trophy, Star, Target, Calendar, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserProfileModal = ({ isOpen, onClose, userData }) => {
  console.log('UserProfileModal render:', { isOpen, userData });
  if (!userData) return null;

  const mockAchievements = [
    { id: 1, name: 'First Adventure', description: 'Completed your first story', icon: Star, earned: true },
    { id: 2, name: 'Safety Champion', description: 'Made 10 safe choices in a row', icon: Shield, earned: true },
    { id: 3, name: 'Explorer', description: 'Completed 5 different adventures', icon: Target, earned: false },
    { id: 4, name: 'Story Master', description: 'Achieved perfect score in 3 stories', icon: Trophy, earned: false },
  ];

  const stats = {
    storiesCompleted: userData.storiesCompleted || 3,
    safeChoicesStreak: userData.safeChoicesStreak || 12,
    perfectStories: userData.perfectStories || 1,
    joinDate: userData.joinDate || '2025-09-15'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {userData.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{userData.username || 'User'}</h2>
                  <p className="text-white/60 text-sm">Adventure Explorer</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{stats.storiesCompleted}</div>
                  <div className="text-white/60 text-sm">Stories Completed</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{stats.safeChoicesStreak}</div>
                  <div className="text-white/60 text-sm">Safe Choices Streak</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-white">{stats.perfectStories}</div>
                  <div className="text-white/60 text-sm">Perfect Stories</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-white/60 text-sm">
                    <Calendar size={14} />
                    <span>Joined {new Date(stats.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {mockAchievements.map(achievement => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        achievement.earned 
                          ? 'bg-green-500/20 border border-green-500/30' 
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.earned ? 'bg-green-500/30' : 'bg-white/10'
                      }`}>
                        <IconComponent 
                          size={20} 
                          className={achievement.earned ? 'text-green-400' : 'text-white/40'} 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          achievement.earned ? 'text-white' : 'text-white/60'
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className={`text-sm ${
                          achievement.earned ? 'text-white/80' : 'text-white/40'
                        }`}>
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <div className="text-green-400 text-sm font-semibold">✓ Earned</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;