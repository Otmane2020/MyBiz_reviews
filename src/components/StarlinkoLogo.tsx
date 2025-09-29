import React from 'react';

interface StarlinkoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showGoogleIcon?: boolean;
  className?: string;
  onClick?: () => void;
}

const StarlinkoLogo: React.FC<StarlinkoLogoProps> = ({ 
  size = 'md', 
  showText = true, 
  showGoogleIcon = false,
  className = '',
  onClick
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

  const Component = onClick ? 'button' : 'div';

  return (
    <Component 
      className={`flex items-center ${onClick ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Logo SVG - Étoile avec dégradé Google */}
      <div className={`${sizeClasses[size]} mr-2 flex-shrink-0`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <defs>
            <linearGradient id="googleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="33%" stopColor="#DB4437" />
              <stop offset="66%" stopColor="#F4B400" />
              <stop offset="100%" stopColor="#0F9D58" />
            </linearGradient>
          </defs>
          {/* Étoile avec dégradé Google */}
          <path
            d="M20 2 L24.5 14 L38 14 L28 22 L32 34 L20 26 L8 34 L12 22 L2 14 L15.5 14 Z"
            fill="url(#googleGradient)"
            className="drop-shadow-sm"
          />
        </svg>
      </div>
      
      {/* Text Starlinko */}
      {showText && (
        <span className={`font-bold text-gray-900 ${textSizeClasses[size]}`}>
          Starlinko
        </span>
      )}
      
      {/* Google Icon à droite (optionnel) */}
      {showGoogleIcon && (
        <div className="ml-3 flex-shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </div>
      )}
    </Component>
  );
};

export default StarlinkoLogo;