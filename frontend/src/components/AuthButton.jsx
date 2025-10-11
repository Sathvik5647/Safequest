import React from 'react';
import { motion } from 'framer-motion';

const AuthButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  className = '',
  disabled = false,
  ...props 
}) => {
  const baseClasses = `
    w-full px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 
      hover:from-yellow-300 hover:to-yellow-200 focus:ring-yellow-300
      shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-white/10 backdrop-blur-lg border border-white/30 text-white 
      hover:bg-white/20 hover:border-white/40 focus:ring-white/50
    `,
    outline: `
      border-2 border-yellow-300 text-yellow-300 bg-transparent
      hover:bg-yellow-300 hover:text-gray-900 focus:ring-yellow-300
    `
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AuthButton;