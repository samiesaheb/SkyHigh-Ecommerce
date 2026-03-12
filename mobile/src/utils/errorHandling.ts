import { Alert } from 'react-native';
import { ERROR_MESSAGES } from '@/constants';

export interface AppError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

export class NetworkError extends Error {
  constructor(message = ERROR_MESSAGES.NETWORK) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  public details: Record<string, string[]>;
  
  constructor(message = ERROR_MESSAGES.VALIDATION_ERROR, details: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class AuthenticationError extends Error {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = ERROR_MESSAGES.FORBIDDEN) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message = ERROR_MESSAGES.NOT_FOUND) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ServerError extends Error {
  constructor(message = ERROR_MESSAGES.SERVER_ERROR) {
    super(message);
    this.name = 'ServerError';
  }
}

/**
 * Parse error response and create appropriate error type
 */
export const parseError = (error: any): AppError => {
  if (!error) {
    return new Error(ERROR_MESSAGES.UNKNOWN_ERROR) as AppError;
  }

  // Network errors
  if (!error.response && error.code === 'NETWORK_ERROR') {
    return new NetworkError();
  }

  // HTTP errors
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || ERROR_MESSAGES.UNKNOWN_ERROR;

    switch (status) {
      case 400:
        return new ValidationError(message, data?.errors || data?.details);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message);
      default:
        const appError = new Error(message) as AppError;
        appError.status = status;
        return appError;
    }
  }

  // JavaScript errors
  if (error instanceof Error) {
    return error as AppError;
  }

  // Unknown error format
  const unknownError = new Error(ERROR_MESSAGES.UNKNOWN_ERROR) as AppError;
  unknownError.details = error;
  return unknownError;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  const parsedError = parseError(error);
  
  if (parsedError instanceof ValidationError && parsedError.details) {
    const firstFieldErrors = Object.values(parsedError.details)[0];
    if (firstFieldErrors && firstFieldErrors.length > 0) {
      return firstFieldErrors[0];
    }
  }
  
  return parsedError.message;
};

/**
 * Show error alert to user
 */
export const showErrorAlert = (error: any, title = 'Error') => {
  const message = getErrorMessage(error);
  
  Alert.alert(title, message, [
    { text: 'OK', style: 'default' },
  ]);
};

/**
 * Handle async errors with optional custom error handler
 */
export const handleAsyncError = (
  error: any,
  customHandler?: (error: AppError) => void
) => {
  const parsedError = parseError(error);
  
  if (customHandler) {
    customHandler(parsedError);
  } else {
    console.error('Unhandled async error:', parsedError);
    showErrorAlert(parsedError);
  }
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: AppError) => void
) => {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleAsyncError(error, errorHandler);
      return undefined;
    }
  };
};

/**
 * Create error handler for specific error types
 */
export const createErrorHandler = (handlers: {
  onNetworkError?: () => void;
  onAuthError?: () => void;
  onValidationError?: (details: Record<string, string[]>) => void;
  onServerError?: () => void;
  onUnknownError?: (error: AppError) => void;
}) => {
  return (error: AppError) => {
    if (error instanceof NetworkError) {
      handlers.onNetworkError?.();
    } else if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
      handlers.onAuthError?.();
    } else if (error instanceof ValidationError) {
      handlers.onValidationError?.(error.details);
    } else if (error instanceof ServerError) {
      handlers.onServerError?.();
    } else {
      handlers.onUnknownError?.(error);
    }
  };
};

/**
 * Log error to external service (placeholder for crash reporting)
 */
export const logError = (error: AppError, context?: Record<string, any>) => {
  // This would integrate with services like Sentry, Crashlytics, etc.
  console.error('Error logged:', {
    message: error.message,
    name: error.name,
    status: error.status,
    code: error.code,
    details: error.details,
    context,
    stack: error.stack,
  });
};