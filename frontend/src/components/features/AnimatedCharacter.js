import React, { useEffect, useRef, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import styled from 'styled-components';

const CharacterContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ParticleContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${props => props.color || '#ffffff'};
  border-radius: 50%;
  opacity: 0.6;
`;

const AnimatedCharacter = ({ 
  character,
  emotion = 'neutral',
  isSpriteBased = false,
  spriteSheet,
  spriteConfig,
  effectsEnabled = true,
  isSpeaking = false,
  animate,
}) => {
  const controls = useAnimationControls();
  const particlesRef = useRef([]);
  const emotionControls = useAnimationControls();

  // Sprite animation logic
  useEffect(() => {
    if (isSpriteBased && spriteSheet) {
      const animateSprite = async () => {
        const { frameWidth, frames } = spriteConfig;
        let currentFrame = 0;

        while (true) {
          await controls.start({
            backgroundPosition: `-${currentFrame * frameWidth}px 0`
          });
          currentFrame = (currentFrame + 1) % frames;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      };

      animateSprite();
    }
  }, [isSpriteBased, spriteSheet, spriteConfig, controls]);

  // Particle effect system
  useEffect(() => {
    if (!effectsEnabled) return;

    const createParticle = () => {
      const particle = {
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#FFD700', '#FFA500', '#FF69B4'][Math.floor(Math.random() * 3)]
      };
      particlesRef.current = [...particlesRef.current, particle];
      setTimeout(() => {
        particlesRef.current = particlesRef.current.filter(p => p.id !== particle.id);
      }, 2000);
    };

    const interval = setInterval(createParticle, 500);
    return () => clearInterval(interval);
  }, [effectsEnabled]);

  // Emotion-based animations - All static poses, no floating animations
  const getEmotionAnimation = useCallback(() => {
    // Return static pose for all emotions - no floating, scaling, or rotation animations
    return {
      y: 0,
      scale: 1,
      rotate: 0,
    };
  }, [emotion]);

  useEffect(() => {
    if (animate === 'bounce') {
      emotionControls.start({
        y: [0, -10, 0],
        scale: [1, 1.02, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      });
    }
  }, [animate, emotionControls]);

  // Re-trigger idle animation when emotion changes
  useEffect(() => {
    emotionControls.start(getEmotionAnimation());
  }, [emotion, emotionControls, getEmotionAnimation]);

  if (isSpriteBased) {
    return (
      <CharacterContainer
        style={{
          width: spriteConfig?.frameWidth,
          height: spriteConfig?.frameHeight,
          backgroundImage: `url(${spriteSheet})`,
          backgroundRepeat: 'no-repeat'
        }}
        animate={controls}
      />
    );
  }

  const getExpressionUrl = () => {
    if (!character || !character.name) {
      return ''; // Or a default placeholder
    }
    // Using character.id is more robust than using the full name,
    // as IDs are less likely to change.
    // This will look for paths like /expressions/luna/happy.png
    const characterIdPath = character.id;
    const expressionUrl = `/expressions/${characterIdPath}/${emotion}.png`;

    // Fallback to the base avatar if a specific expression image doesn't exist or for neutral.
    // For this to work, you'd need an onError handler on the img tag.
    // For now, we will consistently use the expression path.
    // A 'neutral' expression image should exist for each character.
    return expressionUrl;
  };

  return (
    <CharacterContainer>
      <motion.img
        src={getExpressionUrl()}
        alt={character.name}
        className="w-full h-full object-contain"
        onError={(e) => {
          // If the expression image fails to load, fall back to the character's main avatar.
          e.currentTarget.onerror = null; // Prevents infinite loops if the avatar also fails
          e.currentTarget.src = character.avatar;
        }}
        animate={emotionControls} // Use controls for all animations
      />

      {/* Particle effects */}
      {effectsEnabled && (
        <ParticleContainer>
          {particlesRef.current.map(particle => (
            <Particle
              key={particle.id}
              color={particle.color}
              initial={{ x: `${particle.x}%`, y: `${particle.y}%`, scale: 0 }}
              animate={{
                y: `${particle.y - 20}%`,
                scale: [0, 1, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{ duration: 2 }}
            />
          ))}
        </ParticleContainer>
      )}
    </CharacterContainer>
  );
};

export default AnimatedCharacter;