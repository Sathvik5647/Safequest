import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, ArrowRight } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import { playSwipeSound } from '../utils/soundUtils';

// Slide animation variants for character showcase
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

const AppIntro = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [characterDirection, setCharacterDirection] = useState(0);

  // Enter fullscreen on component mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          await document.documentElement.msRequestFullscreen();
        }
        console.log('Entered fullscreen mode for AppIntro');
      } catch (error) {
        console.log('Fullscreen request failed:', error);
      }
    };
    
    enterFullscreen();
  }, []);

  const characters = [
    { 
      id: 'luna', 
      name: 'Luna', 
      trait: 'Courage', 
      color: 'from-purple-500 to-pink-500',
      icon: '🌟',
      avatar: '/mages/luna.png'
    },
    { 
      id: 'max', 
      name: 'Max', 
      trait: 'Wisdom', 
      color: 'from-blue-500 to-cyan-500',
      icon: '🛡️',
      avatar: '/mages/max.png'
    },
    { 
      id: 'zara', 
      name: 'Zara', 
      trait: 'Creativity', 
      color: 'from-orange-500 to-yellow-500',
      icon: '💡',
      avatar: '/mages/zara.png'
    },
    { 
      id: 'rio', 
      name: 'Rio', 
      trait: 'Harmony', 
      color: 'from-green-500 to-emerald-500',
      icon: '🌿',
      avatar: '/mages/rio.png'
    }
  ];

  // No manual pagination needed - fully automatic character showcase

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Auto-swipe through ALL characters when on character showcase step
  useEffect(() => {
    if (currentStep === 1) {
      console.log('Starting character showcase. Initial character:', characters[0].name);
      let swipeCount = 0;
      
      const autoSwipeTimer = setInterval(() => {
        swipeCount++;
        setCharacterDirection(1);
        setCurrentCharacterIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % characters.length;
          console.log(`Swipe ${swipeCount}: Moving from ${characters[prevIndex].name} to ${characters[nextIndex].name} (index ${nextIndex})`);
          playSwipeSound();
          
          return nextIndex;
        });
        
        // After showing all characters (Luna shown initially + 3 swipes = 4 total)
        if (swipeCount >= 3) {
          console.log('All 4 characters shown, will move to next step soon...');
          clearInterval(autoSwipeTimer);
          // Wait to let the last character (Rio) display fully
          setTimeout(() => {
            console.log('Moving to adventure step...');
            setCurrentStep(2);
          }, 3000); // Give Rio 3 full seconds to display
        }
      }, 2500); // Slower timing: 2.5 seconds per character

      return () => clearInterval(autoSwipeTimer);
    }
  }, [currentStep, characters.length]);

  // No keyboard navigation - fully automatic character showcase

  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => setCurrentStep(1), 800);
      return () => clearTimeout(timer);
    } else if (currentStep === 2) {
      const timer = setTimeout(() => setCurrentStep(3), 3000);
      return () => clearTimeout(timer);
    } else if (currentStep === 3) {
      const timer = setTimeout(() => {
        localStorage.setItem('hasSeenIntro', 'true');
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const handleSkip = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      <AnimatedBackground />
      
      {/* Skip Button */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={handleSkip}
            className="absolute top-8 right-8 z-50 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
          >
            Skip Intro <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        
        {/* Step 0: Logo Reveal */}
        <AnimatePresence>
          {currentStep === 0 && (
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 1.5, type: "spring", stiffness: 100 }}
              className="text-center"
            >
              <motion.img 
                src="/applogo.png" 
                alt="SafeQuest Logo" 
                animate={{ 
                  filter: [
                    "drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))",
                    "drop-shadow(0 0 60px rgba(168, 85, 247, 1))",
                    "drop-shadow(0 0 30px rgba(168, 85, 247, 0.8))"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-48 h-48 object-contain mx-auto"
              />
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-6xl font-bold text-white mt-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
              >
                SafeQuest
              </motion.h1>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-4 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Character Showcase with Swiping */}
        <AnimatePresence>
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center relative"
            >
              <motion.h2
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-bold text-white mb-12"
              >
                Meet Your Guides
              </motion.h2>
              
              {/* Fully automatic character showcase - no manual controls */}
              
              {/* Character Display Area */}
              <div className="relative h-96 flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} custom={characterDirection}>
                  <motion.div
                    key={currentCharacterIndex}
                    custom={characterDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                    className="absolute flex flex-col items-center"
                  >
                    <motion.img
                      src={`/mages/${characters[currentCharacterIndex].id}.png`}
                      alt={characters[currentCharacterIndex].name}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-48 h-48 object-contain mb-6 drop-shadow-2xl"
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      <h3 className="text-3xl font-bold text-white mb-2">{characters[currentCharacterIndex].name}</h3>
                      <p className="text-purple-200 text-lg mb-4">{characters[currentCharacterIndex].trait}</p>
                      <div className="text-4xl">{characters[currentCharacterIndex].icon}</div>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* No indicators needed - fully automatic showcase */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Adventure Awaits */}
        <AnimatePresence>
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-8 relative"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-900 to-blue-900 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-yellow-400" />
                  </div>
                </div>
                
                {/* Orbiting stars */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.div
                    key={i}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                    style={{ transformOrigin: 'center' }}
                  >
                    <Star 
                      className="absolute w-4 h-4 text-yellow-300"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translateY(-80px) rotate(${angle}deg)`
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
              >
                Your Adventure Awaits
              </motion.h2>
              
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl text-purple-200 max-w-2xl mx-auto"
              >
                Embark on magical journeys, make smart choices, and learn valuable life lessons with your AI companions!
              </motion.p>
              
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                      y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                      opacity: 0
                    }}
                    animate={{ 
                      y: -50,
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      delay: Math.random() * 2,
                      repeat: Infinity
                    }}
                    className="absolute w-2 h-2 bg-white rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Final Transition */}
        <AnimatePresence>
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 1.5 }}
                className="inline-block mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-4xl">🚀</span>
                </div>
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-white"
              >
                Let's Begin!
              </motion.h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppIntro;