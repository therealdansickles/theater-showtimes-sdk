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
                Setup Film
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

// Search and Filter Component
export const SearchFilter = ({ 
  selectedLocation, 
  setSelectedLocation, 
  selectedFormats, 
  setSelectedFormats, 
  selectedDay, 
  setSelectedDay, 
  selectedTime, 
  setSelectedTime, 
  movieConfig,
  categories = [],
  timeCategories = []
}) => {
  // Use dynamic categories from backend instead of hardcoded formats
  const formats = categories.map(cat => cat.name);
  
  // Map time categories to display-friendly names
  const timeOptions = [
    { value: 'MORNING', label: 'Morning', description: 'Before 12 PM' },
    { value: 'AFTERNOON', label: 'Afternoon', description: '12 PM - 6 PM' },
    { value: 'EVENING', label: 'Evening', description: '6 PM - 10 PM' },
    { value: 'LATE_NIGHT', label: 'Late Night', description: 'After 10 PM' }
  ];
  
  const days = [
    { day: 'SAT', date: 'JUN', num: '28' },
    { day: 'SUN', date: 'JUN', num: '29' },
    { day: 'MON', date: 'JUL', num: '1' },
    { day: 'TUE', date: 'JUL', num: '2' },
    { day: 'WED', date: 'JUL', num: '3' }
  ];

  const accentColor = movieConfig?.accent_color || '#ef4444';

  // State for collapsible sections
  const [isFormatsExpanded, setIsFormatsExpanded] = useState(false);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);

  const handleFormatChange = (format) => {
    setSelectedFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  return (
    <div className="bg-gray-900 text-white filter-compact">
      <div className="max-w-7xl mx-auto">
        {/* Search Location */}
        <div className="mb-4">
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
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Format Selection - Collapsible */}
          <div>
            <button
              onClick={() => setIsFormatsExpanded(!isFormatsExpanded)}
              className="filter-collapsible-button flex items-center justify-between w-full text-lg font-semibold mb-3"
            >
              <span>FORMATS</span>
              <span className="text-sm">
                {isFormatsExpanded ? '▼' : '▶'}
              </span>
            </button>
            {isFormatsExpanded && (
              <div className="grid filter-grid-tight max-h-48 overflow-y-auto">
                {formats.map((format) => (
                  <label key={format} className="flex items-center space-x-1 cursor-pointer text-sm filter-touch-target-compact">
                    <input 
                      type="checkbox" 
                      checked={selectedFormats.includes(format)}
                      onChange={() => handleFormatChange(format)}
                      className="form-checkbox text-red-500 flex-shrink-0 compact-checkbox"
                    />
                    <span className="text-xs leading-tight truncate">{format}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Day Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">SELECT A DAY</h3>
            <div className="flex space-x-2 overflow-x-auto">
              {days.map((dayObj, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(dayObj)}
                  className={`flex flex-col items-center p-3 rounded border min-w-[60px] ${
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

          {/* Time Selection - Collapsible */}
          <div>
            <button
              onClick={() => setIsTimeExpanded(!isTimeExpanded)}
              className="filter-collapsible-button flex items-center justify-between w-full text-lg font-semibold mb-3"
            >
              <span>TIME OF DAY</span>
              <span className="text-sm">
                {isTimeExpanded ? '▼' : '▶'}
              </span>
            </button>
            {isTimeExpanded && (
              <div className="grid filter-time-grid-tight">
                {timeOptions.map((timeOption) => (
                  <label key={timeOption.value} className="flex items-start space-x-1 cursor-pointer text-sm filter-touch-target-compact">
                    <input 
                      type="radio" 
                      name="timeSelection"
                      checked={selectedTime === timeOption.value}
                      onChange={() => handleTimeChange(timeOption.value)}
                      className="form-radio text-red-500 compact-radio flex-shrink-0"
                      style={{ accentColor }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{timeOption.label}</span>
                      <span className="text-xs text-gray-400 leading-tight">{timeOption.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Special Screenings */}
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="flex items-center space-x-2 cursor-pointer filter-touch-target">
            <input type="checkbox" className="form-checkbox text-red-500 compact-checkbox"/>
            <span className="text-xs">FAN FIRST PREMIERES EXCLUSIVELY IN IMAX</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer filter-touch-target">
            <input type="checkbox" className="form-checkbox text-red-500 compact-checkbox"/>
            <span className="text-xs">F1 THE MOVIE: EARLY ACCESS</span>
          </label>
        </div>

        <div className="mt-4 text-right">
          <button className="text-orange-500 hover:text-orange-400 transition-colors text-sm">
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
                  {format.type || format.category_name}
                </span>
                <div className="flex space-x-2">
                  {(format.times || []).map((time, timeIndex) => {
                    // Handle both string times (legacy) and time objects (new format)
                    const timeStr = typeof time === 'string' ? time : time.time;
                    const timeCategory = typeof time === 'object' && time.category ? time.category : null;
                    
                    return (
                      <button 
                        key={timeIndex}
                        className="bg-black bg-opacity-30 hover:bg-black hover:bg-opacity-50 px-3 py-1 rounded text-sm font-semibold transition-colors"
                        title={timeCategory ? `${timeStr} (${timeCategory})` : timeStr}
                      >
                        {timeCategory && (
                          <span className="mr-1 text-xs">
                            {timeCategory === 'morning' ? '🌅' : 
                             timeCategory === 'afternoon' ? '☀️' : 
                             timeCategory === 'evening' ? '🌆' : 
                             timeCategory === 'late_night' ? '🌙' : '🕐'}
                          </span>
                        )}
                        {timeStr}
                      </button>
                    );
                  })}
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

// Theater Listings Component with Mobile Accordion
export const TheaterListings = ({ theaters, onSelectTheater, movieConfig, loading = false }) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  if (loading) {
    return (
      <div className="text-white py-8 theater-listings" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="mt-4 text-lg">Loading theaters...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!theaters || theaters.length === 0) {
    return (
      <div className="text-white py-8 theater-listings" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <p className="text-lg opacity-75">No theaters found matching your criteria.</p>
            <p className="text-sm opacity-50 mt-2">Try adjusting your filters or location.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white py-8 theater-listings" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm opacity-75">Found {theaters.length} theater{theaters.length !== 1 ? 's' : ''}</p>
          
          {/* Mobile accordion toggle */}
          <button 
            className="md:hidden text-sm px-3 py-1 bg-gray-700 rounded"
            onClick={() => setMobileExpanded(!mobileExpanded)}
          >
            {mobileExpanded ? 'Collapse' : 'Show All'} Theaters
          </button>
        </div>
        
        {/* Desktop: Show all theaters, Mobile: Show first 3 or all if expanded */}
        <div className="space-y-4">
          {theaters
            .slice(0, mobileExpanded ? theaters.length : (window.innerWidth >= 768 ? theaters.length : 3))
            .map((theater, index) => (
              <TheaterCard 
                key={index} 
                theater={theater} 
                onSelectTheater={() => onSelectTheater(theater)}
                movieConfig={movieConfig}
              />
            ))}
        </div>
        
        {/* Mobile: Show expand button if there are more theaters */}
        {!mobileExpanded && theaters.length > 3 && window.innerWidth < 768 && (
          <div className="text-center mt-4">
            <button 
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              onClick={() => setMobileExpanded(true)}
            >
              Show {theaters.length - 3} More Theaters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Footer Component
export const Footer = ({ movieConfig }) => {
  const accentColor = movieConfig?.accent_color || '#ef4444';
  const textColor = movieConfig?.text_color || '#ffffff';
  
  return (
    <footer className="text-white py-8" style={{ backgroundColor: movieConfig?.background_color || '#000000' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: accentColor }}>
              {movieConfig?.movie_title ? `${movieConfig.movie_title}${movieConfig.movie_subtitle ? ` ${movieConfig.movie_subtitle}` : ''}` : 'F1 THE MOVIE'}
            </h4>
            <p className="text-sm" style={{ color: textColor, opacity: 0.7 }}>
              {movieConfig?.description || 'Experience the thrill of Formula 1 racing like never before.'}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: textColor }}>Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }} 
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Get Tickets</a></li>
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Theaters</a></li>
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Showtimes</a></li>
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Group Sales</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: textColor }}>Movie Info</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Cast & Crew</a></li>
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Videos</a></li>
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Gallery</a></li>
              <li><a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                     onMouseEnter={(e) => e.target.style.color = accentColor}
                     onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                Soundtrack</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: textColor }}>Connect</h4>
            <div className="flex space-x-4">
              {/* Social Links from movieConfig if available */}
              {movieConfig?.social_links?.twitter && (
                <a href={movieConfig.social_links.twitter} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                   onMouseEnter={(e) => e.target.style.color = accentColor}
                   onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {movieConfig?.social_links?.instagram && (
                <a href={movieConfig.social_links.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                   onMouseEnter={(e) => e.target.style.color = accentColor}
                   onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947C23.728 2.695 21.31.273 16.948.073 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {/* Litebeem Logo */}
              <a href="#" className="transition-colors" style={{ color: textColor, opacity: 0.7 }}
                 onMouseEnter={(e) => e.target.style.color = accentColor}
                 onMouseLeave={(e) => { e.target.style.color = textColor; e.target.style.opacity = 0.7; }}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <defs>
                    <radialGradient id="litebeem-gradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.9"/>
                      <stop offset="50%" stopColor="currentColor" stopOpacity="0.6"/>
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.3"/>
                    </radialGradient>
                  </defs>
                  <circle cx="12" cy="12" r="6" fill="url(#litebeem-gradient)"/>
                  <circle cx="12" cy="6" r="0.5" fill="currentColor" opacity="0.8"/>
                  <circle cx="12" cy="18" r="0.5" fill="currentColor" opacity="0.8"/>
                  <circle cx="6" cy="12" r="0.5" fill="currentColor" opacity="0.8"/>
                  <circle cx="18" cy="12" r="0.5" fill="currentColor" opacity="0.8"/>
                  <circle cx="8.5" cy="8.5" r="0.4" fill="currentColor" opacity="0.7"/>
                  <circle cx="15.5" cy="15.5" r="0.4" fill="currentColor" opacity="0.7"/>
                  <circle cx="8.5" cy="15.5" r="0.4" fill="currentColor" opacity="0.7"/>
                  <circle cx="15.5" cy="8.5" r="0.4" fill="currentColor" opacity="0.7"/>
                  <circle cx="12" cy="4" r="0.3" fill="currentColor" opacity="0.6"/>
                  <circle cx="12" cy="20" r="0.3" fill="currentColor" opacity="0.6"/>
                  <circle cx="4" cy="12" r="0.3" fill="currentColor" opacity="0.6"/>
                  <circle cx="20" cy="12" r="0.3" fill="currentColor" opacity="0.6"/>
                  <circle cx="7" cy="7" r="0.3" fill="currentColor" opacity="0.5"/>
                  <circle cx="17" cy="17" r="0.3" fill="currentColor" opacity="0.5"/>
                  <circle cx="7" cy="17" r="0.3" fill="currentColor" opacity="0.5"/>
                  <circle cx="17" cy="7" r="0.3" fill="currentColor" opacity="0.5"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm" style={{ borderColor: textColor, opacity: 0.3 }}>
          <p style={{ color: textColor, opacity: 0.7 }}>
            &copy; 2025 {movieConfig?.movie_title ? `${movieConfig.movie_title}${movieConfig.movie_subtitle ? ` ${movieConfig.movie_subtitle}` : ''}` : 'F1® The Movie'}. All rights reserved. | Privacy Policy | Terms of Use | Ad Choices
          </p>
        </div>
      </div>
    </footer>
  );
};
