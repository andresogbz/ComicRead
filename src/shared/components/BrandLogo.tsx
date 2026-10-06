import React from 'react';
import { useThemeStore } from '../../core/theme/useThemeStore';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDot?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const { primaryColor } = useThemeStore();

  const sizeStyles = {
    sm: 'text-xl tracking-tight',
    md: 'text-2xl sm:text-3xl tracking-tight',
    lg: 'text-4xl sm:text-5xl tracking-tight',
    xl: 'text-5xl sm:text-6xl tracking-tight',
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5 ml-1 mb-0.5',
    md: 'h-2 w-2 ml-1.5 mb-0.5',
    lg: 'h-2.5 w-2.5 ml-2 mb-1',
    xl: 'h-3.5 w-3.5 ml-2.5 mb-1',
  };

  return (
    <div
      className={`inline-flex items-center font-brand font-medium select-none ${sizeStyles[size]} ${className}`}
    >
      <span
        className="transition-opacity hover:opacity-90"
        style={{ color: 'var(--text-title)' }}
      >
        Go
      </span>
      {showDot && (
        <span
          className={`inline-block rounded-full transition-colors ${dotSizes[size]}`}
          style={{ backgroundColor: primaryColor.hex }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
