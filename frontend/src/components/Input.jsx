import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  return (
    <motion.div 
      className={`relative ${className}`}
      whileFocus={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300/80">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full py-3 bg-white/10 backdrop-blur-lg border border-white/20 
          rounded-xl text-white placeholder-purple-200/70 focus:outline-none 
          focus:ring-2 focus:ring-yellow-300/50 focus:border-yellow-300/50 
          focus:bg-white/15 hover:bg-white/12
          transition-all duration-300 text-sm
          ${Icon ? 'pl-12 pr-4' : 'px-4'}
        `}
        {...props}
      />
    </motion.div>
  );
};

export default Input;