import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { playSwipeSound } from '../utils/soundUtils';

// CSS styles for door animations
const doorStyles = `
.door-section {
  transition: all 0.3s ease !important;
}

.door-section.active {
  transform: scale(1.05) !important;
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2) !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.door-rotation {
  transform-style: preserve-3d;
  perspective: 1000px;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = doorStyles;
  document.head.appendChild(styleSheet);
}

// Simplified character component without Three.js for testing
function Character({ index, isKicking }) {
  const getCharacterEmoji = (index) => {
    switch (index) {
      case 0: return '🗡️'; // Adventure
      case 1: return '📖'; // Continue
      case 2: return '✍️'; // Share
      default: return '🗡️';
    }
  };

  return (
    <div className={`character-avatar ${isKicking ? 'kicking' : ''}`}>
      <span style={{ fontSize: '3rem' }}>{getCharacterEmoji(index)}</span>
    </div>
  );
}

// Door component with door.png image and sound effects
function Door({ title, index, onNavigate, isActive }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isKicking, setIsKicking] = useState(false);
  const doorRef = React.useRef(null);

  const playDoorSound = () => {
    try {
      const audio = new Audio('/opening-door-411632.mp3');
      audio.volume = 0.5; // Adjust volume
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio loading failed:', e);
    }
  };

  const handleClick = () => {
    playDoorSound();
    
    if (index === 0) {
      setIsKicking(true);
    }
    
    setIsOpen(true);
    setTimeout(() => {
      setIsOpen(false);
      // Navigate based on door index
      if (index === 0) {
        onNavigate('interests'); // Start adventure
      } else if (index === 1) {
        onNavigate('adventures'); // Continue adventure
      } else if (index === 2) {
        onNavigate('blog'); // Share experience
      }
    }, 1500);
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isActive) {
      e.preventDefault();
      handleClick();
    }
  };

  // Focus the door when it becomes active
  React.useEffect(() => {
    if (isActive && doorRef.current) {
      doorRef.current.focus();
    }
  }, [isActive]);

  return (
    <div 
      ref={doorRef}
      className={`door-section ${isActive ? 'active' : ''}`} 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '2rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flex: '0 0 auto',
        outline: 'none',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.4))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
        e.currentTarget.style.filter = 'brightness(1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
      }}
      onFocus={(e) => {
        e.target.style.transform = 'scale(1.05)';
        e.target.style.filter = 'brightness(1.1) drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))';
      }}
      onBlur={(e) => {
        e.target.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
        e.target.style.filter = 'brightness(1) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))';
      }}
    >
      {/* Door Image */}
      <img
        src="/door.png"
        alt="Adventure Door"
        style={{
          width: '200px',
          height: '250px',
          objectFit: 'contain',
          transition: 'transform 0.8s ease',
          transform: isOpen ? 'rotateY(90deg)' : 'rotateY(0deg)',
          transformOrigin: 'left center',
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
          pointerEvents: 'none'
        }}
      />
      
      {/* Character appears when door opens */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          fontSize: '4rem',
          animation: 'fadeIn 0.5s ease-in-out',
          pointerEvents: 'none'
        }}>
          <Character index={index} isKicking={isKicking} />
        </div>
      )}
      
      {/* Title text at bottom */}
      <h3 style={{ 
        color: 'white', 
        fontSize: '1.2rem', 
        fontWeight: 'bold', 
        marginTop: '1rem',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'none'
      }}>{title}</h3>
    </div>
  );
}

const AdventureDoors = ({ onNavigate }) => {
  const [currentDoor, setCurrentDoor] = useState(0);
  
  const doors = [
    { title: "START ADVENTURE", index: 0 },
    { title: "CONTINUE ADVENTURE", index: 1 },
    { title: "SHARE EXPERIENCE", index: 2 }
  ];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        playSwipeSound();
        setCurrentDoor((prev) => (prev - 1 + doors.length) % doors.length);
      } else if (event.key === 'ArrowRight') {
        playSwipeSound();
        setCurrentDoor((prev) => (prev + 1) % doors.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [doors.length]);

  const navigateDoor = (direction) => {
    playSwipeSound(); // Play swipe sound for mouse navigation
    if (direction === 'left') {
      setCurrentDoor((prev) => (prev - 1 + doors.length) % doors.length);
    } else {
      setCurrentDoor((prev) => (prev + 1) % doors.length);
    }
  };

  return (
    <div className="adventure-doors-container" style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '500px',
      gap: '1rem',
      flexWrap: 'nowrap',
      padding: '2rem',
      overflowX: 'auto'
    }}>
      {/* All Three Doors */}
      {doors.map((door, index) => (
        <Door 
          key={index}
          title={door.title} 
          index={door.index} 
          onNavigate={onNavigate}
          isActive={index === currentDoor}
        />
      ))}

      {/* Navigation arrows for keyboard highlight effect */}
      <button 
        onClick={() => navigateDoor('left')}
        aria-label="Previous door"
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.3s ease',
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        <ChevronLeft size={24} color="white" />
      </button>
      
      <button 
        onClick={() => navigateDoor('right')}
        aria-label="Next door"
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          transition: 'all 0.3s ease',
          opacity: 0.7
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        <ChevronRight size={24} color="white" />
      </button>

      {/* Door indicators for keyboard navigation */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '0.5rem'
      }}>
        {doors.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentDoor(index)}
            aria-label={`Highlight door ${index + 1}`}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              background: index === currentDoor ? 'white' : 'rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AdventureDoors;