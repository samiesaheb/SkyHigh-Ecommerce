import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, LAYOUT } from '@/constants';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>
      {error?.message || 'An unexpected error occurred'}
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={resetError}>
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: React.ComponentType<ErrorFallbackProps>
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Hook for error boundaries in functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    // You can add additional error reporting logic here
    throw error;
  };
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.XL,
    backgroundColor: COLORS.BACKGROUND,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.ERROR,
    marginBottom: SPACING.MD,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    color: COLORS.TEXT.SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.XL,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MD,
    borderRadius: LAYOUT.CARD_RADIUS,
    minWidth: 120,
  },
  retryButtonText: {
    color: COLORS.SURFACE,
    fontSize: TYPOGRAPHY.FONT_SIZES.MD,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
  },
});