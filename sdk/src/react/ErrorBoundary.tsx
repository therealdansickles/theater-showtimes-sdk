import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys have changed
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevResetKeys[idx] !== resetKey
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset error state if any props have changed (when resetOnPropsChange is true)
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to your error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // Example: Send to your monitoring service
    // Sentry.captureException(error, { extra: errorReport });
    
    console.error('Error Report:', errorReport);
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorToClipboard = async () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorText = `
Error ID: ${errorId}
Message: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      alert('Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '32px',
            textAlign: 'center',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #ef4444',
            margin: '16px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              fontSize: '64px',
              marginBottom: '16px'
            }}
          >
            💥
          </motion.div>

          {/* Error Title */}
          <h2 style={{
            color: '#ef4444',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '16px'
          }}>
            Oops! Something went wrong
          </h2>

          {/* Error Message */}
          <p style={{
            fontSize: '16px',
            opacity: 0.8,
            marginBottom: '24px',
            lineHeight: '1.5'
          }}>
            We encountered an unexpected error while loading the movie booking widget.
            This has been automatically reported to our team.
          </p>

          {/* Error ID */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            marginBottom: '24px',
            color: '#a1a1aa'
          }}>
            Error ID: {errorId}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: showDetails ? '24px' : '0'
          }}>
            <motion.button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Try Again
            </motion.button>

            <motion.button
              onClick={this.handleReload}
              style={{
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: '2px solid #ef4444',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ scale: 1.05, backgroundColor: '#ef444420' }}
              whileTap={{ scale: 0.95 }}
            >
              🔃 Reload Page
            </motion.button>

            {showDetails && (
              <motion.button
                onClick={this.copyErrorToClipboard}
                style={{
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  border: '2px solid #a1a1aa',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ scale: 1.05, color: '#ffffff', borderColor: '#ffffff' }}
                whileTap={{ scale: 0.95 }}
              >
                📋 Copy Details
              </motion.button>
            )}
          </div>

          {/* Error Details (Collapsible) */}
          {showDetails && error && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                textAlign: 'left',
                backgroundColor: '#2a2a2a',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #404040'
              }}
            >
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#ef4444'
              }}>
                🔍 Technical Details
              </summary>

              <div style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                lineHeight: '1.4',
                color: '#d1d5db'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Error Message:</strong>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#1a1a1a',
                    padding: '8px',
                    borderRadius: '4px',
                    marginTop: '4px'
                  }}>
                    {error.message}
                  </pre>
                </div>

                {error.stack && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>Stack Trace:</strong>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: '#1a1a1a',
                      padding: '8px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: '#1a1a1a',
                      padding: '8px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </motion.details>
          )}

          {/* Help Text */}
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '16px',
            lineHeight: '1.4'
          }}>
            If this problem persists, please contact support with the Error ID above.
          </p>
        </motion.div>
      );
    }

    return children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// Higher-order component wrapper
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};