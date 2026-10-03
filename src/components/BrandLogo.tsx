import React from 'react';

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  alt = 'Learn Chess logo',
}) => (
  <img
    src="/chess-logo.png"
    alt={alt}
    className={`block object-cover ${className}`}
  />
);
