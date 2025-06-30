import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TheaterLocation, TheaterListingsProps, ScreeningCategory } from '../types';
import { 
  generateGradientCSS, 
  formatShowtime, 
  categorizeTime, 
  getTimeCategoryLabel, 
  getTimeCategoryIcon,
  groupScreeningCategoriesByType,
  getScreeningCategoryTypeLabel,
  filterTimeSlotsByCategory
} from '../utils';
import { ANIMATION_PRESETS } from '../constants';

export const TheaterListings: React.FC<TheaterListingsProps> = ({
  theaters,
  selectedFormats = [],
  selectedTimeCategories = [],
  onTheaterSelect,
  onFormatFilter,
  onTimeCategoryFilter,
  theme,
  loading = false,
  mobileOptimized = true,
  availableScreeningCategories = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'formats' | 'time'>('formats');

  // Filter and sort theaters
  const filteredTheaters = useMemo(() => {
    let filtered = theaters.filter(theater => {
      // Search filter
      const matchesSearch = theater.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           theater.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           theater.city.toLowerCase().includes(searchTerm.toLowerCase());

      // Format filter - handle both new and legacy format structures
      let matchesFormat = true;
      if (selectedFormats.length > 0) {
        matchesFormat = theater.formats.some(format => {
          // New structure: ScreeningFormat with category_name
          if ('category_name' in format) {
            return selectedFormats.includes(format.category_name);
          }
          // Legacy structure: TheaterFormat with type
          if ('type' in format) {
            return selectedFormats.includes((format as any).type);
          }
          return false;
        });
      }

      // Time category filter
      let matchesTimeCategory = true;
      if (selectedTimeCategories.length > 0) {
        matchesTimeCategory = theater.formats.some(format => {
          const times = 'times' in format ? format.times : [];
          return times.some(timeSlot => {
            const timeStr = typeof timeSlot === 'string' ? timeSlot : timeSlot.time;
            const timeCategory = typeof timeSlot === 'object' && 'category' in timeSlot 
              ? timeSlot.category 
              : categorizeTime(timeStr);
            return selectedTimeCategories.includes(timeCategory);
          });
        });
      }

      return matchesSearch && matchesFormat && matchesTimeCategory;
    });

    // Sort theaters
    filtered.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance || 0) - (b.distance || 0);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [theaters, searchTerm, selectedFormats, selectedTimeCategories, sortBy]);

  // Available formats from all theaters - handle both new and legacy structures
  const availableFormats = useMemo(() => {
    const formats = new Set<string>();
    theaters.forEach(theater => {
      theater.formats.forEach(format => {
        // New structure: ScreeningFormat with category_name
        if ('category_name' in format) {
          formats.add(format.category_name);
        }
        // Legacy structure: TheaterFormat with type
        else if ('type' in format) {
          formats.add((format as any).type);
        }
      });
    });
    return Array.from(formats).sort();
  }, [theaters]);

  // Available time categories from all theaters
  const availableTimeCategories = useMemo(() => {
    const categories = new Set<string>();
    theaters.forEach(theater => {
      theater.formats.forEach(format => {
        const times = 'times' in format ? format.times : [];
        times.forEach(timeSlot => {
          const timeStr = typeof timeSlot === 'string' ? timeSlot : timeSlot.time;
          const timeCategory = typeof timeSlot === 'object' && 'category' in timeSlot 
            ? timeSlot.category 
            : categorizeTime(timeStr);
          categories.add(timeCategory);
        });
      });
    });
    return Array.from(categories).sort();
  }, [theaters]);

  const handleFormatToggle = (format: string) => {
    const newFormats = selectedFormats.includes(format)
      ? selectedFormats.filter(f => f !== format)
      : [...selectedFormats, format];
    onFormatFilter?.(newFormats);
  };

  const handleTimeCategoryToggle = (category: string) => {
    const newCategories = selectedTimeCategories.includes(category)
      ? selectedTimeCategories.filter(c => c !== category)
      : [...selectedTimeCategories, category];
    onTimeCategoryFilter?.(newCategories);
  };

  const containerStyle = {
    padding: mobileOptimized ? '16px' : '24px',
    backgroundColor: theme?.background_color || '#000000',
    color: theme?.text_color || '#ffffff',
    minHeight: '400px'
  };

  const searchBarStyle = {
    width: '100%',
    padding: mobileOptimized ? '12px 16px' : '16px 20px',
    borderRadius: '12px',
    border: `1px solid ${theme?.accent_color || '#ef4444'}30`,
    backgroundColor: theme?.surface || '#1a1a1a',
    color: theme?.text_color || '#ffffff',
    fontSize: '16px',
    marginBottom: '16px'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <motion.div
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${theme?.accent_color || '#ef4444'}30`,
              borderTop: `3px solid ${theme?.accent_color || '#ef4444'}`,
              borderRadius: '50%'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p style={{ opacity: 0.7 }}>Loading theaters...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <motion.div 
        style={{ marginBottom: '24px' }}
        {...ANIMATION_PRESETS.SLIDE_UP}
      >
        <h2 style={{ 
          fontSize: mobileOptimized ? '24px' : '32px',
          fontWeight: '700',
          marginBottom: '16px',
          color: theme?.accent_color || '#ef4444'
        }}>
          Select Theater
        </h2>

        {/* Search Bar */}
        <motion.input
          type="text"
          placeholder="Search theaters by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchBarStyle}
          {...ANIMATION_PRESETS.FADE_IN}
          transition={{ delay: 0.1 }}
        />

        {/* Filter Controls */}
        <motion.div 
          style={{ 
            display: 'flex', 
            flexDirection: mobileOptimized ? 'column' : 'row',
            gap: '16px',
            alignItems: mobileOptimized ? 'stretch' : 'center'
          }}
          {...ANIMATION_PRESETS.FADE_IN}
          transition={{ delay: 0.2 }}
        >
          {/* Sort Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', opacity: 0.8 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'name')}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: `1px solid ${theme?.accent_color || '#ef4444'}30`,
                backgroundColor: theme?.surface || '#1a1a1a',
                color: theme?.text_color || '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="distance">Distance</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme?.accent_color || '#ef4444'}`,
              backgroundColor: showFilters ? theme?.accent_color || '#ef4444' : 'transparent',
              color: showFilters ? '#ffffff' : theme?.accent_color || '#ef4444',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🎬 Filters ({selectedFormats.length + selectedTimeCategories.length})
          </motion.button>
        </motion.div>

        {/* Format and Time Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: theme?.surface || '#1a1a1a',
                border: `1px solid ${theme?.accent_color || '#ef4444'}30`
              }}
            >
              {/* Filter Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                borderBottom: `1px solid ${theme?.accent_color || '#ef4444'}30`,
                paddingBottom: '8px'
              }}>
                <motion.button
                  onClick={() => setActiveFilterTab('formats')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeFilterTab === 'formats' 
                      ? theme?.accent_color || '#ef4444' 
                      : 'transparent',
                    color: activeFilterTab === 'formats' 
                      ? '#ffffff' 
                      : theme?.text_color || '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🎬 Formats
                </motion.button>
                <motion.button
                  onClick={() => setActiveFilterTab('time')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeFilterTab === 'time' 
                      ? theme?.accent_color || '#ef4444' 
                      : 'transparent',
                    color: activeFilterTab === 'time' 
                      ? '#ffffff' 
                      : theme?.text_color || '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🕐 Time
                </motion.button>
              </div>

              {/* Format Filters */}
              {activeFilterTab === 'formats' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: mobileOptimized ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '8px'
                  }}
                >
                  {availableFormats.map(format => (
                    <motion.button
                      key={format}
                      onClick={() => handleFormatToggle(format)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme?.accent_color || '#ef4444'}30`,
                        backgroundColor: selectedFormats.includes(format) 
                          ? theme?.accent_color || '#ef4444' 
                          : 'transparent',
                        color: selectedFormats.includes(format) 
                          ? '#ffffff' 
                          : theme?.text_color || '#ffffff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {format}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Time Category Filters */}
              {activeFilterTab === 'time' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: mobileOptimized ? '1fr' : 'repeat(2, 1fr)',
                    gap: '8px'
                  }}
                >
                  {availableTimeCategories.map(category => (
                    <motion.button
                      key={category}
                      onClick={() => handleTimeCategoryToggle(category)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: `1px solid ${theme?.accent_color || '#ef4444'}30`,
                        backgroundColor: selectedTimeCategories.includes(category) 
                          ? theme?.accent_color || '#ef4444' 
                          : 'transparent',
                        color: selectedTimeCategories.includes(category) 
                          ? '#ffffff' 
                          : theme?.text_color || '#ffffff',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span style={{ fontSize: '16px' }}>{getTimeCategoryIcon(category)}</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                          {category.replace('_', ' ')}
                        </span>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>
                          {getTimeCategoryLabel(category)}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Clear Filters */}
              {(selectedFormats.length > 0 || selectedTimeCategories.length > 0) && (
                <motion.div
                  style={{ marginTop: '16px', textAlign: 'center' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.button
                    onClick={() => {
                      onFormatFilter?.([]);
                      onTimeCategoryFilter?.([]);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: `1px solid ${theme?.accent_color || '#ef4444'}`,
                      backgroundColor: 'transparent',
                      color: theme?.accent_color || '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All Filters
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Theater List */}
      <motion.div 
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        {...ANIMATION_PRESETS.FADE_IN}
        transition={{ delay: 0.3 }}
      >
        <AnimatePresence>
          {filteredTheaters.length === 0 ? (
            <motion.div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                opacity: 0.7
              }}
              {...ANIMATION_PRESETS.FADE_IN}
            >
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No theaters found</p>
              <p style={{ fontSize: '14px' }}>Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            filteredTheaters.map((theater, index) => (
              <TheaterCard
                key={theater.id}
                theater={theater}
                onSelect={() => onTheaterSelect(theater)}
                theme={theme}
                mobileOptimized={mobileOptimized}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Theater Card Component
interface TheaterCardProps {
  theater: TheaterLocation;
  onSelect: () => void;
  theme?: any;
  mobileOptimized?: boolean;
  index: number;
}

const TheaterCard: React.FC<TheaterCardProps> = ({
  theater,
  onSelect,
  theme,
  mobileOptimized = true,
  index
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const primaryGradient = theme?.primary_gradient || { 
    type: 'linear', 
    direction: '135deg', 
    colors: ['#ef4444', '#dc2626'], 
    stops: [0, 100] 
  };

  const secondaryGradient = theme?.secondary_gradient || { 
    type: 'linear', 
    direction: '135deg', 
    colors: ['#f97316', '#ea580c'], 
    stops: [0, 100] 
  };

  const cardStyle = {
    background: isHovered 
      ? generateGradientCSS(secondaryGradient)
      : generateGradientCSS(primaryGradient),
    padding: mobileOptimized ? '16px' : '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: `1px solid ${theme?.accent_color || '#ef4444'}30`,
    minHeight: mobileOptimized ? '120px' : '140px'
  };

  return (
    <motion.div
      style={cardStyle}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexDirection: mobileOptimized ? 'column' : 'row',
        gap: mobileOptimized ? '12px' : '16px'
      }}>
        {/* Theater Info */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '8px'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#000000',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {theater.chain.charAt(0)}
            </div>
            <div>
              <h3 style={{ 
                fontWeight: '700',
                fontSize: mobileOptimized ? '16px' : '18px',
                margin: 0,
                color: '#ffffff'
              }}>
                {theater.name}
              </h3>
              <p style={{ 
                fontSize: '12px',
                margin: 0,
                opacity: 0.9,
                color: '#ffffff'
              }}>
                {theater.chain}
              </p>
            </div>
          </div>

          {/* Address */}
          <p style={{ 
            fontSize: '14px',
            opacity: 0.9,
            marginBottom: '12px',
            color: '#ffffff'
          }}>
            {theater.address}
          </p>

          {/* Formats and Showtimes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {theater.formats.map((format, formatIndex) => (
              <div 
                key={formatIndex}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}>
                  {format.type}
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {format.times.map((time, timeIndex) => (
                    <motion.button
                      key={timeIndex}
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minHeight: '28px'
                      }}
                      whileHover={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        scale: 1.05
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                      }}
                    >
                      {formatShowtime(time)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distance and Actions */}
        <div style={{
          display: 'flex',
          flexDirection: mobileOptimized ? 'row' : 'column',
          alignItems: mobileOptimized ? 'center' : 'flex-end',
          justifyContent: 'space-between',
          gap: '8px',
          width: mobileOptimized ? '100%' : 'auto'
        }}>
          {theater.distance && (
            <div style={{
              fontSize: '14px',
              opacity: 0.9,
              fontWeight: '600',
              color: '#ffffff'
            }}>
              {theater.distance} miles
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <motion.button
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#ffffff',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                minWidth: '36px',
                minHeight: '36px'
              }}
              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle directions
              }}
            >
              🧭
            </motion.button>
            <motion.button
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: '#ffffff',
                border: 'none',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                minWidth: '36px',
                minHeight: '36px'
              }}
              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                // Handle share
              }}
            >
              📱
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};