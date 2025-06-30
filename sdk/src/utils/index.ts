import { ThemeConfig, GradientConfig } from '../types';

// Theme validation
export const validateTheme = (theme: ThemeConfig): boolean => {
  if (!theme.colors || !theme.gradients) {
    throw new Error('Invalid theme: missing required color or gradient properties');
  }

  // Validate color format
  const colorRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
  Object.values(theme.colors).forEach(color => {
    if (!colorRegex.test(color)) {
      throw new Error(`Invalid color format: ${color}`);
    }
  });

  return true;
};

// Generate CSS for gradients
export const generateGradientCSS = (gradient: GradientConfig): string => {
  const { type, direction, colors, stops } = gradient;
  
  let gradientString = '';
  
  switch (type) {
    case 'linear':
      gradientString = `linear-gradient(${direction || '135deg'}, `;
      break;
    case 'radial':
      gradientString = `radial-gradient(circle, `;
      break;
    case 'conic':
      gradientString = `conic-gradient(from 0deg, `;
      break;
    default:
      gradientString = `linear-gradient(135deg, `;
  }

  // Combine colors with stops
  const colorStops = colors.map((color, index) => {
    const stop = stops[index] !== undefined ? `${stops[index]}%` : '';
    return `${color} ${stop}`.trim();
  });

  gradientString += colorStops.join(', ') + ')';
  
  return gradientString;
};

// Optimize image URLs with query parameters
export const optimizeImageUrl = (
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string => {
  if (!url) return '';

  const params = new URLSearchParams();
  
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  const separator = url.includes('?') ? '&' : '?';
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
};

// Format showtime for display
export const formatShowtime = (showtime: string, format24h: boolean = false): string => {
  try {
    const date = new Date(`2000-01-01T${showtime}`);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !format24h
    };
    return date.toLocaleTimeString('en-US', options);
  } catch {
    return showtime;
  }
};

// Generate unique IDs
export const generateUniqueId = (): string => {
  return `sdk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Device detection utilities
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getScreenSize = (): { width: number; height: number } => {
  if (typeof window === 'undefined') return { width: 375, height: 667 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { width } = getScreenSize();
  return width >= 768 && width < 1024;
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { width } = getScreenSize();
  return width >= 1024;
};

// Touch and gesture utilities
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Color utilities
export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const isLightColor = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
};

// Animation utilities
export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Storage utilities
export const saveToLocalStorage = (key: string, value: any): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// API utilities
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

// Error handling utilities
export const createError = (message: string, code?: string, context?: any): Error => {
  const error = new Error(message) as any;
  if (code) error.code = code;
  if (context) error.context = context;
  return error;
};

// Date utilities
export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
    
  return dateObj.toLocaleDateString('en-US', options);
};

export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
};

export const isTomorrow = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return dateObj.getDate() === tomorrow.getDate() &&
         dateObj.getMonth() === tomorrow.getMonth() &&
         dateObj.getFullYear() === tomorrow.getFullYear();
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
};

// Time categorization utilities
export const categorizeTime = (timeStr: string): 'morning' | 'afternoon' | 'evening' | 'late_night' => {
  try {
    // Parse various time formats
    const cleanTime = timeStr.trim().toUpperCase();
    
    let hour: number;
    
    // Handle common formats
    if (cleanTime.includes('PM') || cleanTime.includes('AM')) {
      // 12-hour format
      const timePart = cleanTime.replace(/[AP]M/, '').trim();
      const hourPart = parseInt(timePart.split(':')[0]);
      
      if (cleanTime.includes('PM') && hourPart !== 12) {
        hour = hourPart + 12;
      } else if (cleanTime.includes('AM') && hourPart === 12) {
        hour = 0;
      } else {
        hour = hourPart;
      }
    } else {
      // 24-hour format or just hour
      hour = parseInt(cleanTime.split(':')[0]);
    }
    
    // Categorize based on hour
    if (hour >= 6 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'evening';
    } else {
      return 'late_night';
    }
    
  } catch (error) {
    // Default to evening if parsing fails
    return 'evening';
  }
};

export const getTimeCategoryLabel = (category: string): string => {
  const labels = {
    morning: 'Morning (6AM - 12PM)',
    afternoon: 'Afternoon (12PM - 5PM)',
    evening: 'Evening (5PM - 10PM)',
    late_night: 'Late Night (10PM - 6AM)'
  };
  return labels[category as keyof typeof labels] || 'Unknown';
};

export const getTimeCategoryIcon = (category: string): string => {
  const icons = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    late_night: '🌙'
  };
  return icons[category as keyof typeof icons] || '🕐';
};

export const filterTimeSlotsByCategory = (
  timeSlots: Array<{ time: string; category?: string }>,
  selectedCategories: string[]
): Array<{ time: string; category: string }> => {
  if (selectedCategories.length === 0) {
    return timeSlots.map(slot => ({
      ...slot,
      category: slot.category || categorizeTime(slot.time)
    }));
  }
  
  return timeSlots
    .map(slot => ({
      ...slot,
      category: slot.category || categorizeTime(slot.time)
    }))
    .filter(slot => selectedCategories.includes(slot.category));
};

// Screening category utilities
export const groupScreeningCategoriesByType = (categories: Array<{ type: string; name: string; id: string }>) => {
  return categories.reduce((groups, category) => {
    const type = category.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(category);
    return groups;
  }, {} as Record<string, Array<{ type: string; name: string; id: string }>>);
};

export const getScreeningCategoryTypeLabel = (type: string): string => {
  const labels = {
    format: 'Formats',
    experience: 'Experiences', 
    special_event: 'Special Events'
  };
  return labels[type as keyof typeof labels] || type;
};

export const getScreeningCategoryTypeIcon = (type: string): string => {
  const icons = {
    format: '🎬',
    experience: '⭐',
    special_event: '🎉'
  };
  return icons[type as keyof typeof icons] || '📽️';
};