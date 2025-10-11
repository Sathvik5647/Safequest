import React from 'react';
import { useAppContext } from '../AppContext';
// Removed unused import

const WelcomeScreen = ({ setStage }) => {
  const { user } = useAppContext();
  
  const resetIntro = () => {
    localStorage.removeItem('hasSeenIntro');
    setStage('intro');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative z-10">      
      <div className="animate-fade-in max-w-3xl mx-auto min-h-[70vh] flex flex-col items-center text-center relative z-10">
        {/* Logo */}
        <div className="mb-6 relative">
          <img 
            src="/applogo.png" 
            alt="SafeQuest Logo" 
            className="h-48 w-48 object-contain mx-auto"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.6))',
            }}
          />
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-4">
          {user?.username ? `Welcome, ${user.username}!` : 'Welcome to SafeQuest!'}
        </h2>
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="space-y-4">
            <button onClick={() => setStage('login')} className="px-8 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-lg font-bold rounded-full shadow-lg hover:bg-white/30 hover:scale-105 transform transition-all duration-200 block mx-auto">
              Get Started
            </button>
            
            {/* Development button - remove in production */}
            <button 
              onClick={resetIntro}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
            >
              🎬 Watch Intro Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;