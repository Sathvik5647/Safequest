import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, Compass, Sparkles } from 'lucide-react';

const GameLoadingScreen = ({ 
  loadingText = "Preparing your adventure...", 
  tips = [],
  character = null,
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [characterParts, setCharacterParts] = useState([]);

  const defaultTips = [
    "💡 Always think before you act!",
    "🛡️ Safety first in every adventure!",
    "🌟 Trust your instincts!",
    "🎯 Every choice matters!",
    "🔥 Be brave, but be smart!",
    "🌈 Learn from every experience!",
    "⚡ You're stronger than you think!",
    "🎪 Adventure awaits around every corner!"
  ];

  const safetyTips = tips.length > 0 ? tips : defaultTips;

  const characterPieces = [
    { name: 'Body', icon: '👤', delay: 0 },
    { name: 'Courage', icon: '💪', delay: 0.5 },
    { name: 'Wisdom', icon: '🧠', delay: 1 },
    { name: 'Kindness', icon: '❤️', delay: 1.5 },
    { name: 'Magic', icon: '✨', delay: 2 },
  ];

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          if (onComplete) {
            setTimeout(() => onComplete(), 500);
          }
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 300);

    return () => clearInterval(progressTimer);
  }, [onComplete]);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % safetyTips.length);
    }, 2000);

    return () => clearInterval(tipTimer);
  }, [safetyTips.length]);

  useEffect(() => {
    characterPieces.forEach((piece, index) => {
      setTimeout(() => {
        setCharacterParts(prev => [...prev, piece]);
      }, piece.delay * 1000);
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-purple-400/30 to-pink-400/30 blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'gridMove 20s linear infinite'
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="mb-8"
        >
          <img 
            src="/applogo.png" 
            alt="SafeQuest Logo" 
            className="h-32 w-32 object-contain mx-auto"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 50px rgba(147, 51, 234, 0.6))',
            }}
          />
        </motion.div>
        
        {/* Main Character Assembly Area */}
        <div className="mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative"
          >
            {/* Character Base Circle */}
            <div className="w-48 h-48 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center relative">
              
              {/* Character Avatar or Placeholder */}
              {character ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={character.avatar}
                  alt={character.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center"
                >
                  <Shield className="w-16 h-16 text-white" />
                </motion.div>
              )}

              {/* Character Parts Assembly */}
              <AnimatePresence>
                {characterParts.map((part, index) => (
                  <motion.div
                    key={part.name}
                    initial={{ 
                      scale: 0, 
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                      opacity: 0 
                    }}
                    animate={{ 
                      scale: 1, 
                      x: 0, 
                      y: 0, 
                      opacity: 1 
                    }}
                    transition={{ 
                      duration: 0.8,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="absolute"
                    style={{
                      top: `${20 + index * 15}%`,
                      right: `${-20 - index * 10}%`,
                    }}
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30">
                      <span className="text-2xl">{part.icon}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Power-up Effects */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-yellow-400 border-r-pink-400"
              />
              
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border-2 border-transparent border-b-purple-400 border-l-cyan-400"
              />
            </div>

            {/* Floating Power Icons */}
            <div className="absolute inset-0">
              {[Zap, Target, Compass, Sparkles].map((Icon, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  className="absolute"
                  style={{
                    top: `${25 + i * 20}%`,
                    left: `${-15 + (i % 2) * 130}%`,
                  }}
                >
                  <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-400/30 backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Loading Progress */}
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">{loadingText}</span>
            <span className="text-purple-200">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full relative"
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {/* Rotating Safety Tips */}
        <div className="text-center h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-purple-200 font-medium px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20"
            >
              {safetyTips[currentTip]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 bg-white rounded-full"
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default GameLoadingScreen;