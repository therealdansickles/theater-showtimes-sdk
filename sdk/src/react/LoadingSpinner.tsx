import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './CustomThemeProvider';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  text,
  fullScreen = false,
  className = '',
  style = {}
}) => {
  const { theme, getColor } = useTheme();
  
  const spinnerColor = color || getColor('accent');
  
  const sizes = {
    small: { width: 20, height: 20, borderWidth: 2 },
    medium: { width: 40, height: 40, borderWidth: 3 },
    large: { width: 60, height: 60, borderWidth: 4 }
  };

  const spinnerSize = sizes[size];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }),
    ...style
  };

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize.width,
    height: spinnerSize.height,
    border: `${spinnerSize.borderWidth}px solid transparent`,
    borderTop: `${spinnerSize.borderWidth}px solid ${spinnerColor}`,
    borderRight: `${spinnerSize.borderWidth}px solid ${spinnerColor}30`,
    borderRadius: '50%'
  };

  const textStyle: React.CSSProperties = {
    color: theme.colors.text,
    fontSize: size === 'small' ? '12px' : size === 'large' ? '18px' : '14px',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '200px'
  };

  return (
    <div className={`loading-spinner ${className}`} style={containerStyle}>
      {/* Main Spinner */}
      <motion.div
        style={spinnerStyle}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Pulsing Dots Animation */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: spinnerColor,
              borderRadius: '50%'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      {text && (
        <motion.p
          style={textStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Skeleton loading component for content placeholders
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
  style = {}
}) => {
  const { theme } = useTheme();

  const skeletonStyle: React.CSSProperties = {
    width,
    height,
    borderRadius,
    backgroundColor: theme.colors.surface,
    position: 'relative',
    overflow: 'hidden',
    ...style
  };

  return (
    <div className={`skeleton ${className}`} style={skeletonStyle}>
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${theme.colors.textSecondary}30, transparent)`
        }}
        animate={{ left: ['100%', '-100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};

// Loading overlay for specific components
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  spinnerSize?: 'small' | 'medium' | 'large';
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  spinnerSize = 'medium',
  className = ''
}) => {
  const { theme } = useTheme();

  return (
    <div className={`loading-overlay-container ${className}`} style={{ position: 'relative' }}>
      {children}
      
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `${theme.colors.background}CC`,
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <LoadingSpinner size={spinnerSize} text={text} />
        </motion.div>
      )}
    </div>
  );
};

// Button loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText = 'Loading...',
  children,
  variant = 'primary',
  size = 'medium',
  disabled,
  style = {},
  ...props
}) => {
  const { theme } = useTheme();

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: isLoading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    opacity: isLoading || disabled ? 0.7 : 1,
    ...style
  };

  const sizeStyles = {
    small: { padding: '8px 16px', fontSize: '14px', minHeight: '36px' },
    medium: { padding: '12px 24px', fontSize: '16px', minHeight: '44px' },
    large: { padding: '16px 32px', fontSize: '18px', minHeight: '52px' }
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: '#ffffff'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      border: `2px solid ${theme.colors.primary}`
    }
  };

  const buttonStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };

  return (
    <motion.button
      {...props}
      disabled={isLoading || disabled}
      style={buttonStyle}
      whileHover={!isLoading && !disabled ? { scale: 1.02 } : {}}
      whileTap={!isLoading && !disabled ? { scale: 0.98 } : {}}
    >
      {isLoading ? (
        <>
          <LoadingSpinner 
            size="small" 
            color="#ffffff"
          />
          {loadingText}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

// Progress bar component
interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color,
  backgroundColor,
  showPercentage = false,
  animated = true,
  className = '',
  style = {}
}) => {
  const { theme } = useTheme();

  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.surface;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: `${height}px`,
    backgroundColor: bgColor,
    borderRadius: `${height / 2}px`,
    overflow: 'hidden',
    position: 'relative',
    ...style
  };

  const progressStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: progressColor,
    borderRadius: `${height / 2}px`,
    transition: animated ? 'width 0.3s ease' : 'none',
    width: `${Math.min(Math.max(progress, 0), 100)}%`
  };

  return (
    <div className={`progress-bar ${className}`}>
      <div style={containerStyle}>
        <motion.div
          style={progressStyle}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          transition={{ duration: animated ? 0.3 : 0 }}
        />
      </div>
      
      {showPercentage && (
        <div style={{
          textAlign: 'center',
          marginTop: '4px',
          fontSize: '12px',
          color: theme.colors.textSecondary
        }}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};