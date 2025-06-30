import React from 'react';
import { motion } from 'framer-motion';
import { MovieConfig, MovieHeroProps } from '../types';
import { optimizeImageUrl, generateGradientCSS } from '../utils';
import { ANIMATION_PRESETS } from '../constants';

export const MovieHero: React.FC<MovieHeroProps> = ({
  movie,
  theme,
  onBookNowClick,
  showTrailer = false,
  className = '',
  mobileOptimized = true
}) => {
  const heroImage = movie.hero_image 
    ? optimizeImageUrl(movie.hero_image, { width: 1920, quality: 85, format: 'webp' })
    : 'https://images.pexels.com/photos/19263380/pexels-photo-19263380.jpeg';
  
  const posterImage = movie.poster_image
    ? optimizeImageUrl(movie.poster_image, { width: 400, quality: 90, format: 'webp' })
    : 'https://images.pexels.com/photos/30619403/pexels-photo-30619403.jpeg';

  const primaryGradient = movie.primary_gradient || { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'], stops: [0, 100] };
  const primaryButton = movie.primary_button || { background_color: '#ef4444', text_color: '#ffffff', border_radius: 8, emoji: '🎬', emoji_position: 'left' };

  const renderButton = (buttonConfig: typeof primaryButton, text: string) => {
    const buttonStyle = {
      backgroundColor: buttonConfig.background_color,
      color: buttonConfig.text_color,
      borderRadius: `${buttonConfig.border_radius}px`,
      border: 'none',
      padding: mobileOptimized ? '12px 24px' : '16px 32px',
      fontSize: mobileOptimized ? '16px' : '18px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.3s ease',
      minHeight: mobileOptimized ? '44px' : '48px'
    };

    const emojiElement = buttonConfig.emoji && (
      <span className={`emoji-${buttonConfig.emoji_position}`}>
        {buttonConfig.emoji}
      </span>
    );

    return (
      <motion.button
        style={buttonStyle}
        onClick={onBookNowClick}
        whileHover={{ scale: 1.05, brightness: 1.1 }}
        whileTap={{ scale: 0.95 }}
        {...ANIMATION_PRESETS.SCALE_IN}
      >
        {buttonConfig.emoji_position === 'left' && emojiElement}
        {buttonConfig.emoji_position === 'top' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {emojiElement}
            <span>{text}</span>
          </div>
        )}
        {(!buttonConfig.emoji || ['left', 'right', 'bottom'].includes(buttonConfig.emoji_position)) && (
          <span>{text}</span>
        )}
        {buttonConfig.emoji_position === 'right' && emojiElement}
        {buttonConfig.emoji_position === 'bottom' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span>{text}</span>
            {emojiElement}
          </div>
        )}
      </motion.button>
    );
  };

  const containerStyle = {
    position: 'relative' as const,
    backgroundColor: movie.background_color || '#000000',
    color: movie.text_color || '#ffffff',
    overflow: 'hidden',
    minHeight: mobileOptimized ? '100vh' : '80vh'
  };

  const backgroundStyle = {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage: `url('${heroImage}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.3,
    zIndex: 0
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: mobileOptimized ? '24px 16px' : '48px 24px',
    minHeight: 'inherit',
    flexDirection: mobileOptimized ? 'column' as const : 'row' as const,
    gap: mobileOptimized ? '32px' : '48px'
  };

  const leftContentStyle = {
    flex: 1,
    maxWidth: mobileOptimized ? '100%' : '50%',
    textAlign: mobileOptimized ? 'center' as const : 'left' as const
  };

  const rightContentStyle = {
    flex: mobileOptimized ? 'none' : 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const titleStyle = {
    fontSize: mobileOptimized ? '2.5rem' : movie.typography?.heading_font_size || '4rem',
    fontWeight: 800,
    marginBottom: '16px',
    lineHeight: 1.1,
    fontFamily: movie.typography?.font_family || 'Inter, sans-serif'
  };

  const descriptionStyle = {
    fontSize: mobileOptimized ? '16px' : '18px',
    lineHeight: 1.6,
    marginBottom: '32px',
    opacity: 0.9,
    maxWidth: mobileOptimized ? '100%' : '600px'
  };

  return (
    <div className={`movie-hero ${className}`} style={containerStyle}>
      {/* Background Image */}
      <div style={backgroundStyle} />
      
      {/* Content */}
      <div style={contentStyle}>
        {/* Left Side - Movie Info */}
        <motion.div 
          style={leftContentStyle}
          {...ANIMATION_PRESETS.SLIDE_UP}
          transition={{ delay: 0.2 }}
        >
          {/* Logo */}
          {movie.logo_image && (
            <motion.div 
              style={{ marginBottom: '24px' }}
              {...ANIMATION_PRESETS.FADE_IN}
              transition={{ delay: 0.1 }}
            >
              <img 
                src={optimizeImageUrl(movie.logo_image, { width: 200, quality: 90 })}
                alt="Movie Logo" 
                style={{ 
                  width: mobileOptimized ? '120px' : '160px', 
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </motion.div>
          )}

          {/* Title */}
          <motion.h1 
            style={titleStyle}
            {...ANIMATION_PRESETS.SLIDE_UP}
            transition={{ delay: 0.3 }}
          >
            <span style={{ color: movie.accent_color || '#ef4444' }}>
              {movie.movie_title || 'Movie Title'}
            </span>
            {movie.movie_subtitle && (
              <span style={{ marginLeft: mobileOptimized ? '0' : '16px', display: mobileOptimized ? 'block' : 'inline' }}>
                {movie.movie_subtitle}
              </span>
            )}
          </motion.h1>

          {/* Description */}
          <motion.p 
            style={descriptionStyle}
            {...ANIMATION_PRESETS.SLIDE_UP}
            transition={{ delay: 0.4 }}
          >
            {movie.description || 'Movie description goes here.'}
          </motion.p>

          {/* Movie Details */}
          <motion.div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '32px',
              justifyContent: mobileOptimized ? 'center' : 'flex-start'
            }}
            {...ANIMATION_PRESETS.SLIDE_UP}
            transition={{ delay: 0.5 }}
          >
            {movie.rating && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {movie.rating}
              </div>
            )}
            {movie.runtime && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {movie.runtime}
              </div>
            )}
            {movie.genre && movie.genre.slice(0, 2).map((genre, index) => (
              <div 
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                {genre}
              </div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            style={{ 
              display: 'flex', 
              flexDirection: mobileOptimized ? 'column' : 'row',
              gap: '16px',
              alignItems: mobileOptimized ? 'center' : 'flex-start'
            }}
            {...ANIMATION_PRESETS.SLIDE_UP}
            transition={{ delay: 0.6 }}
          >
            {renderButton(primaryButton, 'Book Now')}
            
            {showTrailer && (
              <motion.button
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: movie.text_color || '#ffffff',
                  border: `2px solid ${movie.accent_color || '#ef4444'}`,
                  borderRadius: '8px',
                  padding: mobileOptimized ? '12px 24px' : '16px 32px',
                  fontSize: mobileOptimized ? '16px' : '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  minHeight: mobileOptimized ? '44px' : '48px',
                  backdropFilter: 'blur(10px)'
                }}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                ▶️ Watch Trailer
              </motion.button>
            )}
          </motion.div>

          {/* Additional Info Badges */}
          <motion.div 
            style={{ 
              display: 'flex',
              flexDirection: mobileOptimized ? 'column' : 'row',
              gap: '12px',
              marginTop: '24px',
              alignItems: mobileOptimized ? 'center' : 'flex-start'
            }}
            {...ANIMATION_PRESETS.SLIDE_UP}
            transition={{ delay: 0.7 }}
          >
            <div style={{
              background: generateGradientCSS(primaryGradient),
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Now Playing
            </div>
            
            <div style={{
              background: 'rgba(128, 128, 128, 0.8)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Only in Theaters
            </div>
            
            <div style={{
              background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
              color: '#000000',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              Filmed for IMAX
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Movie Poster */}
        <motion.div 
          style={rightContentStyle}
          {...ANIMATION_PRESETS.SLIDE_LEFT}
          transition={{ delay: 0.4 }}
        >
          <div style={{ position: 'relative' }}>
            <motion.img 
              src={posterImage}
              alt="Movie Poster" 
              style={{ 
                width: mobileOptimized ? '280px' : '400px',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                objectFit: 'cover'
              }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              transition={{ duration: 0.3 }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)',
              borderRadius: '12px',
              pointerEvents: 'none'
            }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};