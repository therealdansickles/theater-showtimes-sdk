import React, { createContext, useContext, useMemo } from 'react';
import { MovieConfig, ThemeConfig } from '../types';
import { DEFAULT_THEME } from '../constants';
import { generateGradientCSS, hexToRgba, isLightColor } from '../utils';

interface ThemeContextType {
  theme: ThemeConfig;
  movieConfig: MovieConfig | null;
  generateGradient: (gradient: any) => string;
  getColor: (colorKey: keyof ThemeConfig['colors']) => string;
  getSpacing: (size: keyof ThemeConfig['spacing']) => string;
  getBreakpoint: (size: keyof ThemeConfig['breakpoints']) => string;
  isLightTheme: boolean;
  isMobileOptimized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface CustomThemeProviderProps {
  theme?: MovieConfig | Partial<ThemeConfig>;
  mobileOptimized?: boolean;
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  theme,
  mobileOptimized = true,
  children
}) => {
  const themeValue = useMemo(() => {
    let finalTheme: ThemeConfig;
    let movieConfig: MovieConfig | null = null;

    if (theme && 'movie_title' in theme) {
      // If theme is MovieConfig
      movieConfig = theme as MovieConfig;
      finalTheme = {
        ...DEFAULT_THEME,
        colors: {
          ...DEFAULT_THEME.colors,
          primary: movieConfig.accent_color || DEFAULT_THEME.colors.primary,
          secondary: movieConfig.primary_gradient?.colors[1] || DEFAULT_THEME.colors.secondary,
          background: movieConfig.background_color || DEFAULT_THEME.colors.background,
          text: movieConfig.text_color || DEFAULT_THEME.colors.text,
          accent: movieConfig.accent_color || DEFAULT_THEME.colors.accent
        },
        gradients: {
          primary: movieConfig.primary_gradient || DEFAULT_THEME.gradients.primary,
          secondary: movieConfig.secondary_gradient || DEFAULT_THEME.gradients.secondary,
          accent: DEFAULT_THEME.gradients.accent
        },
        typography: movieConfig.typography || DEFAULT_THEME.typography,
        mobileOptimized: mobileOptimized
      };
    } else if (theme) {
      // If theme is partial ThemeConfig
      finalTheme = {
        ...DEFAULT_THEME,
        ...theme,
        colors: {
          ...DEFAULT_THEME.colors,
          ...(theme as Partial<ThemeConfig>).colors
        },
        gradients: {
          ...DEFAULT_THEME.gradients,
          ...(theme as Partial<ThemeConfig>).gradients
        },
        typography: {
          ...DEFAULT_THEME.typography,
          ...(theme as Partial<ThemeConfig>).typography
        },
        spacing: {
          ...DEFAULT_THEME.spacing,
          ...(theme as Partial<ThemeConfig>).spacing
        },
        breakpoints: {
          ...DEFAULT_THEME.breakpoints,
          ...(theme as Partial<ThemeConfig>).breakpoints
        },
        animations: {
          ...DEFAULT_THEME.animations,
          ...(theme as Partial<ThemeConfig>).animations
        },
        mobileOptimized: mobileOptimized
      };
    } else {
      finalTheme = {
        ...DEFAULT_THEME,
        mobileOptimized: mobileOptimized
      };
    }

    // Adjust spacing for mobile if needed
    if (mobileOptimized) {
      finalTheme.spacing = {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24
      };
    }

    const generateGradient = (gradient: any) => {
      return generateGradientCSS(gradient);
    };

    const getColor = (colorKey: keyof ThemeConfig['colors']) => {
      return finalTheme.colors[colorKey];
    };

    const getSpacing = (size: keyof ThemeConfig['spacing']) => {
      return `${finalTheme.spacing[size]}px`;
    };

    const getBreakpoint = (size: keyof ThemeConfig['breakpoints']) => {
      return `${finalTheme.breakpoints[size]}px`;
    };

    const isLightTheme = isLightColor(finalTheme.colors.background);

    return {
      theme: finalTheme,
      movieConfig,
      generateGradient,
      getColor,
      getSpacing,
      getBreakpoint,
      isLightTheme,
      isMobileOptimized: mobileOptimized
    };
  }, [theme, mobileOptimized]);

  // Create CSS custom properties
  const cssVariables = useMemo(() => {
    const { theme: finalTheme } = themeValue;
    
    return {
      '--color-primary': finalTheme.colors.primary,
      '--color-secondary': finalTheme.colors.secondary,
      '--color-background': finalTheme.colors.background,
      '--color-surface': finalTheme.colors.surface,
      '--color-text': finalTheme.colors.text,
      '--color-text-secondary': finalTheme.colors.textSecondary,
      '--color-accent': finalTheme.colors.accent,
      '--color-error': finalTheme.colors.error,
      '--color-success': finalTheme.colors.success,
      '--color-warning': finalTheme.colors.warning,
      
      '--gradient-primary': generateGradientCSS(finalTheme.gradients.primary),
      '--gradient-secondary': generateGradientCSS(finalTheme.gradients.secondary),
      '--gradient-accent': generateGradientCSS(finalTheme.gradients.accent),
      
      '--font-family': finalTheme.typography.font_family,
      '--font-size-heading': finalTheme.typography.heading_font_size,
      '--font-size-body': finalTheme.typography.body_font_size,
      '--font-weight-light': finalTheme.typography.font_weights.light.toString(),
      '--font-weight-normal': finalTheme.typography.font_weights.normal.toString(),
      '--font-weight-semibold': finalTheme.typography.font_weights.semibold.toString(),
      '--font-weight-bold': finalTheme.typography.font_weights.bold.toString(),
      
      '--spacing-xs': `${finalTheme.spacing.xs}px`,
      '--spacing-sm': `${finalTheme.spacing.sm}px`,
      '--spacing-md': `${finalTheme.spacing.md}px`,
      '--spacing-lg': `${finalTheme.spacing.lg}px`,
      '--spacing-xl': `${finalTheme.spacing.xl}px`,
      '--spacing-xxl': `${finalTheme.spacing.xxl}px`,
      
      '--breakpoint-mobile': `${finalTheme.breakpoints.mobile}px`,
      '--breakpoint-tablet': `${finalTheme.breakpoints.tablet}px`,
      '--breakpoint-desktop': `${finalTheme.breakpoints.desktop}px`,
      '--breakpoint-wide': `${finalTheme.breakpoints.wide}px`,
      
      '--animation-duration-fast': `${finalTheme.animations.duration.fast}ms`,
      '--animation-duration-normal': `${finalTheme.animations.duration.normal}ms`,
      '--animation-duration-slow': `${finalTheme.animations.duration.slow}ms`,
      
      '--animation-easing-linear': finalTheme.animations.easing.linear,
      '--animation-easing-ease-in': finalTheme.animations.easing.easeIn,
      '--animation-easing-ease-out': finalTheme.animations.easing.easeOut,
      '--animation-easing-ease-in-out': finalTheme.animations.easing.easeInOut
    };
  }, [themeValue]);

  // Global styles for the theme
  const globalStyles = useMemo(() => {
    const { theme: finalTheme } = themeValue;
    
    return `
      .movie-booking-theme {
        font-family: ${finalTheme.typography.font_family};
        color: ${finalTheme.colors.text};
        background-color: ${finalTheme.colors.background};
        line-height: 1.6;
      }
      
      .movie-booking-theme *,
      .movie-booking-theme *::before,
      .movie-booking-theme *::after {
        box-sizing: border-box;
      }
      
      .movie-booking-theme button {
        font-family: inherit;
      }
      
      .movie-booking-theme input,
      .movie-booking-theme textarea,
      .movie-booking-theme select {
        font-family: inherit;
        color: inherit;
      }
      
      .movie-booking-theme h1,
      .movie-booking-theme h2,
      .movie-booking-theme h3,
      .movie-booking-theme h4,
      .movie-booking-theme h5,
      .movie-booking-theme h6 {
        font-weight: ${finalTheme.typography.font_weights.bold};
        line-height: 1.2;
        margin: 0;
      }
      
      .movie-booking-theme p {
        margin: 0;
      }
      
      .movie-booking-theme a {
        color: ${finalTheme.colors.accent};
        text-decoration: none;
        transition: color ${finalTheme.animations.duration.fast}ms ${finalTheme.animations.easing.easeInOut};
      }
      
      .movie-booking-theme a:hover {
        color: ${hexToRgba(finalTheme.colors.accent, 0.8)};
      }
      
      .movie-booking-theme button:focus,
      .movie-booking-theme input:focus,
      .movie-booking-theme textarea:focus,
      .movie-booking-theme select:focus {
        outline: 2px solid ${finalTheme.colors.accent};
        outline-offset: 2px;
      }
      
      .movie-booking-theme .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      @media (max-width: ${finalTheme.breakpoints.mobile}px) {
        .movie-booking-theme {
          font-size: 14px;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        .movie-booking-theme *,
        .movie-booking-theme *::before,
        .movie-booking-theme *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      @media (prefers-color-scheme: dark) {
        .movie-booking-theme {
          color-scheme: dark;
        }
      }
    `;
  }, [themeValue]);

  // Inject global styles
  React.useEffect(() => {
    const styleId = 'movie-booking-theme-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = globalStyles;
    
    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [globalStyles]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <div 
        className="movie-booking-theme" 
        style={cssVariables as React.CSSProperties}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a CustomThemeProvider');
  }
  return context;
};

// Higher-order component for theme injection
export const withTheme = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const ThemedComponent = React.forwardRef<any, P>((props, ref) => {
    const theme = useTheme();
    return <Component {...props} ref={ref} theme={theme} />;
  });
  
  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  
  return ThemedComponent;
};

// Theme utility hooks
export const useColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

export const useSpacing = () => {
  const { getSpacing } = useTheme();
  return getSpacing;
};

export const useBreakpoints = () => {
  const { theme } = useTheme();
  return theme.breakpoints;
};

export const useAnimations = () => {
  const { theme } = useTheme();
  return theme.animations;
};

export const useGradients = () => {
  const { theme, generateGradient } = useTheme();
  return {
    gradients: theme.gradients,
    generateGradient
  };
};

export const useResponsive = () => {
  const { theme, isMobileOptimized } = useTheme();
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowWidth < theme.breakpoints.mobile,
    isTablet: windowWidth >= theme.breakpoints.mobile && windowWidth < theme.breakpoints.desktop,
    isDesktop: windowWidth >= theme.breakpoints.desktop,
    isWide: windowWidth >= theme.breakpoints.wide,
    windowWidth,
    isMobileOptimized
  };
};