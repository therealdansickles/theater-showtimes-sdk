import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL + '/api';

// Two-Panel Layout: Left (Showtimes & Filters) + Right (Hero Panel)
const TwoPanelLayout = ({ movieConfig, theaters, onSelectTheater, loading }) => {
  const [filteredTheaters, setFilteredTheaters] = useState(theaters || []);
  const [filters, setFilters] = useState({
    location: '',
    selectedFormats: [],
    selectedDate: null,
    selectedTimes: ['Morning', 'Afternoon', 'Evening', 'Late Night'] // All selected by default
  });
  const [categories, setCategories] = useState([]);
  const [expandedTheaters, setExpandedTheaters] = useState({});

  const accentColor = movieConfig?.accent_color || '#ef4444';
  const textColor = movieConfig?.text_color || '#ffffff';
  const backgroundColor = movieConfig?.background_color || '#000000';

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

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/categories/`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Set default date to today
  useEffect(() => {
    if (!filters.selectedDate && dateOptions.length > 0) {
      setFilters(prev => ({ ...prev, selectedDate: dateOptions[0].value }));
    }
  }, []);

  // Apply filters to theaters
  useEffect(() => {
    let filtered = theaters || [];

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
  }, [theaters, filters]);

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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ backgroundColor }}>
      
      {/* Left Panel - Showtimes & Filters */}
      <div className="lg:w-2/3 xl:w-3/5 p-6 overflow-y-auto">
        <div className="max-w-4xl">
          
          {/* Filters Section */}
          <div className="mb-8 space-y-6">
            
            {/* Location Search */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: textColor }}>
                📍 Location Search
              </label>
              <input
                type="text"
                placeholder="Enter city or zip code..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:border-opacity-50 transition-all"
                style={{ borderColor: accentColor, borderOpacity: 0.3 }}
              />
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: textColor }}>
                📅 Select Date
              </label>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {dateOptions.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => handleFilterChange('selectedDate', date.value)}
                    className={`flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                      filters.selectedDate === date.value
                        ? 'text-white shadow-lg'
                        : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                    }`}
                    style={{
                      backgroundColor: filters.selectedDate === date.value ? accentColor : undefined,
                      color: filters.selectedDate === date.value ? 'white' : textColor
                    }}
                  >
                    {date.label}
                    {date.isToday && <div className="text-xs opacity-75">Today</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Filters */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: textColor }}>
                🎬 Formats
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.selectedFormats.includes(category.name)}
                      onChange={() => handleFilterChange('selectedFormats', category.name)}
                      className="rounded border-2 bg-transparent focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        accentColor: accentColor,
                        borderColor: accentColor 
                      }}
                    />
                    <span className="text-sm" style={{ color: textColor }}>
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Time of Day Filters */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: textColor }}>
                🕐 Time of Day
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'Morning', label: 'Morning', desc: 'Before 12 PM' },
                  { value: 'Afternoon', label: 'Afternoon', desc: '12 PM - 6 PM' },
                  { value: 'Evening', label: 'Evening', desc: '6 PM - 10 PM' },
                  { value: 'Late Night', label: 'Late Night', desc: 'After 10 PM' }
                ].map((timeOption) => (
                  <label key={timeOption.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.selectedTimes.includes(timeOption.value)}
                      onChange={() => handleFilterChange('selectedTimes', timeOption.value)}
                      className="rounded border-2 bg-transparent focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        accentColor: accentColor,
                        borderColor: accentColor 
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium" style={{ color: textColor }}>
                        {timeOption.label}
                      </div>
                      <div className="text-xs opacity-70" style={{ color: textColor }}>
                        {timeOption.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Theater Listings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: textColor }}>
                Showtimes {filteredTheaters.length > 0 && (
                  <span className="text-lg font-normal opacity-70">
                    ({filteredTheaters.length} theater{filteredTheaters.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="mt-4" style={{ color: textColor }}>Loading theaters...</p>
              </div>
            ) : filteredTheaters.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg" style={{ color: textColor, opacity: 0.7 }}>
                  No theaters found matching your criteria.
                </p>
                <p className="text-sm mt-2" style={{ color: textColor, opacity: 0.5 }}>
                  Try adjusting your filters or search location.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTheaters.map((theater, index) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-5 backdrop-blur-sm rounded-lg border border-white border-opacity-10 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleTheater(index)}
                      className="w-full p-6 text-left hover:bg-white hover:bg-opacity-5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: accentColor }}
                            >
                              {theater.chain?.charAt(0) || 'T'}
                            </div>
                            <h3 className="font-bold text-lg" style={{ color: textColor }}>
                              {theater.name}
                            </h3>
                            {theater.distance && (
                              <span className="text-sm opacity-70" style={{ color: textColor }}>
                                {theater.distance} miles
                              </span>
                            )}
                          </div>
                          <p className="text-sm opacity-80" style={{ color: textColor }}>
                            {theater.address}
                          </p>
                        </div>
                        <span 
                          className={`transform transition-transform ${expandedTheaters[index] ? 'rotate-180' : ''}`}
                          style={{ color: accentColor }}
                        >
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Expanded Showtimes */}
                    {expandedTheaters[index] && (
                      <div className="px-6 pb-6 border-t border-white border-opacity-10">
                        <div className="space-y-4 mt-4">
                          {theater.formats?.map((format, formatIndex) => (
                            <div key={formatIndex}>
                              <h4 
                                className="font-semibold mb-3 px-3 py-1 rounded inline-block"
                                style={{ 
                                  backgroundColor: `${accentColor}20`,
                                  color: accentColor
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
                                      className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                      style={{ 
                                        backgroundColor: accentColor,
                                        color: 'white',
                                        boxShadow: `0 4px 10px rgba(${parseInt(accentColor.slice(1, 3), 16)}, ${parseInt(accentColor.slice(3, 5), 16)}, ${parseInt(accentColor.slice(5, 7), 16)}, 0.3)`
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
                                      {timeStr}
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

      {/* Right Panel - Hero Film Display */}
      <div className="lg:w-1/3 xl:w-2/5 bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="sticky top-0 p-6 h-screen flex flex-col">
          
          {/* Poster */}
          <div className="flex-shrink-0 mb-6">
            <div className="aspect-[2/3] max-w-sm mx-auto">
              <img
                src={movieConfig?.film_assets?.poster_image ? 
                  process.env.REACT_APP_BACKEND_URL + movieConfig.film_assets.poster_image :
                  'https://images.pexels.com/photos/30619403/pexels-photo-30619403.jpeg'
                }
                alt="Movie Poster"
                className="w-full h-full object-cover rounded-lg shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.4))'
                }}
              />
            </div>
          </div>

          {/* Film Metadata */}
          <div className="flex-grow space-y-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: textColor }}>
                <span style={{ color: accentColor }}>
                  {movieConfig?.movie_title || 'Film Title'}
                </span>
              </h1>
              {movieConfig?.movie_subtitle && (
                <h2 className="text-xl opacity-80 mb-4" style={{ color: textColor }}>
                  {movieConfig.movie_subtitle}
                </h2>
              )}
            </div>

            {movieConfig?.film_details?.logline && (
              <p className="text-lg italic opacity-90 leading-relaxed" style={{ color: textColor }}>
                "{movieConfig.film_details.logline}"
              </p>
            )}

            {/* Promotional Badges */}
            <div className="space-y-3">
              {movieConfig?.film_assets?.badge_images?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {movieConfig.film_assets.badge_images.map((badgeUrl, index) => (
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
                /* Fallback badges */
                <div className="space-y-2">
                  <div className="inline-block">
                    <span 
                      className="px-4 py-2 rounded font-bold text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      🎬 NOW PLAYING
                    </span>
                  </div>
                  <div className="block">
                    <span className="bg-gray-800 px-4 py-2 rounded text-white">
                      ONLY IN THEATERS
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Film Details */}
            {(movieConfig?.director || movieConfig?.cast?.length > 0) && (
              <div className="space-y-2 text-sm">
                {movieConfig.director && (
                  <p style={{ color: textColor, opacity: 0.8 }}>
                    <span className="font-medium">Director:</span> {movieConfig.director}
                  </p>
                )}
                {movieConfig.cast?.length > 0 && (
                  <p style={{ color: textColor, opacity: 0.8 }}>
                    <span className="font-medium">Starring:</span> {movieConfig.cast.slice(0, 3).join(', ')}
                    {movieConfig.cast.length > 3 && ' & more'}
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