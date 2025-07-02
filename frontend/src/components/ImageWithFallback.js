import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  fallbackSrc, 
  alt, 
  className, 
  style,
  movieConfig,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (hasError) {
    // Show a styled placeholder if all images fail
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900`}
        style={style}
      >
        <div className="text-center p-6">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: movieConfig?.accent_color || '#ef4444' }}
          >
            🎬
          </div>
          <p className="text-white font-medium text-lg">
            {movieConfig?.movie_title || 'Movie'}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {movieConfig?.movie_subtitle || 'Coming Soon'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`${className} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse`}
          style={style}
        >
          <div 
            className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin"
            style={{ borderTopColor: movieConfig?.accent_color || '#ef4444' }}
          />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={className}
        style={style}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default ImageWithFallback;