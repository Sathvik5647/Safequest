// Sound utility functions for UI interactions

export const playSound = (soundFile, volume = 0.5) => {
  try {
    const audio = new Audio(`/${soundFile}`);
    audio.volume = volume;
    audio.play().catch(error => {
      console.warn('Could not play sound:', error);
    });
  } catch (error) {
    console.warn('Sound file not found or could not be loaded:', error);
  }
};

export const playEnterSound = () => {
  playSound('enter.mp3', 0.6);
};

export const playSwipeSound = () => {
  playSound('swipe.mp3', 0.4);
};

// Preload sounds for better performance
export const preloadSounds = () => {
  const sounds = ['enter.mp3', 'swipe.mp3'];
  sounds.forEach(sound => {
    const audio = new Audio(`/${sound}`);
    audio.preload = 'auto';
  });
};