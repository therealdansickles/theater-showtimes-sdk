import React, { useState } from 'react';

// Main Header Component
export const Header = ({ movieConfig }) => {
  const accentColor = movieConfig?.accent_color || '#ef4444';
  
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
            <a href="#" className="transition-colors" style={{ color: 'white' }} 
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
            <a href="/admin" className="transition-colors" style={{ color: 'white' }}
               onMouseEnter={(e) => e.target.style.color = accentColor}
               onMouseLeave={(e) => e.target.style.color = 'white'}>
              Admin
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 transition-colors" style={{ color: 'white' }}
                  onMouseEnter={(e) => e.target.style.color = accentColor}
                  onMouseLeave={(e) => e.target.style.color = 'white'}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </button>
          <button className="p-2 transition-colors" style={{ color: 'white' }}
                  onMouseEnter={(e) => e.target.style.color = accentColor}
                  onMouseLeave={(e) => e.target.style.color = 'white'}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
          </button>
          <button className="p-2 transition-colors" style={{ color: 'white' }}
                  onMouseEnter={(e) => e.target.style.color = accentColor}
                  onMouseLeave={(e) => e.target.style.color = 'white'}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

// Hero Section with Movie Poster
export const HeroSection = ({ movieConfig }) => {
  const heroImage = movieConfig?.hero_image 
    ? process.env.REACT_APP_BACKEND_URL + movieConfig.hero_image
    : 'https://images.pexels.com/photos/19263380/pexels-photo-19263380.jpeg';
  
  const posterImage = movieConfig?.poster_image
    ? process.env.REACT_APP_BACKEND_URL + movieConfig.poster_image
    : 'https://images.pexels.com/photos/30619403/pexels-photo-30619403.jpeg';

  const primaryGradient = movieConfig?.primary_gradient || { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'] };
  const accentColor = movieConfig?.accent_color || '#ef4444';
  const primaryButton = movieConfig?.primary_button || { background_color: '#ef4444', text_color: '#ffffff', border_radius: 8, emoji: '🎬', emoji_position: 'left' };

  const renderButton = (buttonConfig, text, bgClass = '') => {
    const buttonStyle = {
      backgroundColor: buttonConfig.background_color,
      color: buttonConfig.text_color,
      borderRadius: `${buttonConfig.border_radius}px`
    };

    const emojiElement = buttonConfig.emoji && (
      <span className={`${buttonConfig.emoji_position === 'right' ? 'ml-2' : 'mr-2'}`}>
        {buttonConfig.emoji}
      </span>
    );

    return (
      <span style={buttonStyle} className={`px-4 py-2 rounded font-semibold ${bgClass}`}>
        {buttonConfig.emoji_position === 'left' && emojiElement}
        {text}
        {buttonConfig.emoji_position === 'right' && emojiElement}
      </span>
    );
  };

  return (
    <div className="relative text-white overflow-hidden" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url('${heroImage}')` }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between px-6 py-12 min-h-screen">
        {/* Left Side - Movie Info */}
        <div className="flex-1 max-w-2xl">
          <div className="mb-6">
            {movieConfig?.logo_image && (
              <img 
                src={process.env.REACT_APP_BACKEND_URL + movieConfig.logo_image} 
                alt="Movie Logo" 
                className="w-32 h-32 object-contain"
              />
            )}
          </div>
          <h1 className="text-6xl font-bold mb-4" style={{ color: movieConfig?.text_color || '#ffffff' }}>
            <span style={{ color: accentColor }}>{movieConfig?.movie_title || 'F1'}</span>
            {movieConfig?.movie_subtitle && (
              <span className="ml-4">{movieConfig.movie_subtitle}</span>
            )}
          </h1>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: movieConfig?.text_color || '#ffffff', opacity: 0.8 }}>
            {movieConfig?.description || 'From the director of Top Gun: Maverick comes an adrenaline-fueled experience starring Brad Pitt. Witness the high-octane world of Formula 1 racing like never before.'}
          </p>
          <div className="flex flex-col space-y-4">
            <div className="text-2xl font-semibold">
              {renderButton(primaryButton, 'NOW PLAYING')}
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
        </div>

        {/* Right Side - Movie Poster */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <img 
              src={posterImage}
              alt="Movie Poster" 
              className="w-96 h-auto rounded-lg shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-lg"/>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search and Filter Component
export const SearchFilter = ({ selectedLocation, setSelectedLocation, selectedFormats, setSelectedFormats, selectedDay, setSelectedDay, selectedTime, setSelectedTime }) => {
  const formats = ['IMAX 2D', 'AMC PRIME', '2D', 'DOLBY', 'MX4D', 'SCREENX'];
  const days = [
    { day: 'SAT', date: 'JUN', num: '28' },
    { day: 'SUN', date: 'JUN', num: '29' },
    { day: 'MON', date: 'JUL', num: '1' },
    { day: 'TUE', date: 'JUL', num: '2' },
    { day: 'WED', date: 'JUL', num: '3' }
  ];

  const handleFormatChange = (format) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  return (
    <div className="bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Search Location */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">SEARCH</h3>
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="COUNCIL BLUFFS, IA"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 flex-1 text-white placeholder-gray-400"
            />
            <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors">
              🔍
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">SELECT A PREFERRED FORMAT</h3>
            <div className="space-y-2">
              {formats.map((format) => (
                <label key={format} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedFormats.includes(format)}
                    onChange={() => handleFormatChange(format)}
                    className="form-checkbox text-red-500"
                  />
                  <span className="text-sm">{format}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Day Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">SELECT A DAY</h3>
            <div className="flex space-x-2">
              {days.map((dayObj, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(dayObj)}
                  className={`flex flex-col items-center p-3 rounded border ${
                    selectedDay?.num === dayObj.num 
                      ? 'bg-orange-500 border-orange-500' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  } transition-colors`}
                >
                  <span className="text-xs">{dayObj.day}</span>
                  <span className="text-xs">{dayObj.date}</span>
                  <span className="text-lg font-bold">{dayObj.num}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">SELECT TIME OF DAY</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedTime === 'EVENING'}
                  onChange={() => setSelectedTime(selectedTime === 'EVENING' ? '' : 'EVENING')}
                  className="form-checkbox text-red-500"
                />
                <span className="text-sm">EVENING</span>
              </label>
            </div>
          </div>
        </div>

        {/* Special Screenings */}
        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="form-checkbox text-red-500"/>
            <span className="text-sm">FAN FIRST PREMIERES EXCLUSIVELY IN IMAX</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="form-checkbox text-red-500"/>
            <span className="text-sm">F1® THE MOVIE: EARLY ACCESS</span>
          </label>
        </div>

        <div className="mt-6 text-right">
          <button className="text-orange-500 hover:text-orange-400 transition-colors">
            COLLAPSE ALL
          </button>
        </div>
      </div>
    </div>
  );
};

// Theater Card Component
export const TheaterCard = ({ theater, onSelectTheater, movieConfig }) => {
  const primaryGradient = movieConfig?.primary_gradient || { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'] };
  const secondaryGradient = movieConfig?.secondary_gradient || { type: 'linear', direction: '135deg', colors: ['#f97316', '#ea580c'] };
  
  const gradientStyle = {
    background: `${primaryGradient.type}-gradient(${primaryGradient.type === 'linear' ? primaryGradient.direction + ', ' : ''}${primaryGradient.colors.join(', ')})`
  };

  const hoverGradientStyle = {
    background: `${secondaryGradient.type}-gradient(${secondaryGradient.type === 'linear' ? secondaryGradient.direction + ', ' : ''}${secondaryGradient.colors.join(', ')})`
  };

  return (
    <div 
      className="text-white p-6 rounded-lg cursor-pointer transition-all duration-300 shadow-lg theater-card"
      style={gradientStyle}
      onClick={onSelectTheater}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverGradientStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, gradientStyle);
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
              {theater.chain.charAt(0)}
            </div>
            <h3 className="font-bold text-lg">{theater.name}</h3>
          </div>
          <p className="text-sm opacity-90 mb-3">{theater.address}</p>
          
          {/* Showtimes */}
          <div className="space-y-2">
            {theater.formats.map((format, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="bg-black bg-opacity-30 px-2 py-1 rounded text-xs font-semibold">
                  {format.type}
                </span>
                <div className="flex space-x-2">
                  {format.times.map((time, timeIndex) => (
                    <button 
                      key={timeIndex}
                      className="bg-black bg-opacity-30 hover:bg-black hover:bg-opacity-50 px-3 py-1 rounded text-sm font-semibold transition-colors"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="ml-4 text-right">
          <div className="text-sm opacity-90 mb-1">{theater.distance} MILES</div>
          <div className="flex space-x-1">
            <button className="bg-black bg-opacity-30 hover:bg-black hover:bg-opacity-50 p-2 rounded transition-colors">
              🎯
            </button>
            <button className="bg-black bg-opacity-30 hover:bg-black hover:bg-opacity-50 p-2 rounded transition-colors">
              ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Theater Listings Component
export const TheaterListings = ({ theaters, onSelectTheater, movieConfig }) => {
  return (
    <div className="text-white py-8" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="space-y-4">
          {theaters.map((theater, index) => (
            <TheaterCard 
              key={index} 
              theater={theater} 
              onSelectTheater={() => onSelectTheater(theater)}
              movieConfig={movieConfig}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4 text-red-500">F1® THE MOVIE</h4>
            <p className="text-gray-400 text-sm">
              Experience the thrill of Formula 1 racing like never before.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Get Tickets</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Theaters</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Showtimes</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Group Sales</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Movie Info</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cast & Crew</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Videos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Gallery</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Soundtrack</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 F1® The Movie. All rights reserved. | Privacy Policy | Terms of Use | Ad Choices</p>
        </div>
      </div>
    </footer>
  );
};