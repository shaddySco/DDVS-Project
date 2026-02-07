import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  icon = null
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wide relative overflow-hidden group";

  const variants = {
    primary: "bg-neon-blue text-black shadow-neon-blue hover:bg-white hover:scale-105",
    secondary: "bg-neon-purple text-white shadow-neon-purple hover:bg-neon-purple/80 hover:scale-105",
    accent: "bg-neon-pink text-white shadow-[0_0_15px_rgba(255,0,60,0.5)] hover:bg-neon-pink/80 hover:scale-105",
    glass: "bg-glass-light border border-glass-stroke text-white hover:bg-glass-medium hover:border-neon-blue/50 backdrop-blur-md",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    outline: "border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Hover Glare Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>

      <span className="relative z-20 flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {children}
      </span>
    </button>
  );
};

export default Button;
