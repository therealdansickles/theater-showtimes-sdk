import React, { useState } from 'react';
import { useAuth } from './AuthContext';

// Main Header Component
export const Header = ({ movieConfig }) => {
  const accentColor = movieConfig?.accent_color || '#ef4444';
  const { isAuthenticated, isAdmin } = useAuth();
  
  return (
    <header className="bg-black text-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            {movieConfig?.logo_image && (
              <img 
                src={process.env.REACT_APP_BACKEND_URL + movieConfig.logo_image} 
                alt="Logo" 
                className="h-8 w-auto"
              />
            )}
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
              {movieConfig?.movie_title || 'F1'}
            </div>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="transition-colors" style={{ color: 'white' }} 
               onMouseEnter={(e) => e.target.style.color = accentColor}
               onMouseLeave={(e) => e.target.style.color = 'white'}>
              Home
            </a>
            <a href="#" className="transition-colors" style={{ color: 'white' }}
               onMouseEnter={(e) => e.target.style.color = accentColor}
               onMouseLeave={(e) => e.target.style.color = 'white'}>
              Videos
            </a>
            <a href="#" className="transition-colors" style={{ color: 'white' }}
               onMouseEnter={(e) => e.target.style.color = accentColor}
               onMouseLeave={(e) => e.target.style.color = 'white'}>
              Get Tickets
            </a>
            {/* Setup wizard for film teams - only show for authenticated admins */}
            {isAuthenticated() && isAdmin() && (
              <a href="/setup" className="transition-colors" style={{ color: 'white' }}
                 onMouseEnter={(e) => e.target.style.color = accentColor}
                 onMouseLeave={(e) => e.target.style.color = 'white'}>
                <span className="flex items-center">
                  <span className="mr-1">🎬</span>
                  Setup Film
                </span>
              </a>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search button */}
          <button className="p-2 transition-colors" style={{ color: 'white' }}
                  onMouseEnter={(e) => e.target.style.color = accentColor}
                  onMouseLeave={(e) => e.target.style.color = 'white'}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </button>
          {/* Hidden admin access for development */}
          {isAuthenticated() && isAdmin() && (
            <a href="/admin" className="opacity-30 hover:opacity-100 transition-opacity text-xs">
              Admin
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

// Hero Section with New Layout - Poster, Text, Showtimes
export const HeroSection = ({ movieConfig }) => {
  const heroImage = movieConfig?.hero_image 
    ? process.env.REACT_APP_BACKEND_URL + movieConfig.hero_image
    : 'https://images.pexels.com/photos/19263380/pexels-photo-19263380.jpeg';
  
  const posterImage = movieConfig?.poster_image
    ? process.env.REACT_APP_BACKEND_URL + movieConfig.poster_image
    : 'https://images.pexels.com/photos/30619403/pexels-photo-30619403.jpeg';

  const accentColor = movieConfig?.accent_color || '#ef4444';
  
  // Get badges from film assets
  const badges = movieConfig?.film_assets?.badge_images || [];
  
  return (
    <div className="relative text-white overflow-hidden" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      
      {/* New Three-Column Layout */}
      <div className="relative z-10 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left - Poster (2:3 aspect ratio) */}
            <div className="lg:col-span-3">
              <div className="relative">
                <img 
                  src={posterImage}
                  alt="Movie Poster" 
                  className="w-full aspect-[2/3] object-cover rounded-lg shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.25))',
                    maxWidth: '300px',
                    margin: '0 auto'
                  }}
                />
              </div>
            </div>

            {/* Middle - Film Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: movieConfig?.text_color || '#ffffff' }}>
                  <span style={{ color: accentColor }}>{movieConfig?.movie_title || 'F1'}</span>
                  {movieConfig?.movie_subtitle && (
                    <span className="block text-2xl lg:text-3xl mt-2 font-normal opacity-80">
                      {movieConfig.movie_subtitle}
                    </span>
                  )}
                </h1>
                
                <p className="text-lg leading-relaxed mb-6" style={{ color: movieConfig?.text_color || '#ffffff', opacity: 0.9 }}>
                  {movieConfig?.film_details?.logline || movieConfig?.description || 'From the director of Top Gun: Maverick comes an adrenaline-fueled experience starring Brad Pitt. Witness the high-octane world of Formula 1 racing like never before.'}
                </p>
              </div>

              {/* Dynamic Badge Strip */}
              {badges.length > 0 ? (
                <div className="flex flex-wrap gap-3 mb-6">
                  {badges.map((badgeUrl, index) => (
                    <img 
                      key={index}
                      src={process.env.REACT_APP_BACKEND_URL + badgeUrl}
                      alt={`Badge ${index + 1}`}
                      className="h-12 w-auto object-contain"
                      style={{ maxWidth: '140px' }}
                    />
                  ))}
                </div>
              ) : (
                /* Fallback badges if none uploaded */
                <div className="flex flex-col space-y-3 mb-6">
                  <div className="text-xl font-semibold">
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded font-bold">
                      🎬 NOW PLAYING
                    </span>
                  </div>
                  <div className="text-lg">
                    <span className="bg-gray-800 px-4 py-2 rounded">ONLY IN THEATERS</span>
                  </div>
                  <div className="text-lg font-bold">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded">
                      FILMED FOR IMAX
                    </span>
                  </div>
                </div>
              )}

              {/* Optional CTA */}
              {movieConfig?.film_assets?.trailer_url && (
                <div>
                  <a 
                    href={movieConfig.film_assets.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                    style={{ 
                      backgroundColor: accentColor,
                      color: 'white'
                    }}
                  >
                    <span className="mr-2">▶️</span>
                    Watch Trailer
                  </a>
                </div>
              )}
            </div>

            {/* Right - Showtimes Panel */}
            <div className="lg:col-span-4">
              <div className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: accentColor }}>
                  Now Playing
                </h2>
                <div className="text-center text-gray-300 mb-4">
                  <p className="text-sm">Select your preferred theater and showtime</p>
                </div>
                {/* Showtime filtering and list will be handled by SearchFilter component */}
                <div className="text-center">
                  <button 
                    className="w-full py-3 rounded-lg font-semibold transition-colors"
                    style={{ 
                      backgroundColor: accentColor,
                      color: 'white'
                    }}
                    onClick={() => {
                      // Scroll to theater listings
                      const theatersSection = document.querySelector('.theater-listings');
                      if (theatersSection) {
                        theatersSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    Find Showtimes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
