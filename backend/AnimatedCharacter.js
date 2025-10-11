import React from 'react';
import { motion } from 'framer-motion';

/**
 * A placeholder component for the animated character.
 * It displays the character's image and applies simple animations.
 */
const AnimatedCharacter = ({ character, emotion, animate, effectsEnabled }) => {
  if (!character) {
    return null;
  }

  // A simple map for animations. This can be expanded with more complex animations later.
  const animations = {
    bounce: {
      y: [0, -10, 0],
      transition: { duration: 0.5, repeat: 1, ease: 'easeInOut' },
    },
  };

  return (
    <motion.div
      animate={animate ? animations[animate] : {}}
      className="relative w-full h-full flex items-center justify-center"
    >
      <img
        src={character.image}
        alt={character.name}
        className="max-w-full max-h-full object-contain drop-shadow-lg"
      />
    </motion.div>
  );
};

export default AnimatedCharacter;