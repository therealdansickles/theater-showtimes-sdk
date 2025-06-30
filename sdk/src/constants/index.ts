import { ThemeConfig } from '../types';

// Default theme configuration
export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: '#ef4444',
    secondary: '#f97316',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#ef4444',
    error: '#dc2626',
    success: '#16a34a',
    warning: '#ca8a04'
  },
  gradients: {
    primary: {
      type: 'linear',
      direction: '135deg',
      colors: ['#ef4444', '#dc2626'],
      stops: [0, 100]
    },
    secondary: {
      type: 'linear',
      direction: '135deg',
      colors: ['#f97316', '#ea580c'],
      stops: [0, 100]
    },
    accent: {
      type: 'linear',
      direction: '135deg',
      colors: ['#8b5cf6', '#7c3aed'],
      stops: [0, 100]
    }
  },
  typography: {
    font_family: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    heading_font_size: '2.5rem',
    body_font_size: '1rem',
    font_weights: {
      light: 300,
      normal: 400,
      semibold: 600,
      bold: 800
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1440
  },
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  darkMode: true,
  mobileOptimized: false
};

// Supported movie formats
export const SUPPORTED_FORMATS = [
  '2D',
  'IMAX',
  'IMAX 2D',
  'IMAX 3D',
  'DOLBY',
  'DOLBY ATMOS',
  '4DX',
  'SCREENX',
  'AMC PRIME',
  'DBOX',
  'VIP',
  'PREMIUM',
  '70MM'
] as const;

// API endpoints
export const API_ENDPOINTS = {
  HEALTH: '/health',
  MOVIES: '/movies',
  THEATERS: '/theaters',
  BOOKINGS: '/bookings',
  UPLOADS: '/uploads',
  PRESETS: '/presets',
  CLIENTS: '/clients'
} as const;

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED'
} as const;

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  MAX_FILES_PER_UPLOAD: 10
} as const;

// Mobile breakpoints
export const MOBILE_BREAKPOINTS = {
  SMALL_MOBILE: 320,
  MOBILE: 480,
  LARGE_MOBILE: 640,
  TABLET: 768,
  LARGE_TABLET: 1024
} as const;

// Animation presets
export const ANIMATION_PRESETS = {
  FADE_IN: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  SLIDE_UP: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  SLIDE_LEFT: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  },
  SCALE_IN: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  }
} as const;

// Preset themes
export const PRESET_THEMES = {
  ACTION: {
    name: 'Action Hero',
    colors: {
      primary: '#ef4444',
      secondary: '#f97316',
      accent: '#dc2626'
    },
    emoji: '🎬'
  },
  HORROR: {
    name: 'Horror Dark',
    colors: {
      primary: '#7f1d1d',
      secondary: '#991b1b',
      accent: '#dc2626'
    },
    emoji: '💀'
  },
  ROMANCE: {
    name: 'Romantic Blush',
    colors: {
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#be185d'
    },
    emoji: '💕'
  },
  SCIFI: {
    name: 'Sci-Fi Neon',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#0284c7'
    },
    emoji: '🚀'
  },
  COMEDY: {
    name: 'Comedy Bright',
    colors: {
      primary: '#eab308',
      secondary: '#f59e0b',
      accent: '#d97706'
    },
    emoji: '😂'
  },
  THRILLER: {
    name: 'Thriller Dark',
    colors: {
      primary: '#374151',
      secondary: '#4b5563',
      accent: '#6b7280'
    },
    emoji: '🔪'
  }
} as const;

// Emoji collections
export const EMOJI_COLLECTIONS = {
  MOVIE: ['🎬', '🎭', '🎪', '🎨', '🎯'],
  ACTION: ['💥', '🔥', '⚡', '💫', '🚀'],
  HORROR: ['💀', '🎃', '👻', '🖤', '🔪'],
  ROMANCE: ['💕', '🌹', '💖', '🌟', '💝'],
  SCIFI: ['🚀', '🛸', '🤖', '👽', '🌌'],
  COMEDY: ['😂', '🎭', '🎪', '🤣', '😄'],
  GENERAL: ['⭐', '🎫', '🍿', '📽️', '🎵']
} as const;

// Social media platforms
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  SNAPCHAT: 'snapchat'
} as const;

// Payment providers
export const PAYMENT_PROVIDERS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  VENMO: 'venmo'
} as const;

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: {
    name: 'Basic',
    max_movies: 1,
    max_images: 10,
    max_theaters: 50,
    features: ['Basic customization', 'Standard support']
  },
  PREMIUM: {
    name: 'Premium',
    max_movies: 5,
    max_images: 50,
    max_theaters: 200,
    features: ['Advanced customization', 'Priority support', 'Analytics']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    max_movies: 50,
    max_images: 500,
    max_theaters: 1000,
    features: ['Full customization', 'Dedicated support', 'Advanced analytics', 'White-label']
  }
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 2 * 60 * 60 * 1000,  // 2 hours
  EXTENDED: 24 * 60 * 60 * 1000 // 24 hours
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_REPORTING: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_A_B_TESTING: false,
  ENABLE_REAL_TIME_UPDATES: true
} as const;