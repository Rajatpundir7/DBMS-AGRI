import React, { useState } from 'react';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  fallback = 'https://via.placeholder.com/300x200?text=No+Image',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(getImageUrl(src));

  const onError = (e) => {
    if (e.target.src !== fallback) {
      setImgSrc(fallback);
    }
  };

  if (!src) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={onError}
      {...props}
    />
  );
};

export default ImageWithFallback;

