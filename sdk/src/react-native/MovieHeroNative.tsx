import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
  Platform
} from 'react-native';
import { MovieConfig, MovieHeroProps } from '../types';
import { optimizeImageUrl } from '../utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MovieHeroNativeProps extends Omit<MovieHeroProps, 'className' | 'style'> {
  containerStyle?: any;
}

export const MovieHeroNative: React.FC<MovieHeroNativeProps> = ({
  movie,
  theme,
  onBookNowClick,
  showTrailer = false,
  mobileOptimized = true,
  containerStyle = {}
}) => {
  const heroImage = movie.hero_image 
    ? optimizeImageUrl(movie.hero_image, { width: screenWidth, quality: 85, format: 'webp' })
    : 'https://images.pexels.com/photos/19263380/pexels-photo-19263380.jpeg';
  
  const posterImage = movie.poster_image
    ? optimizeImageUrl(movie.poster_image, { width: 300, quality: 90, format: 'webp' })
    : 'https://images.pexels.com/photos/30619403/pexels-photo-30619403.jpeg';

  const primaryButton = movie.primary_button || { 
    background_color: '#ef4444', 
    text_color: '#ffffff', 
    border_radius: 8, 
    emoji: '🎬', 
    emoji_position: 'left' 
  };

  const styles = createStyles(movie);

  const renderButton = (buttonConfig: typeof primaryButton, text: string) => {
    const ButtonContent = () => (
      <>
        {buttonConfig.emoji && buttonConfig.emoji_position === 'left' && (
          <Text style={styles.buttonEmoji}>{buttonConfig.emoji}</Text>
        )}
        <Text style={[styles.buttonText, { color: buttonConfig.text_color }]}>
          {text}
        </Text>
        {buttonConfig.emoji && buttonConfig.emoji_position === 'right' && (
          <Text style={styles.buttonEmoji}>{buttonConfig.emoji}</Text>
        )}
      </>
    );

    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: buttonConfig.background_color,
            borderRadius: buttonConfig.border_radius
          }
        ]}
        onPress={onBookNowClick}
        activeOpacity={0.8}
      >
        {buttonConfig.emoji_position === 'top' ? (
          <View style={styles.buttonColumnContent}>
            <Text style={styles.buttonEmoji}>{buttonConfig.emoji}</Text>
            <Text style={[styles.buttonText, { color: buttonConfig.text_color }]}>
              {text}
            </Text>
          </View>
        ) : buttonConfig.emoji_position === 'bottom' ? (
          <View style={styles.buttonColumnContent}>
            <Text style={[styles.buttonText, { color: buttonConfig.text_color }]}>
              {text}
            </Text>
            <Text style={styles.buttonEmoji}>{buttonConfig.emoji}</Text>
          </View>
        ) : (
          <View style={styles.buttonRowContent}>
            <ButtonContent />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <ImageBackground 
        source={{ uri: heroImage }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Overlay */}
        <View style={styles.overlay} />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          {movie.logo_image && (
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: optimizeImageUrl(movie.logo_image, { width: 200, quality: 90 }) }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { fontFamily: movie.typography?.font_family }]}>
                <Text style={[styles.titleAccent, { color: movie.accent_color || '#ef4444' }]}>
                  {movie.movie_title || 'Movie Title'}
                </Text>
                {movie.movie_subtitle && (
                  <Text style={styles.titleSubtitle}>
                    {'\n'}{movie.movie_subtitle}
                  </Text>
                )}
              </Text>
            </View>

            {/* Description */}
            <Text style={[styles.description, { color: movie.text_color || '#ffffff' }]}>
              {movie.description || 'Movie description goes here.'}
            </Text>

            {/* Movie Details */}
            <View style={styles.detailsContainer}>
              {movie.rating && (
                <View style={styles.detailBadge}>
                  <Text style={styles.detailBadgeText}>{movie.rating}</Text>
                </View>
              )}
              {movie.runtime && (
                <View style={styles.detailBadge}>
                  <Text style={styles.detailBadgeText}>{movie.runtime}</Text>
                </View>
              )}
              {movie.genre && movie.genre.slice(0, 2).map((genre, index) => (
                <View key={index} style={styles.detailBadge}>
                  <Text style={styles.detailBadgeText}>{genre}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {renderButton(primaryButton, 'Book Now')}
              
              {showTrailer && (
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    { borderColor: movie.accent_color || '#ef4444' }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>▶️ Watch Trailer</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Status Badges */}
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: movie.accent_color || '#ef4444' }
              ]}>
                <Text style={styles.statusText}>NOW PLAYING</Text>
              </View>
              
              <View style={styles.statusBadgeSecondary}>
                <Text style={styles.statusTextSecondary}>ONLY IN THEATERS</Text>
              </View>
              
              <View style={styles.statusBadgeGold}>
                <Text style={styles.statusTextGold}>FILMED FOR IMAX</Text>
              </View>
            </View>
          </View>

          {/* Poster Image */}
          <View style={styles.posterContainer}>
            <Image 
              source={{ uri: posterImage }}
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.posterOverlay} />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const createStyles = (movie: MovieConfig) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: movie.background_color || '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    minHeight: screenHeight,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 60,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    color: movie.text_color || '#ffffff',
  },
  titleAccent: {
    fontSize: 32,
    fontWeight: '800',
  },
  titleSubtitle: {
    fontSize: 28,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    opacity: 0.9,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  detailBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  detailBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 200,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonColumnContent: {
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonEmoji: {
    fontSize: 20,
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 200,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadgeSecondary: {
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusTextSecondary: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeGold: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusTextGold: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  posterContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  poster: {
    width: 240,
    height: 360,
    borderRadius: 12,
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
});