import React, { useState, useEffect } from 'react';

const AnimatedBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 40,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15
    }));
    setParticles(newParticles);
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const emojis = ['🎮', '🎯', '🏆', '⚡', '🎪', '🎨', '🎭', '🎸', '🚀', '🌟', '💎', '🔥'];

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden z-0" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Interactive cursor glow */}
      <div 
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl transition-all duration-300 ease-out pointer-events-none"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      {/* Floating particles with emojis */}
      {particles.map((particle, idx) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            fontSize: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            opacity: 0.15
          }}
        >
          {emojis[idx % emojis.length]}
        </div>
      ))}

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>

      {/* Shooting stars */}
      <div className="absolute top-10 left-1/4 w-2 h-2 bg-white rounded-full animate-shooting-star"></div>
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full animate-shooting-star" style={{animationDelay: '3s'}}></div>
      <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-white rounded-full animate-shooting-star" style={{animationDelay: '6s'}}></div>

      <style>{`
        @keyframes float-particle {
          0%, 100% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% { 
            transform: translate(30px, -40px) rotate(90deg) scale(1.1);
          }
          50% { 
            transform: translate(-20px, -80px) rotate(180deg) scale(0.9);
          }
          75% { 
            transform: translate(-40px, -40px) rotate(270deg) scale(1.05);
          }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(50px, -50px) scale(1.2) rotate(120deg); }
          66% { transform: translate(-30px, 30px) scale(0.8) rotate(240deg); }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes shooting-star {
          0% { 
            transform: translate(0, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translate(300px, 300px);
            opacity: 0;
          }
        }
        .animate-float-particle { 
          animation: float-particle infinite ease-in-out; 
        }
        .animate-blob { 
          animation: blob 12s infinite ease-in-out; 
        }
        .animate-shooting-star {
          animation: shooting-star 8s infinite ease-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-6000 { animation-delay: 6s; }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;