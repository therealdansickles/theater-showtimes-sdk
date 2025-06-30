// Core SDK exports
export { MovieBookingSDK } from './core/MovieBookingSDK';
export { createMovieBookingIntegration } from './core/integration';

// React components
export {
  MovieHero,
  TheaterListings,
  BookingFlow,
  CustomThemeProvider,
  MovieBookingWidget
} from './react';

// React Native components (conditional export)
export {
  MovieHeroNative,
  TheaterListingsNative,
  BookingFlowNative,
  MovieBookingWidgetNative
} from './react-native';

// Types
export type {
  MovieConfig,
  ThemeConfig,
  BookingConfig,
  TheaterLocation,
  SDKOptions,
  BookingEvent,
  CustomizationPreset
} from './types';

// Utilities
export {
  validateTheme,
  generateGradientCSS,
  optimizeImageUrl,
  formatShowtime
} from './utils';

// Constants
export {
  DEFAULT_THEME,
  SUPPORTED_FORMATS,
  API_ENDPOINTS
} from './constants';