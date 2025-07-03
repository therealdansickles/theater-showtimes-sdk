import React, { useState, useEffect } from 'react';
import { mockTheaterData, mockCategories } from '../mockData';
import ImageWithFallback from './ImageWithFallback';

// Two-Panel Layout: Left (Showtimes & Filters) + Right (Hero Panel)
const TwoPanelLayout = ({ movieConfig, theaters, onSelectTheater, loading }) => {
  // Use mock data for layout testing
  const [filteredTheaters, setFilteredTheaters] = useState(mockTheaterData);
  const [filters, setFilters] = useState({
    location: '',
    selectedFormats: [],
    selectedDate: null,
    selectedTimes: ['Morning', 'Afternoon', 'Evening', 'Late Night'] // All selected by default
  });
  const [categories] = useState(mockCategories);
  const [expandedTheaters, setExpandedTheaters] = useState({});
  
  // State for collapsible filter sections
  const [isFormatsExpanded, setIsFormatsExpanded] = useState(false);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);

  const accentColor = movieConfig?.accent_color || '#ef4444';
  const textColor = movieConfig?.text_color || '#ffffff';
  const backgroundColor = movieConfig?.background_color || '#0a0a0a';
  
  // Extract gradient colors for background
  const primaryColors = movieConfig?.primary_gradient?.colors || ['#ef4444', '#dc2626', '#991b1b'];
  const secondaryColors = movieConfig?.secondary_gradient?.colors || ['#f97316', '#ea580c', '#c2410c'];

  // Generate 7-day rolling window
  const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  // Set default date to today
  useEffect(() => {
    if (!filters.selectedDate && dateOptions.length > 0) {
      setFilters(prev => ({ ...prev, selectedDate: dateOptions[0].value }));
    }
  }, []);

  // Apply filters to theaters
  useEffect(() => {
    let filtered = mockTheaterData; // Use mock data

    // Location filter (fuzzy matching)
    if (filters.location.trim()) {
      const searchTerm = filters.location.toLowerCase();
      filtered = filtered.filter(theater => 
        theater.name?.toLowerCase().includes(searchTerm) ||
        theater.address?.toLowerCase().includes(searchTerm) ||
        theater.city?.toLowerCase().includes(searchTerm)
      );
    }

    // Format filters
    if (filters.selectedFormats.length > 0) {
      filtered = filtered.filter(theater =>
        theater.formats?.some(format =>
          filters.selectedFormats.includes(format.type || format.category_name)
        )
      );
    }

    // Time filters
    if (filters.selectedTimes.length > 0 && filters.selectedTimes.length < 4) {
      const timeCategories = {
        'Morning': (time) => {
          const hour = parseInt(time.split(':')[0]);
          return hour < 12;
        },
        'Afternoon': (time) => {
          const hour = parseInt(time.split(':')[0]);
          return hour >= 12 && hour < 18;
        },
        'Evening': (time) => {
          const hour = parseInt(time.split(':')[0]);
          return hour >= 18 && hour < 22;
        },
        'Late Night': (time) => {
          const hour = parseInt(time.split(':')[0]);
          return hour >= 22 || hour < 6;
        }
      };

      filtered = filtered.map(theater => ({
        ...theater,
        formats: theater.formats?.map(format => ({
          ...format,
          times: format.times?.filter(timeObj => {
            const timeStr = typeof timeObj === 'string' ? timeObj : timeObj.time;
            return filters.selectedTimes.some(selectedTime =>
              timeCategories[selectedTime] && timeCategories[selectedTime](timeStr)
            );
          })
        })).filter(format => format.times?.length > 0)
      })).filter(theater => theater.formats?.length > 0);
    }

    // Sort by distance if available
    filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setFilteredTheaters(filtered);
  }, [filters]);

  const toggleTheater = (theaterId) => {
    setExpandedTheaters(prev => ({
      ...prev,
      [theaterId]: !prev[theaterId]
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'selectedFormats') {
        const newFormats = prev.selectedFormats.includes(value)
          ? prev.selectedFormats.filter(f => f !== value)
          : [...prev.selectedFormats, value];
        return { ...prev, selectedFormats: newFormats };
      } else if (filterType === 'selectedTimes') {
        const newTimes = prev.selectedTimes.includes(value)
          ? prev.selectedTimes.filter(t => t !== value)
          : [...prev.selectedTimes, value];
        return { ...prev, selectedTimes: newTimes };
      } else {
        return { ...prev, [filterType]: value };
      }
    });
  };

  // Toggle formats section
  const toggleFormatsSection = () => {
    setIsFormatsExpanded(!isFormatsExpanded);
  };

  // Toggle time section
  const toggleTimeSection = () => {
    setIsTimeExpanded(!isTimeExpanded);
  };

  // Dynamic background with subtle gradient
  const backgroundStyle = {
    background: `
      radial-gradient(circle at 20% 80%, ${primaryColors[0]}15 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, ${secondaryColors[0]}10 0%, transparent 50%),
      linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)
    `,
    minHeight: '100vh'
  };

  return (
    <div className="two-panel-layout" style={backgroundStyle}>
      
      {/* Left Panel - Showtimes & Filters */}
      <div className="left-panel">
        <div className="filter-section">
          
          {/* Filters Section with mobile-first design */}
          <div className="mb-8 space-y-6">
            
            {/* Location Search */}
            <div>
              <label 
                className="block text-sm font-semibold mb-3 tracking-wider uppercase label-text"
                style={{ color: textColor, opacity: 0.9 }}
              >
                LOCATION SEARCH
              </label>
              <input
                type="text"
                placeholder="Enter city or zip code..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 bg-white bg-opacity-5 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:border-opacity-60 focus:bg-opacity-10 transition-all body-text focus-ring"
                style={{ 
                  borderColor: accentColor, 
                  borderOpacity: 0.2,
                  fontFamily: movieConfig?.typography?.body_font || 'Inter',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Date Picker with mobile optimization */}
            <div>
              <label 
                className="block text-sm font-semibold mb-3 tracking-wider uppercase label-text"
                style={{ color: textColor, opacity: 0.9 }}
              >
                SELECT DATE
              </label>
              <div className="flex space-x-2 overflow-x-auto pb-3">
                {dateOptions.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => handleFilterChange('selectedDate', date.value)}
                    className={`date-picker-button flex-shrink-0 px-4 py-3 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap focus-ring mobile-touch-target ${
                      filters.selectedDate === date.value
                        ? 'text-white shadow-xl'
                        : 'bg-white bg-opacity-5 hover:bg-opacity-15 backdrop-blur-sm'
                    }`}
                    style={{
                      backgroundColor: filters.selectedDate === date.value ? accentColor : undefined,
                      color: filters.selectedDate === date.value ? 'white' : textColor,
                      fontFamily: movieConfig?.typography?.body_font || 'Inter',
                      minWidth: '80px',
                      fontSize: '0.9rem'
                    }}
                  >
                    <div className="text-sm font-bold">{date.label}</div>
                    {date.isToday && (
                      <div className="text-xs opacity-80 uppercase tracking-wide">Today</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Filters with collapsible section */}
            <div>
              <div className="flex items-center justify-between">
                <label 
                  className="block text-sm font-semibold mb-3 tracking-wider uppercase label-text"
                  style={{ color: textColor, opacity: 0.9 }}
                >
                  FORMATS
                </label>
                <button 
                  onClick={toggleFormatsSection}
                  className="filter-collapsible-button text-sm mb-3"
                  style={{ color: textColor }}
                  aria-expanded={isFormatsExpanded}
                  aria-controls="formats-content"
                >
                  {isFormatsExpanded ? '▼' : '▶'}
                </button>
              </div>
              <div 
                id="formats-content"
                className={`filter-collapsible-content ${isFormatsExpanded ? 'filter-collapsible-expanded' : 'filter-collapsible-collapsed'}`}
              >
                <div className="filter-grid-tight mobile-grid-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2 cursor-pointer group mobile-touch-target filter-touch-target-compact">
                      <input
                        type="checkbox"
                        checked={filters.selectedFormats.includes(category.name)}
                        onChange={() => handleFilterChange('selectedFormats', category.name)}
                        className="w-4 h-4 rounded border-2 bg-transparent focus:ring-2 focus:ring-opacity-50 transition-all focus-ring compact-checkbox"
                        style={{ 
                          accentColor: accentColor,
                          borderColor: accentColor,
                          borderOpacity: 0.4
                        }}
                      />
                      <span 
                        className="text-sm font-medium group-hover:opacity-100 transition-opacity body-text"
                        style={{ color: textColor, opacity: 0.85 }}
                      >
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Time of Day Filters with collapsible section */}
            <div>
              <div className="flex items-center justify-between">
                <label 
                  className="block text-sm font-semibold mb-3 tracking-wider uppercase label-text"
                  style={{ color: textColor, opacity: 0.9 }}
                >
                  TIME OF DAY
                </label>
                <button 
                  onClick={toggleTimeSection}
                  className="filter-collapsible-button text-sm mb-3"
                  style={{ color: textColor }}
                  aria-expanded={isTimeExpanded}
                  aria-controls="time-content"
                >
                  {isTimeExpanded ? '▼' : '▶'}
                </button>
              </div>
              <div 
                id="time-content"
                className={`filter-collapsible-content ${isTimeExpanded ? 'filter-collapsible-expanded' : 'filter-collapsible-collapsed'}`}
              >
                <div className="filter-grid-tight mobile-grid-2">
                  {[
                    { value: 'Morning', label: 'Morning', desc: 'Before 12 PM', icon: '🌅' },
                    { value: 'Afternoon', label: 'Afternoon', desc: '12 PM - 6 PM', icon: '☀️' },
                    { value: 'Evening', label: 'Evening', desc: '6 PM - 10 PM', icon: '🌆' },
                    { value: 'Late Night', label: 'Late Night', desc: 'After 10 PM', icon: '🌙' }
                  ].map((timeOption) => (
                    <label key={timeOption.value} className="flex items-center space-x-3 cursor-pointer group mobile-touch-target filter-touch-target-compact">
                      <input
                        type="checkbox"
                        checked={filters.selectedTimes.includes(timeOption.value)}
                        onChange={() => handleFilterChange('selectedTimes', timeOption.value)}
                        className="w-4 h-4 rounded border-2 bg-transparent focus:ring-2 focus:ring-opacity-50 transition-all focus-ring compact-checkbox"
                        style={{ 
                          accentColor: accentColor,
                          borderColor: accentColor,
                          borderOpacity: 0.4
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{timeOption.icon}</span>
                          <span 
                            className="text-sm font-medium group-hover:opacity-100 transition-opacity body-text"
                            style={{ color: textColor, opacity: 0.85 }}
                          >
                            {timeOption.label}
                          </span>
                        </div>
                        <div className="text-xs opacity-60 ml-6 body-text" style={{ color: textColor }}>
                          {timeOption.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theater Listings with mobile optimization */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="mobile-title font-bold tracking-tight title-text"
                style={{ 
                  color: textColor,
                  fontFamily: movieConfig?.typography?.title_font || 'Inter',
                  fontWeight: movieConfig?.typography?.title_weight || '800'
                }}
              >
                Showtimes
                {filteredTheaters.length > 0 && (
                  <span className="text-base font-normal opacity-60 ml-2 block md:inline">
                    ({filteredTheaters.length} theater{filteredTheaters.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div 
                  className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-transparent border-t-current"
                  style={{ borderTopColor: accentColor }}
                ></div>
                <p className="mt-4 body-text" style={{ color: textColor }}>Loading theaters...</p>
              </div>
            ) : filteredTheaters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg body-text" style={{ color: textColor, opacity: 0.7 }}>
                  No theaters found matching your criteria.
                </p>
                <p className="text-sm mt-2 body-text" style={{ color: textColor, opacity: 0.5 }}>
                  Try adjusting your filters or search location.
                </p>
              </div>
            ) : (
              <div className="space-y-4 fade-in">
                {filteredTheaters.map((theater, index) => (
                  <div
                    key={index}
                    className="theater-card bg-white bg-opacity-5 backdrop-blur-sm rounded-xl border border-white border-opacity-10 overflow-hidden hover:bg-opacity-10 transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleTheater(index)}
                      className="w-full p-4 text-left hover:bg-white hover:bg-opacity-5 transition-colors mobile-touch-target focus-ring"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg"
                              style={{ backgroundColor: accentColor }}
                            >
                              {theater.chain?.charAt(0) || 'T'}
                            </div>
                            <div className="flex-1">
                              <h3 
                                className="font-bold text-base leading-tight subtitle-text"
                                style={{ 
                                  color: textColor,
                                  fontFamily: movieConfig?.typography?.title_font || 'Inter'
                                }}
                              >
                                {theater.name}
                              </h3>
                              {theater.distance && (
                                <span className="text-xs opacity-70 font-medium body-text" style={{ color: textColor }}>
                                  {theater.distance} miles away
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm opacity-80 ml-11 body-text" style={{ color: textColor, lineHeight: '1.4' }}>
                            {theater.address}
                          </p>
                        </div>
                        <span 
                          className={`transform transition-transform duration-200 text-lg ml-2 ${expandedTheaters[index] ? 'rotate-180' : ''}`}
                          style={{ color: accentColor }}
                        >
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Expanded Showtimes */}
                    {expandedTheaters[index] && (
                      <div className="px-4 pb-4 border-t border-white border-opacity-10 slide-up">
                        <div className="space-y-4 mt-4">
                          {theater.formats?.map((format, formatIndex) => (
                            <div key={formatIndex}>
                              <h4 
                                className="font-bold text-xs mb-3 px-3 py-1 rounded-lg inline-block uppercase tracking-widest label-text"
                                style={{ 
                                  backgroundColor: `${accentColor}25`,
                                  color: accentColor,
                                  fontFamily: movieConfig?.typography?.title_font || 'Inter'
                                }}
                              >
                                {format.type || format.category_name}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {format.times?.map((time, timeIndex) => {
                                  const timeStr = typeof time === 'string' ? time : time.time;
                                  const timeCategory = typeof time === 'object' && time.category ? time.category : null;
                                  
                                  return (
                                    <button
                                      key={timeIndex}
                                      onClick={() => onSelectTheater && onSelectTheater(theater)}
                                      className="showtime-button px-3 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-30 transform mobile-touch-target"
                                      style={{ 
                                        backgroundColor: accentColor,
                                        color: 'white',
                                        boxShadow: `0 4px 10px rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.25)`,
                                        fontFamily: movieConfig?.typography?.body_font || 'Inter'
                                      }}
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
                                      <span className="text-sm font-bold">{timeStr}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Hero Film Display with mobile optimization */}
      <div className="right-panel">
        <div className="flex flex-col h-full">
          
          {/* Poster with mobile optimization */}
          <div className="poster-container flex-shrink-0 mb-6">
            <div className="aspect-[2/3] w-full poster-enhanced">
              <ImageWithFallback
                src={movieConfig?.film_assets?.poster_image ? 
                  process.env.REACT_APP_BACKEND_URL + movieConfig.film_assets.poster_image :
                  'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
                }
                fallbackSrc="https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop"
                alt={`${movieConfig?.movie_title || 'Movie'} Poster`}
                className="w-full h-full object-cover rounded-xl"
                movieConfig={movieConfig}
              />
            </div>
          </div>

          {/* Film Metadata with mobile typography */}
          <div className="flex-grow space-y-4 fade-in">
            <div>
              <h1 
                className="mobile-title font-black tracking-tight leading-tight title-text"
                style={{ 
                  color: textColor,
                  fontFamily: movieConfig?.typography?.title_font || 'Inter',
                  fontWeight: movieConfig?.typography?.title_weight || '900',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                <span style={{ color: accentColor }}>
                  {movieConfig?.movie_title || 'Film Title'}
                </span>
              </h1>
              {movieConfig?.movie_subtitle && (
                <h2 
                  className="mobile-subtitle font-bold opacity-90 tracking-wide subtitle-text"
                  style={{ 
                    color: textColor,
                    fontFamily: movieConfig?.typography?.title_font || 'Inter'
                  }}
                >
                  {movieConfig.movie_subtitle}
                </h2>
              )}
            </div>

            {movieConfig?.film_details?.logline && (
              <p 
                className="text-base italic opacity-90 leading-relaxed font-medium body-text"
                style={{ 
                  color: textColor,
                  fontFamily: movieConfig?.typography?.body_font || 'Inter',
                  lineHeight: '1.6'
                }}
              >
                "{movieConfig.film_details.logline}"
              </p>
            )}

            {/* Promotional Badges with mobile optimization */}
            <div className="badge-container">
              {movieConfig?.film_assets?.badge_images?.length > 0 ? (
                movieConfig.film_assets.badge_images.map((badgeUrl, index) => (
                  <img
                    key={index}
                    src={process.env.REACT_APP_BACKEND_URL + badgeUrl}
                    alt={`Badge ${index + 1}`}
                    className="h-10 w-auto object-contain"
                    style={{ maxWidth: '140px' }}
                  />
                ))
              ) : (
                <>
                  <span className="badge-primary">
                    🎬 Now Playing
                  </span>
                  <span className="badge-secondary">
                    Only In Theaters
                  </span>
                  <span className="badge-accent">
                    Filmed For IMAX
                  </span>
                </>
              )}
            </div>

            {/* Film Details with mobile typography */}
            {(movieConfig?.director || movieConfig?.cast?.length > 0) && (
              <div className="space-y-3 text-sm">
                {movieConfig.director && (
                  <p style={{ color: textColor, opacity: 0.9 }}>
                    <span 
                      className="font-bold uppercase tracking-wider text-xs label-text block mb-1"
                      style={{ 
                        color: accentColor,
                        fontFamily: movieConfig?.typography?.title_font || 'Inter'
                      }}
                    >
                      Director:
                    </span>
                    <span 
                      className="text-base font-semibold subtitle-text"
                      style={{ fontFamily: movieConfig?.typography?.body_font || 'Inter' }}
                    >
                      {movieConfig.director}
                    </span>
                  </p>
                )}
                {movieConfig.cast?.length > 0 && (
                  <p style={{ color: textColor, opacity: 0.9 }}>
                    <span 
                      className="font-bold uppercase tracking-wider text-xs label-text block mb-1"
                      style={{ 
                        color: accentColor,
                        fontFamily: movieConfig?.typography?.title_font || 'Inter'
                      }}
                    >
                      Starring:
                    </span>
                    <span 
                      className="text-base font-semibold leading-relaxed body-text"
                      style={{ fontFamily: movieConfig?.typography?.body_font || 'Inter' }}
                    >
                      {movieConfig.cast.slice(0, 3).join(', ')}
                      {movieConfig.cast.length > 3 && (
                        <span className="opacity-75"> & more</span>
                      )}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoPanelLayout;