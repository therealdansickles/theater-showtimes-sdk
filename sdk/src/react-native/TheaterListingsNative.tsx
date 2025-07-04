import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
  ScrollView
} from 'react-native';
import { TheaterLocation, TheaterListingsProps, ScreeningCategory } from '../types';
import { 
  formatShowtime,
  categorizeTime,
  getTimeCategoryLabel,
  getTimeCategoryIcon,
  groupScreeningCategoriesByType,
  getScreeningCategoryTypeLabel
} from '../utils';

const { width: screenWidth } = Dimensions.get('window');

interface TheaterListingsNativeProps extends Omit<TheaterListingsProps, 'className'> {
  containerStyle?: any;
  selectedTimeCategories?: string[];
  onTimeCategoryFilter?: (categories: string[]) => void;
  availableScreeningCategories?: ScreeningCategory[];
}

export const TheaterListingsNative: React.FC<TheaterListingsNativeProps> = ({
  theaters,
  selectedFormats = [],
  selectedTimeCategories = [],
  onTheaterSelect,
  onFormatFilter,
  onTimeCategoryFilter,
  theme,
  loading = false,
  mobileOptimized = true,
  containerStyle = {},
  availableScreeningCategories = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'name'>('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'formats' | 'time'>('formats');
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const styles = createStyles(theme);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Select Theater</Text>
      
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search theaters..."
        placeholderTextColor={styles.placeholderText.color}
        value={searchTerm}
        onChangeText={setSearchTerm}
        returnKeyType="search"
      />

      {/* Filter Controls */}
      <View style={styles.filterContainer}>
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
            onPress={() => setSortBy('distance')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'distance' && styles.sortButtonTextActive]}>
              Distance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => setSortBy('name')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
              Name
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>
            🎬 Filters ({selectedFormats.length + selectedTimeCategories.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Enhanced Filters with Tabs */}
      {showFilters && (
        <View style={styles.formatsContainer}>
          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, activeFilterTab === 'formats' && styles.filterTabActive]}
              onPress={() => setActiveFilterTab('formats')}
            >
              <Text style={[styles.filterTabText, activeFilterTab === 'formats' && styles.filterTabTextActive]}>
                🎬 Formats
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, activeFilterTab === 'time' && styles.filterTabActive]}
              onPress={() => setActiveFilterTab('time')}
            >
              <Text style={[styles.filterTabText, activeFilterTab === 'time' && styles.filterTabTextActive]}>
                🕐 Time
              </Text>
            </TouchableOpacity>
          </View>

          {/* Format Filters */}
          {activeFilterTab === 'formats' && (
            <View style={styles.formatsGrid}>
              {availableFormats.map(format => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatButton,
                    selectedFormats.includes(format) && styles.formatButtonActive
                  ]}
                  onPress={() => handleFormatToggle(format)}
                >
                  <Text style={[
                    styles.formatButtonText,
                    selectedFormats.includes(format) && styles.formatButtonTextActive
                  ]}>
                    {format}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Time Category Filters */}
          {activeFilterTab === 'time' && (
            <View style={styles.timeGrid}>
              {availableTimeCategories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.timeButton,
                    selectedTimeCategories.includes(category) && styles.timeButtonActive
                  ]}
                  onPress={() => handleTimeCategoryToggle(category)}
                >
                  <View style={styles.timeButtonContent}>
                    <Text style={styles.timeButtonIcon}>{getTimeCategoryIcon(category)}</Text>
                    <View style={styles.timeButtonTextContainer}>
                      <Text style={[
                        styles.timeButtonTitle,
                        selectedTimeCategories.includes(category) && styles.timeButtonTitleActive
                      ]}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text style={[
                        styles.timeButtonDescription,
                        selectedTimeCategories.includes(category) && styles.timeButtonDescriptionActive
                      ]}>
                        {getTimeCategoryLabel(category)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Clear Filters */}
          {(selectedFormats.length > 0 || selectedTimeCategories.length > 0) && (
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                onFormatFilter?.([]);
                onTimeCategoryFilter?.([]);
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderTheaterCard = ({ item, index }: { item: TheaterLocation; index: number }) => (
    <TheaterCard
      theater={item}
      onSelect={() => onTheaterSelect(item)}
      theme={theme}
      index={index}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No theaters found</Text>
      <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, containerStyle]}>
        <ActivityIndicator size="large" color={theme?.accent_color || '#ef4444'} />
        <Text style={styles.loadingText}>Loading theaters...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <FlatList
        data={filteredTheaters}
        renderItem={renderTheaterCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme?.accent_color || '#ef4444'}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

// Theater Card Component
interface TheaterCardProps {
  theater: TheaterLocation;
  onSelect: () => void;
  theme?: any;
  index: number;
}

const TheaterCard: React.FC<TheaterCardProps> = ({
  theater,
  onSelect,
  theme,
  index
}) => {
  const styles = createTheaterCardStyles(theme);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.chainBadge}>
            <Text style={styles.chainBadgeText}>{theater.chain.charAt(0)}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.theaterName} numberOfLines={2}>{theater.name}</Text>
            <Text style={styles.theaterChain}>{theater.chain}</Text>
          </View>
          {theater.distance && (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>{theater.distance} mi</Text>
            </View>
          )}
        </View>

        {/* Address */}
        <Text style={styles.address} numberOfLines={2}>{theater.address}</Text>

        {/* Formats and Showtimes */}
        <View style={styles.formatsContainer}>
          {theater.formats.map((format, formatIndex) => {
            // Handle both new ScreeningFormat and legacy TheaterFormat structures
            const formatName = 'category_name' in format ? format.category_name : (format as any).type;
            const times = 'times' in format ? format.times : [];
            
            return (
              <View key={formatIndex} style={styles.formatSection}>
                <View style={styles.formatHeader}>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatBadgeText}>{formatName}</Text>
                  </View>
                </View>
                <View style={styles.timesContainer}>
                  {times.slice(0, 3).map((time, timeIndex) => {
                    const timeStr = typeof time === 'string' ? time : time.time;
                    const timeCategory = typeof time === 'object' && 'category' in time 
                      ? time.category 
                      : categorizeTime(timeStr);
                    
                    return (
                      <TouchableOpacity
                        key={timeIndex}
                        style={styles.timeButton}
                        onPress={onSelect}
                        activeOpacity={0.7}
                      >
                        <View style={styles.timeButtonContent}>
                          <Text style={styles.timeCategoryIcon}>
                            {getTimeCategoryIcon(timeCategory)}
                          </Text>
                          <Text style={styles.timeButtonText}>
                            {formatShowtime(timeStr)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  {times.length > 3 && (
                    <TouchableOpacity style={styles.moreButton} onPress={onSelect}>
                      <Text style={styles.moreButtonText}>+{times.length - 3}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>🧭</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📱</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme?: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme?.background_color || '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme?.text_color || '#ffffff',
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme?.text_color ? `${theme.text_color}30` : '#ffffff30',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme?.accent_color || '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: theme?.surface || '#1a1a1a',
    borderWidth: 1,
    borderColor: theme?.accent_color ? `${theme.accent_color}30` : '#ef444430',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme?.text_color || '#ffffff',
    marginBottom: 16,
  },
  placeholderText: {
    color: theme?.text_color ? `${theme.text_color}60` : '#ffffff60',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: theme?.text_color || '#ffffff',
    opacity: 0.8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sortButtonActive: {
    backgroundColor: theme?.accent_color || '#ef4444',
  },
  sortButtonText: {
    fontSize: 12,
    color: theme?.text_color || '#ffffff',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme?.accent_color || '#ef4444',
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: theme?.accent_color || '#ef4444',
  },
  filterButtonText: {
    fontSize: 14,
    color: theme?.accent_color || '#ef4444',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  formatsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: theme?.surface || '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme?.accent_color ? `${theme.accent_color}30` : '#ef444430',
  },
  formatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formatButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme?.accent_color ? `${theme.accent_color}30` : '#ef444430',
    backgroundColor: 'transparent',
    minWidth: 80,
  },
  formatButtonActive: {
    backgroundColor: theme?.accent_color || '#ef4444',
    borderColor: theme?.accent_color || '#ef4444',
  },
  formatButtonText: {
    fontSize: 12,
    color: theme?.text_color || '#ffffff',
    textAlign: 'center',
    fontWeight: '500',
  },
  formatButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme?.accent_color ? `${theme.accent_color}30` : '#ef444430',
    paddingBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: theme?.accent_color || '#ef4444',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme?.text_color || '#ffffff',
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  timeGrid: {
    gap: 8,
  },
  timeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme?.accent_color ? `${theme.accent_color}30` : '#ef444430',
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  timeButtonActive: {
    backgroundColor: theme?.accent_color || '#ef4444',
    borderColor: theme?.accent_color || '#ef4444',
  },
  timeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timeButtonTextContainer: {
    flex: 1,
  },
  timeButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme?.text_color || '#ffffff',
  },
  timeButtonTitleActive: {
    color: '#ffffff',
  },
  timeButtonDescription: {
    fontSize: 12,
    color: theme?.text_color || '#ffffff',
    opacity: 0.8,
    marginTop: 2,
  },
  timeButtonDescriptionActive: {
    color: '#ffffff',
    opacity: 1,
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme?.accent_color || '#ef4444',
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  clearFiltersText: {
    fontSize: 12,
    color: theme?.accent_color || '#ef4444',
    fontWeight: '500',
    textAlign: 'center',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme?.text_color || '#ffffff',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme?.text_color || '#ffffff',
    opacity: 0.7,
    textAlign: 'center',
  },
});

const createTheaterCardStyles = (theme?: any) => StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme?.accent_color || '#ef4444',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chainBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chainBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerText: {
    flex: 1,
  },
  theaterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  theaterChain: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
  },
  distanceContainer: {
    alignItems: 'flex-end',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  address: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 16,
    lineHeight: 20,
  },
  formatsContainer: {
    marginBottom: 16,
  },
  formatSection: {
    marginBottom: 12,
  },
  formatHeader: {
    marginBottom: 8,
  },
  formatBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  formatBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    minHeight: 28,
    justifyContent: 'center',
  },
  timeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCategoryIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  moreButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    minHeight: 28,
    justifyContent: 'center',
  },
  moreButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
});