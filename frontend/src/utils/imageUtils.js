import { IMAGE_BASE_URL } from './constants';

/**
 * Get full image URL from relative path
 * @param {string} imagePath - Relative or absolute image path
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /, it's a relative path from server root
  if (imagePath.startsWith('/')) {
    return `${IMAGE_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's relative and add base URL
  return `${IMAGE_BASE_URL}/${imagePath}`;
};

/**
 * Handle image load error with fallback
 * @param {Event} event - Image error event
 * @param {string} fallback - Fallback image URL
 */
export const handleImageError = (event, fallback = 'https://via.placeholder.com/300x200?text=No+Image') => {
  if (event.target.src !== fallback) {
    event.target.src = fallback;
  }
};

