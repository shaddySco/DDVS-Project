import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button' 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neon-purple text-white shadow-neon-purple hover:bg-neon-purple/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(188,19,254,0.7)]",
    secondary: "bg-neon-blue text-black shadow-neon-blue hover:bg-neon-blue/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,243,255,0.7)]",
    glass: "bg-glass-light border border-glass-medium text-white hover:bg-glass-medium backdrop-blur-sm",
    danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3 text-lg"
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
