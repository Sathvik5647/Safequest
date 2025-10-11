import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, ArrowRight, Keyboard } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { playEnterSound, playSwipeSound } from '../utils/soundUtils';

const Tutorial = ({ 
  character, 
  stage, 
  step, 
  onNext, 
  onSkip, 
  onComplete,
  targetElement = null 
}) => {
  const { completeTutorialStage } = useAppContext();
  const [isVisible, setIsVisible] = useState(true);
  const [currentText, setCurrentText] = useState('');
  const [showContinue, setShowContinue] = useState(false);

  // Tutorial content for different stages and steps
  const tutorialContent = {
    dashboard: [
      {
        text: `Hello there! I'm ${character?.name || 'your guide'}. Welcome to SafeQuest! I'm here to help you get started on your adventure. Press Z to continue through the tutorial.`,
        highlight: null
      },
      {
        text: "This is your adventure dashboard! From here, you can start new adventures, continue existing ones, or share your experiences with others.",
        highlight: null
      },
      {
        text: "See those three magical doors? Each one leads to a different part of your SafeQuest journey. Let me explain what each door does!",
        highlight: '.adventure-doors-container'
      },
      {
        text: "The first door - 'START ADVENTURE' - is where you'll begin new quests. You'll choose your interests and dive into exciting stories!",
        highlight: '.door-section:first-child'
      },
      {
        text: "The second door - 'CONTINUE ADVENTURE' - lets you resume any adventures you've started but haven't finished yet.",
        highlight: '.door-section:nth-child(2)'
      },
      {
        text: "The third door - 'SHARE EXPERIENCE' - is where you can write about your adventures and read stories from other adventurers!",
        highlight: '.door-section:last-child'
      },
      {
        text: "Your profile menu is up here! Click on it to access settings, change your character, or view your achievements.",
        highlight: '.absolute.top-4.right-4'
      },
      {
        text: "Ready to start your first adventure? Click on the 'START ADVENTURE' door and I'll guide you through the next steps!",
        highlight: '.door-section:first-child'
      }
    ],
    'story-setup': [
      {
        text: "Great choice! Now we're in the adventure setup area. Here's where you'll choose what kind of story you want to experience. Press Z to continue through the tutorial.",
        highlight: null
      },
      {
        text: "First, you'll select your interests. These help create a story that's perfect for you! Choose the topics that excite you most.",
        highlight: '.interests-grid, .interest-option'
      },
      {
        text: "Each interest has its own magical world with unique adventures. Take your time to explore what each one offers!",
        highlight: '.interest-card'
      },
      {
        text: "Once you've selected your interests, you'll be able to start your personalized adventure. I'll be with you every step of the way!",
        highlight: '.continue-button, .next-button'
      },
      {
        text: "Remember, every choice you make in your adventure matters. Choose wisely, and most importantly, have fun exploring!",
        highlight: null
      }
    ]
  };

  const currentContent = tutorialContent[stage] || [];
  const currentStep = currentContent[step] || {};

  // Typewriter effect for text
  useEffect(() => {
    if (currentStep.text) {
      setCurrentText('');
      setShowContinue(false);
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < currentStep.text.length) {
          setCurrentText(currentStep.text.slice(0, index + 1));
          index++;
        } else {
          setShowContinue(true);
          clearInterval(typeInterval);
        }
      }, 30); // Typing speed

      return () => clearInterval(typeInterval);
    }
  }, [step, currentStep.text]);

  // Highlight target elements
  useEffect(() => {
    if (currentStep.highlight) {
      const elements = document.querySelectorAll(currentStep.highlight);
      elements.forEach(el => {
        el.style.boxShadow = '0 0 20px 4px rgba(255, 255, 0, 0.6)';
        el.style.position = 'relative';
        el.style.zIndex = '9999';
      });

      return () => {
        elements.forEach(el => {
          el.style.boxShadow = '';
          el.style.zIndex = '';
        });
      };
    }
  }, [currentStep.highlight]);

  const handleNext = () => {
    if (step < currentContent.length - 1) {
      onNext();
    } else {
      // Tutorial stage is complete, mark this stage as completed
      completeTutorialStage(stage);
      onComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  // Get character position based on tutorial step
  const getCharacterPosition = () => {
    switch (stage) {
      case 'dashboard':
        switch (step) {
          case 0:
          case 1:
          case 2:
            return { left: '5%', top: '30%' }; // Left side for introduction
          case 3:
            return { left: '10%', top: '60%' }; // Near first door
          case 4:
            return { left: '45%', top: '60%' }; // Near second door
          case 5:
            return { left: '80%', top: '60%' }; // Near third door
          case 6:
            return { right: '8%', top: '8%' }; // Near profile menu
          case 7:
            return { left: '10%', top: '60%' }; // Back to first door
          default:
            return { left: '5%', top: '30%' };
        }
      case 'story-setup':
        switch (step) {
          case 0:
            return { left: '5%', top: '30%' }; // Left side
          case 1:
          case 2:
            return { left: '20%', top: '40%' }; // Near interests area
          case 3:
            return { left: '70%', top: '70%' }; // Near continue button
          case 4:
            return { left: '5%', top: '30%' }; // Back to left
          default:
            return { left: '5%', top: '30%' };
        }
      default:
        return { left: '5%', top: '30%' };
    }
  };

  // Keyboard controls for tutorial (changed to Z key)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showContinue) return; // Don't allow skipping during typing
      
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        playEnterSound();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showContinue, step, currentContent.length]);

  // Get textbox position based on character position and tutorial step
  const getTextboxPosition = (characterPos, stage, step) => {
    // For profile menu (step 6 in dashboard), place textbox to the left of character
    if (stage === 'dashboard' && step === 6) {
      return {
        right: characterPos.right ? `calc(${characterPos.right} + 280px)` : '60%',
        top: characterPos.top,
        transform: 'none'
      };
    }
    
    // For 3rd door (step 5 in dashboard), place textbox to the left of character
    if (stage === 'dashboard' && step === 5) {
      return {
        left: characterPos.left ? `calc(${characterPos.left} - 320px)` : '30%',
        top: characterPos.top,
        transform: 'none'
      };
    }
    
    // Default positioning (to the right of character for left-positioned characters)
    if (characterPos.left) {
      return {
        left: `calc(${characterPos.left} + 200px)`,
        top: characterPos.top,
        transform: 'none'
      };
    }
    
    // For right-positioned characters, place textbox to the left
    if (characterPos.right) {
      return {
        right: `calc(${characterPos.right} + 280px)`,
        top: characterPos.top,
        transform: 'none'
      };
    }
    
    // Fallback for centered positioning
    return {
      left: '50%',
      top: characterPos.top,
      transform: 'translateX(-50%)'
    };
  };

  if (!isVisible || !currentStep.text) return null;

  const characterPosition = getCharacterPosition();
  const textboxPosition = getTextboxPosition(characterPosition, stage, step);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" />
      
      {/* Large Character Avatar positioned dynamically */}
      {character?.avatar && (
        <motion.div 
          className="absolute pointer-events-none"
          style={characterPosition}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          key={`${stage}-${step}`} // Re-animate when position changes
        >
          <img 
            src={character.avatar} 
            alt={character.name}
            className="w-64 h-64 rounded-full object-cover"
          />
        </motion.div>
      )}
      
      {/* Compact Sand-colored Text Box positioned next to character */}
      <motion.div 
        className="absolute pointer-events-auto"
        style={textboxPosition}
        initial={{ opacity: 0, x: (stage === 'dashboard' && (step === 5 || step === 6)) ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: (stage === 'dashboard' && (step === 5 || step === 6)) ? 50 : -50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-yellow-100 to-amber-200 backdrop-blur-lg shadow-2xl p-4 max-w-sm relative">
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-2 right-2 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Tutorial text only */}
          <div className="pr-6">
            <p className="text-amber-900 leading-relaxed text-sm">
              {currentText}
              <span className="animate-pulse text-amber-700">|</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Tutorial;