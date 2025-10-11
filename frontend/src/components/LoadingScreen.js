import React from 'react';
import GameLoadingScreen from './GameLoadingScreen';

const LoadingScreen = ({ text = "Crafting your adventure...", character = null }) => {
  const safetyTips = [
    "💡 Always think before you act!",
    "🛡️ Safety first in every adventure!",
    "🌟 Trust your instincts and stay alert!",
    "🎯 Every choice shapes your story!",
    "🔥 Be brave, but always be smart!",
    "🌈 Learn something new from every experience!",
    "⚡ You have the power to make good choices!",
    "🎪 Amazing adventures await careful explorers!"
  ];

  return (
    <GameLoadingScreen 
      loadingText={text}
      tips={safetyTips}
      character={character}
    />
  );
};

export default LoadingScreen;