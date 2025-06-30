import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieBookingSDK } from '../core/MovieBookingSDK';
import { MovieConfig, ThemeConfig, MovieBookingWidgetProps, BookingConfig } from '../types';
import { CustomThemeProvider } from './CustomThemeProvider';
import { MovieHero } from './MovieHero';
import { TheaterListings } from './TheaterListings';
import { BookingFlow } from './BookingFlow';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorBoundary } from './ErrorBoundary';

export const MovieBookingWidget: React.FC<MovieBookingWidgetProps> = ({
  movieId,
  theme,
  apiKey,
  onBookingComplete,
  onError,
  className = '',
  style = {},
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
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
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
    setCurrentStep('hero'); // Reset to hero
  }, [onBookingComplete]);

  const handleBackClick = useCallback(() => {
    if (currentStep === 'booking') {
      setCurrentStep('theaters');
    } else if (currentStep === 'theaters') {
      setCurrentStep('hero');
    }
  }, [currentStep]);

  if (loading) {
    return (
      <div className={`movie-booking-widget ${className}`} style={style}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`movie-booking-widget error ${className}`} style={style}>
        <div className="error-message">
          <h3>Error Loading Movie</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!movieConfig) {
    return (
      <div className={`movie-booking-widget ${className}`} style={style}>
        <div className="no-data">
          <p>Movie not found</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <CustomThemeProvider theme={movieConfig} mobileOptimized={mobileOptimized}>
        <div className={`movie-booking-widget ${className}`} style={style}>
          <AnimatePresence mode="wait">
            {currentStep === 'hero' && (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MovieHero
                  movie={movieConfig}
                  onBookNowClick={handleBookNowClick}
                  mobileOptimized={mobileOptimized}
                />
              </motion.div>
            )}

            {currentStep === 'theaters' && (
              <motion.div
                key="theaters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="step-header">
                  <button onClick={handleBackClick} className="back-button">
                    ← Back to Movie
                  </button>
                  <h2>Select Theater</h2>
                </div>
                <TheaterListings
                  theaters={movieConfig.theaters}
                  onTheaterSelect={handleTheaterSelect}
                  mobileOptimized={mobileOptimized}
                />
              </motion.div>
            )}

            {currentStep === 'booking' && selectedTheater && (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="step-header">
                  <button onClick={handleBackClick} className="back-button">
                    ← Back to Theaters
                  </button>
                  <h2>Complete Booking</h2>
                </div>
                <BookingFlow
                  movie={movieConfig}
                  theater={selectedTheater}
                  onBookingComplete={handleBookingComplete}
                  mobileOptimized={mobileOptimized}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {showPoweredBy && (
            <div className="powered-by">
              <small>Powered by Your Platform</small>
            </div>
          )}
        </div>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
};