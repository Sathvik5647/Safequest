import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';
import { playEnterSound, playSwipeSound } from '../utils/soundUtils';

const pageVariants = {
  initial: { opacity: 0, scale: 0.9 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.1 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.8
  })
};

const backgroundVariants = {
  hidden: { opacity: 0.3, scale: 0.7, filter: 'brightness(0.4)' },
  visible: { opacity: 0.6, scale: 0.8, filter: 'brightness(0.6)' }
};

const AvatarSelection = ({ onComplete, user }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const avatars = [
    { id: 'luna', name: 'Luna the Explorer', image: '/mages/luna.png', description: 'Brave and curious, always ready for adventure!' },
    { id: 'max', name: 'Max the Guardian', image: '/mages/max.png', description: 'Wise and protective, thinks before acting!' },
    { id: 'zara', name: 'Zara the Inventor', image: '/mages/zara.png', description: 'Creative problem-solver with amazing ideas!' },
    { id: 'rio', name: 'Rio the Nature Guide', image: '/mages/rio.png', description: 'Calm and observant, connected to nature!' },
  ];

  const paginate = (newDirection) => {
    playSwipeSound(); // Play swipe sound for mouse/click navigation
    setDirection(newDirection);
    if (newDirection === 1) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % avatars.length);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + avatars.length) % avatars.length);
    }
  };

  const handleContinue = async () => {
    playEnterSound(); // Play enter sound for continue button
    const selectedAvatar = avatars[currentIndex].id;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ avatar: selectedAvatar }),
      });
      
      if (response.ok) {
        onComplete(selectedAvatar);
      } else {
        console.error('Failed to update avatar');
        onComplete(selectedAvatar); // Continue anyway
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      onComplete(selectedAvatar); // Continue anyway
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          paginate(-1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          paginate(1);
          break;
        case 'Enter':
          event.preventDefault();
          handleContinue();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4 relative overflow-hidden"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <AnimatedBackground />
      
      <div className="w-full max-w-6xl relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="w-12 h-12 text-yellow-300" />
            <h1 className="text-5xl font-bold text-white">SafeQuest</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Choose Your Character</h2>
          <p className="text-purple-100 text-lg mb-3">Select the hero that represents you best!</p>
          
          {/* Keyboard Navigation Hints */}
          <div className="flex items-center justify-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">←</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 text-xs">→</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-white/10 rounded border border-white/20 text-xs">Enter</kbd>
              <span>Continue</span>
            </div>
          </div>
        </div>

        {/* Spotlight Avatar Carousel */}
        <div className="relative w-full max-w-4xl h-80 mb-12">
          
          {/* Background Avatars */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Previous Avatar */}
            <motion.div
              className="absolute left-8 transform"
              variants={backgroundVariants}
              animate="hidden"
              whileHover="visible"
            >
              <img 
                src={avatars[(currentIndex - 1 + avatars.length) % avatars.length].image}
                alt="Previous"
                className="w-32 h-32 object-cover rounded-full border-4 border-white/20 cursor-pointer"
                onClick={() => paginate(-1)}
              />
            </motion.div>

            {/* Next Avatar */}
            <motion.div
              className="absolute right-8 transform"
              variants={backgroundVariants}
              animate="hidden"
              whileHover="visible"
            >
              <img 
                src={avatars[(currentIndex + 1) % avatars.length].image}
                alt="Next"
                className="w-32 h-32 object-cover rounded-full border-4 border-white/20 cursor-pointer"
                onClick={() => paginate(1)}
              />
            </motion.div>
          </div>

          {/* Main Spotlight Avatar */}
          <div className="relative h-full flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="flex flex-col items-center"
              >
                {/* Spotlight Circle */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300/50 to-purple-400/50 blur-xl scale-110"></div>
                  <div className="relative w-64 h-64 rounded-full p-1 bg-gradient-to-r from-yellow-300 to-purple-400">
                    <div className="w-full h-full rounded-full bg-white/10 backdrop-blur-lg p-2">
                      <img 
                        src={avatars[currentIndex].image}
                        alt={avatars[currentIndex].name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Character Info */}
                <div className="text-center mt-6">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {avatars[currentIndex].name}
                  </h3>
                  <p className="text-purple-100 text-lg max-w-md">
                    {avatars[currentIndex].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Avatar Indicators */}
        <div className="flex gap-3 mb-8">
          {avatars.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-yellow-300 scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(255, 193, 7, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleContinue}
          className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 font-bold rounded-2xl hover:from-yellow-300 hover:to-yellow-200 transition-all duration-300 shadow-lg text-lg group"
        >
          Begin Your Adventure with {avatars[currentIndex].name.split(' ')[0]}
          <ArrowRight className="w-6 h-6" />
          <kbd className="ml-2 px-2 py-1 bg-gray-900/20 text-gray-800 text-xs rounded group-hover:bg-gray-900/30 transition-colors">
            Enter
          </kbd>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AvatarSelection;