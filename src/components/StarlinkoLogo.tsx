import React from 'react';

interface StarlinkoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const StarlinkoLogo: React.FC<StarlinkoLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo SVG */}
      <div className={`${sizeClasses[size]} mr-2 flex-shrink-0`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="50%" stopColor="#34A853" />
              <stop offset="100%" stopColor="#FBBC05" />
            </linearGradient>
            <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EA4335" />
              <stop offset="100%" stopColor="#FBBC05" />
            </linearGradient>
          </defs>
          
          {/* Star shape */}
          <path
            d="M20 2 L24.5 14 L38 14 L28 22 L32 34 L20 26 L8 34 L12 22 L2 14 L15.5 14 Z"
            fill="url(#starGradient)"
            className="drop-shadow-sm"
          />
          
          {/* Link/connection elements */}
          <circle cx="12" cy="28" r="2" fill="url(#linkGradient)" opacity="0.8" />
          <circle cx="28" cy="28" r="2" fill="url(#linkGradient)" opacity="0.8" />
          <line x1="14" y1="28" x2="26" y2="28" stroke="url(#linkGradient)" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>
      
      {/* Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          Starlinko
        </span>
      )}
    </div>
  );
};

export default StarlinkoLogo;