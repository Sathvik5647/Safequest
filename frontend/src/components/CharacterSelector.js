import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playEnterSound, playSwipeSound } from '../utils/soundUtils';
import {
  SpaceAdventureAnimation,
  AnimalFriendsAnimation,
  SportsHeroAnimation,
  TechWizardAnimation,
  CreativeArtistAnimation,
  NatureExplorerAnimation,
} from './StorySetup';

const CharacterSelector = ({ characters, selectedInterest, selectedCharacter, setSelectedCharacter, startStory, setStage }) => {
  const [index, setIndex] = useState(() => Math.max(0, characters.findIndex(c => c.id === selectedCharacter?.id)) || 0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { 
        playSwipeSound();
        setDirection(1); 
        setIndex(prev => (prev + 1) % characters.length); 
      }
      if (e.key === 'ArrowLeft') { 
        playSwipeSound();
        setDirection(-1); 
        setIndex(prev => (prev - 1 + characters.length) % characters.length); 
      }
      if (e.key === 'Enter') {
        playEnterSound();
        setSelectedCharacter(characters[index]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [characters, index, setSelectedCharacter]);

  useEffect(() => { setSelectedCharacter(characters[index]); }, [index, characters, setSelectedCharacter]);

  const current = characters[index];
  const prev = characters[(index - 1 + characters.length) % characters.length];
  const next = characters[(index + 1) % characters.length];

  const mageSrc = (id) => `/mages/${id}.png`;

  const animationComponents = {
    space: SpaceAdventureAnimation,
    animals: AnimalFriendsAnimation,
    sports: SportsHeroAnimation,
    tech: TechWizardAnimation,
    art: CreativeArtistAnimation,
    nature: NatureExplorerAnimation
  };
  const AnimationComponent = animationComponents[selectedInterest];

  return (
    <div className="fixed inset-0 overflow-hidden z-30">
      <div className="absolute inset-0 -z-10">
        {AnimationComponent && <AnimationComponent isActive={true} />}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Full-screen immersive animation area (top header) */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex space-x-3 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl">
          <span className="w-4 h-1 bg-white/60 rounded" />
          <span className="w-4 h-1 bg-white/60 rounded" />
          <span className="w-4 h-1 bg-white/60 rounded" />
          <span className="w-4 h-1 bg-white/60 rounded" />
        </div>
        <div className="mt-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">Choose Your Character</h2>
          <p className="text-white/80">Swipe left or right to preview, then select your guide</p>
        </div>
      </div>

      <button onClick={() => setStage('interests')} className="absolute top-6 left-6 text-white/90 hover:text-white z-30">Back</button>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] max-w-3xl h-[55%] rounded-[50%] bg-gradient-radial from-white/25 via-white/8 to-transparent blur-2xl" />

        <div className="relative w-full max-w-6xl px-6 md:px-10 flex items-center justify-between">
          {/* Left (prev) */}
          <div className="w-1/3 flex items-center justify-start">
            <div className="relative w-56 h-72 md:w-64 md:h-80 opacity-40 grayscale contrast-75">
              <img src={mageSrc(prev.id)} alt={prev.name} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Center (animated) */}
          <div className="w-1/3 flex flex-col items-center justify-center gap-4">
            <div className="relative w-64 h-80 md:w-80 md:h-[28rem]">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={current.id}
                  src={mageSrc(current.id)}
                  alt={current.name}
                  custom={direction}
                  initial={{ x: direction >= 0 ? 100 : -100, opacity: 0.4, scale: 0.95 }}
                  animate={{ x: 0, opacity: 1, scale: 1.05 }}
                  exit={{ x: direction >= 0 ? -100 : 100, opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_25px_40px_rgba(255,255,255,0.25)]"
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute -inset-6 bg-gradient-radial from-white/25 via-transparent to-transparent blur-sm" />
              <div className="pointer-events-none absolute inset-0 rounded-[45%] shadow-[0_0_80px_20px_rgba(255,255,255,0.12)]" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white">{current.name}</h3>
              <p className="text-sm md:text-base text-gray-200/80">{current.trait}</p>
            </div>
          </div>

          {/* Right (next) */}
          <div className="w-1/3 flex items-center justify-end">
            <div className="relative w-56 h-72 md:w-64 md:h-80 opacity-40 grayscale contrast-75">
              <img src={mageSrc(next.id)} alt={next.name} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* Arrow controls */}
        <button onClick={() => { playSwipeSound(); setDirection(-1); setIndex((index - 1 + characters.length) % characters.length); }} className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-4 rounded-full backdrop-blur-md border border-white/20 hover:scale-110 shadow-2xl"> <ChevronLeft className="w-8 h-8" /> </button>
        <button onClick={() => { playSwipeSound(); setDirection(1); setIndex((index + 1) % characters.length); }} className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-4 rounded-full backdrop-blur-md border border-white/20 hover:scale-110 shadow-2xl"> <ChevronRight className="w-8 h-8" /> </button>

        {/* Selection panel */}
        <div className="absolute bottom-8 left-8 right-8 max-w-3xl mx-auto bg-black/30 backdrop-blur-xl rounded-3xl p-6 text-white border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-7 h-7" />
              <div>
                <h3 className="text-2xl font-bold">{current.name}</h3>
                <p className="text-sm text-white/80">{current.trait}</p>
              </div>
            </div>
            <button onClick={() => setSelectedCharacter(current)} className="px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-white to-gray-100 text-gray-800">Select</button>
          </div>
        </div>

        {/* Start CTA */}
        <div className="absolute bottom-4 right-6">
          <button onClick={() => { playEnterSound(); startStory(); }} disabled={!selectedCharacter} className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-full shadow-lg hover:bg-primary/90 disabled:opacity-50">Start Adventure →</button>
        </div>
      </div>
    </div>
  );
};

export default CharacterSelector;