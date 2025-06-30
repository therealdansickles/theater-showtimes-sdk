# Movie Booking SDK

A comprehensive, mobile-optimized SDK for integrating movie ticket booking functionality into any platform.

## 🚀 Quick Start

### Installation

```bash
npm install @your-platform/movie-booking-sdk
# or
yarn add @your-platform/movie-booking-sdk
```

### React Integration

```jsx
import React from 'react';
import { MovieBookingWidget } from '@your-platform/movie-booking-sdk/react';

function App() {
  return (
    <MovieBookingWidget
      movieId="movie-123"
      apiKey="your-api-key"
      theme="action-hero"
      onBookingComplete={(booking) => {
        console.log('Booking completed:', booking);
      }}
      mobileOptimized={true}
    />
  );
}
```

### React Native Integration

```jsx
import React from 'react';
import { MovieBookingWidgetNative } from '@your-platform/movie-booking-sdk/react-native';

function MovieScreen() {
  return (
    <MovieBookingWidgetNative
      movieId="movie-123"
      apiKey="your-api-key"
      theme="sci-fi-neon"
      onBookingComplete={(booking) => {
        console.log('Booking completed:', booking);
      }}
      mobileOptimized={true}
      statusBarStyle="light-content"
    />
  );
}
```

### Vanilla JavaScript Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Movie Booking</title>
</head>
<body>
  <div id="movie-booking"></div>
  
  <script src="https://cdn.your-platform.com/movie-booking-sdk.js"></script>
  <script>
    const booking = MovieBookingSDK.createIntegration({
      movieId: 'movie-123',
      apiKey: 'your-api-key',
      containerId: 'movie-booking',
      theme: 'horror-dark',
      mobileOptimized: true
    });
  </script>
</body>
</html>
```

## 📱 Mobile Optimization

The SDK is built with mobile-first design principles:

- **Touch-friendly interactions**: Minimum 44px touch targets
- **Responsive layouts**: Automatically adapts to screen sizes
- **Performance optimized**: Lazy loading and efficient rendering
- **Native feel**: Platform-specific UI patterns
- **Gesture support**: Swipe, pinch, and scroll gestures

### Mobile-Specific Features

```jsx
import { isMobileDevice, getScreenSize } from '@your-platform/movie-booking-sdk/utils';

// Detect mobile device
if (isMobileDevice()) {
  // Apply mobile-specific logic
}

// Get screen dimensions
const { width, height } = getScreenSize();

// Optimize widget for mobile
<MovieBookingWidget
  movieId="movie-123"
  mobileOptimized={true}
  theme={{
    mobileOptimized: true,
    spacing: {
      xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24
    }
  }}
/>
```

## 🎨 Customization

### Theme Configuration

```jsx
const customTheme = {
  colors: {
    primary: '#ef4444',
    secondary: '#f97316',
    background: '#000000',
    text: '#ffffff',
    accent: '#dc2626'
  },
  gradients: {
    primary: {
      type: 'linear',
      direction: '135deg',
      colors: ['#ef4444', '#dc2626'],
      stops: [0, 100]
    }
  },
  typography: {
    font_family: 'Inter, sans-serif',
    heading_font_size: '2.5rem',
    body_font_size: '1rem'
  }
};

<MovieBookingWidget
  movieId="movie-123"
  theme={customTheme}
/>
```

### Button Customization with Emojis

```jsx
const buttonStyle = {
  background_color: '#ef4444',
  text_color: '#ffffff',
  border_radius: 8,
  emoji: '🎬',
  emoji_position: 'left'
};

<MovieBookingWidget
  movieId="movie-123"
  theme={{
    primary_button: buttonStyle
  }}
/>
```

### Available Emojis

🎬 🎫 🍿 🎭 🎪 🎨 🎯 ⭐ 🔥 💥 🚀 💫 💀 🎃 👻 🖤 💕 🌹 💖 🌟 🛸 🤖 👽 🌌

## 🎭 Preset Themes

```jsx
// Available preset themes
const themes = [
  'action-hero',    // 🎬 Bold reds and oranges
  'horror-dark',    // 💀 Dark with blood red accents  
  'romantic-blush', // 💕 Soft pinks and purples
  'sci-fi-neon',    // 🚀 Futuristic blues and cyans
  'comedy-bright',  // 😂 Bright yellows and oranges
  'thriller-dark'   // 🔪 Dark greys and blacks
];

<MovieBookingWidget
  movieId="movie-123"
  theme="sci-fi-neon"
/>
```

## 🔌 Integration Options

### Iframe Embed

```html
<iframe 
  src="https://embed.your-platform.com/movie?movieId=movie-123&theme=action-hero"
  width="100%"
  height="600px"
  frameborder="0"
  allowfullscreen
></iframe>
```

### JavaScript Widget

```javascript
// Initialize SDK
const sdk = new MovieBookingSDK({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Create booking widget
const widget = sdk.createWidget({
  movieId: 'movie-123',
  container: '#booking-container',
  theme: 'horror-dark',
  onBookingComplete: (booking) => {
    // Handle booking completion
  }
});
```

## 📊 Event Handling

```jsx
<MovieBookingWidget
  movieId="movie-123"
  onBookingComplete={(booking) => {
    console.log('Booking completed:', booking);
    // Analytics tracking
    analytics.track('booking_completed', booking);
  }}
  onError={(error) => {
    console.error('Booking error:', error);
    // Error reporting
    errorReporting.captureException(error);
  }}
  onTheaterSelect={(theater) => {
    console.log('Theater selected:', theater);
  }}
  onShowtimeSelect={(showtime) => {
    console.log('Showtime selected:', showtime);
  }}
/>
```

## 🛠️ Advanced Usage

### Custom SDK Configuration

```javascript
const sdk = new MovieBookingSDK({
  apiKey: 'your-api-key',
  environment: 'production',
  baseUrl: 'https://api.your-platform.com/api',
  enableAnalytics: true,
  enableErrorReporting: true,
  locale: 'en-US',
  theme: customTheme
});

// Get movie configuration
const movieConfig = await sdk.getMovieConfig('movie-123');

// Update movie configuration
await sdk.updateMovieConfig('movie-123', {
  accent_color: '#ff6b35'
});

// Upload custom images
const imageResult = await sdk.uploadImage(file, 'hero');

// Get customization presets
const presets = await sdk.getCustomizationPresets('action');
```

### Real-time Updates

```jsx
import { useEffect, useState } from 'react';

function BookingWidget() {
  const [movieConfig, setMovieConfig] = useState(null);

  useEffect(() => {
    // Listen for real-time updates
    const unsubscribe = sdk.onConfigUpdate('movie-123', (config) => {
      setMovieConfig(config);
    });

    return unsubscribe;
  }, []);

  return (
    <MovieBookingWidget
      movieId="movie-123"
      config={movieConfig}
    />
  );
}
```

## 📱 React Native Specific Features

### Navigation Integration

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MovieBooking" 
          component={() => (
            <MovieBookingWidgetNative
              movieId="movie-123"
              onBookingComplete={(booking) => {
                // Navigate to confirmation screen
                navigation.navigate('BookingConfirmation', { booking });
              }}
            />
          )}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Push Notifications

```jsx
import { registerForPushNotificationsAsync } from 'expo-notifications';

function BookingScreen() {
  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      sdk.registerPushToken(token);
    });
  }, []);

  return (
    <MovieBookingWidgetNative
      movieId="movie-123"
      enablePushNotifications={true}
    />
  );
}
```

## 🔒 Security

### API Key Management

```javascript
// Development
const sdk = new MovieBookingSDK({
  apiKey: process.env.REACT_APP_MOVIE_BOOKING_API_KEY,
  environment: 'development'
});

// Production with additional security
const sdk = new MovieBookingSDK({
  apiKey: process.env.MOVIE_BOOKING_API_KEY,
  environment: 'production',
  enableRateLimiting: true,
  enableRequestSigning: true
});
```

## 📈 Analytics

```jsx
<MovieBookingWidget
  movieId="movie-123"
  enableAnalytics={true}
  onAnalyticsEvent={(event, data) => {
    // Custom analytics tracking
    switch (event) {
      case 'movie_viewed':
        analytics.track('Movie Viewed', data);
        break;
      case 'theater_selected':
        analytics.track('Theater Selected', data);
        break;
      case 'booking_started':
        analytics.track('Booking Started', data);
        break;
      case 'booking_completed':
        analytics.track('Booking Completed', data);
        break;
    }
  }}
/>
```

## 🐛 Error Handling

```jsx
import { ErrorBoundary } from '@your-platform/movie-booking-sdk/react';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Widget error:', error, errorInfo);
        // Send to error reporting service
        Sentry.captureException(error, { extra: errorInfo });
      }}
      fallback={<div>Something went wrong. Please try again.</div>}
    >
      <MovieBookingWidget movieId="movie-123" />
    </ErrorBoundary>
  );
}
```

## 🧪 Testing

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MovieBookingWidget } from '@your-platform/movie-booking-sdk/react';

// Mock SDK
jest.mock('@your-platform/movie-booking-sdk/core');

test('renders movie booking widget', async () => {
  render(
    <MovieBookingWidget
      movieId="test-movie"
      apiKey="test-api-key"
    />
  );

  await waitFor(() => {
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });
});

test('handles booking completion', async () => {
  const onBookingComplete = jest.fn();
  
  render(
    <MovieBookingWidget
      movieId="test-movie"
      onBookingComplete={onBookingComplete}
    />
  );

  fireEvent.click(screen.getByText('Book Now'));
  
  await waitFor(() => {
    expect(onBookingComplete).toHaveBeenCalled();
  });
});
```

## 📚 API Reference

### Components

- `MovieBookingWidget` - Main React component
- `MovieBookingWidgetNative` - React Native component
- `MovieHero` - Hero section component
- `TheaterListings` - Theater selection component
- `BookingFlow` - Booking process component

### Utilities

- `validateTheme()` - Theme validation
- `generateGradientCSS()` - CSS gradient generator
- `optimizeImageUrl()` - Image optimization
- `formatShowtime()` - Time formatting
- `isMobileDevice()` - Device detection

### Types

- `MovieConfig` - Movie configuration interface
- `ThemeConfig` - Theme configuration interface
- `BookingConfig` - Booking data interface
- `SDKOptions` - SDK initialization options

## 🆘 Support

- 📧 Email: support@your-platform.com
- 📖 Documentation: https://docs.your-platform.com
- 🐛 Issues: https://github.com/your-platform/movie-booking-sdk/issues
- 💬 Discord: https://discord.gg/your-platform

## 📄 License

MIT License - see LICENSE file for details.