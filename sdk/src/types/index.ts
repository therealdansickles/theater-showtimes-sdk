import { ReactNode } from 'react';

// Core SDK Configuration
export interface SDKOptions {
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  baseUrl?: string;
  theme?: Partial<ThemeConfig>;
  locale?: string;
  enableAnalytics?: boolean;
  enableErrorReporting?: boolean;
}

// Movie Configuration
export interface MovieConfig {
  id: string;
  client_id: string;
  movie_title: string;
  movie_subtitle?: string;
  description: string;
  
  // Visual Configuration
  primary_gradient: GradientConfig;
  secondary_gradient: GradientConfig;
  background_color: string;
  text_color: string;
  accent_color: string;
  
  // Typography
  typography: TypographyConfig;
  
  // Button Styles
  primary_button: ButtonStyle;
  secondary_button: ButtonStyle;
  
  // Images
  hero_image?: string;
  poster_image?: string;
  logo_image?: string;
  background_images: string[];
  
  // Movie Details
  release_date: string;
  rating: string;
  runtime: string;
  genre: string[];
  director: string;
  cast: string[];
  
  // Booking Configuration
  available_formats: string[]; // Legacy field
  screening_categories: ScreeningCategory[]; // New dynamic categories
  theaters: TheaterLocation[];
  
  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Theme Configuration
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
  };
  gradients: {
    primary: GradientConfig;
    secondary: GradientConfig;
    accent: GradientConfig;
  };
  typography: TypographyConfig;
  spacing: SpacingConfig;
  breakpoints: BreakpointConfig;
  animations: AnimationConfig;
  darkMode: boolean;
  mobileOptimized: boolean;
}

export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic';
  direction?: string;
  colors: string[];
  stops: number[];
}

export interface TypographyConfig {
  font_family: string;
  heading_font_size: string;
  body_font_size: string;
  font_weights: {
    light: number;
    normal: number;
    semibold: number;
    bold: number;
  };
}

export interface SpacingConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface AnimationConfig {
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

// Button Configuration
export interface ButtonStyle {
  background_color: string;
  text_color: string;
  border_radius: number;
  emoji?: string;
  emoji_position: 'left' | 'right' | 'top' | 'bottom';
  hover_effect?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Theater Location
export interface TheaterLocation {
  id: string;
  name: string;
  chain: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  distance?: number;
  formats: ScreeningFormat[]; // Updated to use new ScreeningFormat
  showtimes: string[]; // Legacy field for backwards compatibility
  amenities?: string[];
  phone?: string;
  website?: string;
  // Legacy formats for backwards compatibility
  legacy_formats?: TheaterFormat[];
}

// Screening Categories
export interface ScreeningCategory {
  id: string;
  name: string;
  type: 'format' | 'experience' | 'special_event';
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface TimeSlot {
  time: string;
  category: 'morning' | 'afternoon' | 'evening' | 'late_night';
  available_seats?: number;
  price_modifier?: number;
}

export interface ScreeningFormat {
  category_id: string;
  category_name: string;
  times: TimeSlot[];
  price?: number;
  special_notes?: string;
}

// Theater Format (Legacy - for backwards compatibility)
export interface TheaterFormat {
  type: string;
  times: string[];
  price?: number;
  available_seats?: number;
}

// Booking Configuration
export interface BookingConfig {
  movie_id: string;
  theater_id: string;
  showtime: string;
  format: string;
  seats?: SeatSelection[];
  customer_info?: CustomerInfo;
}

export interface SeatSelection {
  row: string;
  seat: number;
  type: 'standard' | 'premium' | 'vip';
  price: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

// Events
export interface BookingEvent {
  type: 'booking_started' | 'theater_selected' | 'showtime_selected' | 'booking_completed' | 'booking_failed';
  data: any;
  timestamp: number;
}

// Customization Presets
export interface CustomizationPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: Partial<ThemeConfig>;
  is_public: boolean;
  preview_image?: string;
}

// Component Props
export interface MovieBookingWidgetProps {
  movieId: string;
  theme?: string | Partial<ThemeConfig>;
  apiKey?: string;
  onBookingComplete?: (booking: BookingConfig) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  mobileOptimized?: boolean;
  showPoweredBy?: boolean;
}

export interface MovieHeroProps {
  movie: MovieConfig;
  theme?: Partial<ThemeConfig>;
  onBookNowClick?: () => void;
  showTrailer?: boolean;
  className?: string;
  mobileOptimized?: boolean;
}

export interface TheaterListingsProps {
  theaters: TheaterLocation[];
  selectedFormats?: string[];
  onTheaterSelect: (theater: TheaterLocation) => void;
  onFormatFilter?: (formats: string[]) => void;
  theme?: Partial<ThemeConfig>;
  loading?: boolean;
  mobileOptimized?: boolean;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface SDKError extends Error {
  code: string;
  context?: any;
}