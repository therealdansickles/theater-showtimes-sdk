import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { MovieBookingSDK } from '../core/MovieBookingSDK';
import { MovieConfig, MovieBookingWidgetProps, BookingConfig } from '../types';
import { MovieHeroNative } from './MovieHeroNative';
import { TheaterListingsNative } from './TheaterListingsNative';
import { BookingFlowNative } from './BookingFlowNative';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MovieBookingWidgetNativeProps extends Omit<MovieBookingWidgetProps, 'className' | 'style'> {
  containerStyle?: any;
  statusBarStyle?: 'light-content' | 'dark-content' | 'default';
}

export const MovieBookingWidgetNative: React.FC<MovieBookingWidgetNativeProps> = ({
  movieId,
  theme,
  apiKey,
  onBookingComplete,
  onError,
  containerStyle = {},
  statusBarStyle = 'light-content',
  mobileOptimized = true,
  showPoweredBy = true
}) => {
  const [sdk, setSdk] = useState<MovieBookingSDK | null>(null);
  const [movieConfig, setMovieConfig] = useState<MovieConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'hero' | 'theaters' | 'booking'>('hero');
  const [selectedTheater, setSelectedTheater] = useState<any>(null);

  // Initialize SDK
  useEffect(() => {
    if (!apiKey) {
      setError('API key is required');
      return;
    }

    const initSDK = async () => {
      try {
        const sdkInstance = new MovieBookingSDK({
          apiKey,
          environment: __DEV__ ? 'development' : 'production',
          theme: typeof theme === 'object' ? theme : undefined,
          enableAnalytics: true
        });

        if (mobileOptimized) {
          sdkInstance.optimizeForMobile();
        }

        setSdk(sdkInstance);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize SDK';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      }
    };

    initSDK();
  }, [apiKey, theme, mobileOptimized, onError]);

  // Load movie configuration
  useEffect(() => {
    if (!sdk || !movieId) return;

    const loadMovieConfig = async () => {
      try {
        setLoading(true);
        const config = await sdk.getMovieConfig(movieId);
        setMovieConfig(config);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load movie configuration';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    loadMovieConfig();
  }, [sdk, movieId, onError]);

  const handleBookNowClick = useCallback(() => {
    setCurrentStep('theaters');
  }, []);

  const handleTheaterSelect = useCallback((theater: any) => {
    setSelectedTheater(theater);
    setCurrentStep('booking');
  }, []);

  const handleBookingComplete = useCallback((booking: BookingConfig) => {
    onBookingComplete?.(booking);
    setCurrentStep('hero');
  }, [onBookingComplete]);

  const handleBackClick = useCallback(() => {
    if (currentStep === 'booking') {
      setCurrentStep('theaters');
    } else if (currentStep === 'theaters') {
      setCurrentStep('hero');
    }
  }, [currentStep]);

  const styles = createStyles(movieConfig);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, containerStyle]}>
        <StatusBar barStyle={statusBarStyle} />
        <ActivityIndicator size="large" color={movieConfig?.accent_color || '#ef4444'} />
        <Text style={styles.loadingText}>Loading movie...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, containerStyle]}>
        <StatusBar barStyle={statusBarStyle} />
        <Text style={styles.errorTitle}>Error Loading Movie</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!movieConfig) {
    return (
      <View style={[styles.container, styles.centerContent, containerStyle]}>
        <StatusBar barStyle={statusBarStyle} />
        <Text style={styles.errorMessage}>Movie not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={movieConfig.background_color}
        translucent={Platform.OS === 'android'}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {currentStep === 'hero' && (
          <MovieHeroNative
            movie={movieConfig}
            onBookNowClick={handleBookNowClick}
            mobileOptimized={mobileOptimized}
          />
        )}

        {currentStep === 'theaters' && (
          <View>
            <View style={styles.stepHeader}>
              <TouchableOpacity onPress={handleBackClick} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back to Movie</Text>
              </TouchableOpacity>
              <Text style={styles.stepTitle}>Select Theater</Text>
            </View>
            <TheaterListingsNative
              theaters={movieConfig.theaters}
              onTheaterSelect={handleTheaterSelect}
              mobileOptimized={mobileOptimized}
            />
          </View>
        )}

        {currentStep === 'booking' && selectedTheater && (
          <View>
            <View style={styles.stepHeader}>
              <TouchableOpacity onPress={handleBackClick} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back to Theaters</Text>
              </TouchableOpacity>
              <Text style={styles.stepTitle}>Complete Booking</Text>
            </View>
            <BookingFlowNative
              movie={movieConfig}
              theater={selectedTheater}
              onBookingComplete={handleBookingComplete}
              mobileOptimized={mobileOptimized}
            />
          </View>
        )}

        {showPoweredBy && (
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered by Your Platform</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (movieConfig?: MovieConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: movieConfig?.background_color || '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepHeader: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: movieConfig?.text_color ? `${movieConfig.text_color}30` : '#ffffff30',
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    color: movieConfig?.accent_color || '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: movieConfig?.text_color || '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: movieConfig?.text_color || '#ffffff',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: movieConfig?.text_color || '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  poweredBy: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: movieConfig?.text_color ? `${movieConfig.text_color}30` : '#ffffff30',
  },
  poweredByText: {
    fontSize: 12,
    color: movieConfig?.text_color ? `${movieConfig.text_color}60` : '#ffffff60',
  },
});