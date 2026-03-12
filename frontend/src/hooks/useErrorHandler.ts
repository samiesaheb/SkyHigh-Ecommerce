"use client";

import { useCallback } from "react";
import { useError } from "@/components/error/ErrorContext";

export function useErrorHandler() {
  const { addError } = useError();

  const handleApiError = useCallback((error: unknown, defaultMessage = "An error occurred") => {
    let message = defaultMessage;
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error && typeof error === "object" && "message" in error) {
      message = String(error.message);
    }

    addError(message, "error");
    console.error("API Error:", error);
  }, [addError]);

  const handleNetworkError = useCallback(() => {
    addError("Network error. Please check your connection and try again.", "error");
  }, [addError]);

  const handleAuthError = useCallback(() => {
    addError("Authentication required. Please log in and try again.", "error");
  }, [addError]);

  const handleValidationError = useCallback((message: string) => {
    addError(message, "warning");
  }, [addError]);

  const showSuccess = useCallback((message: string) => {
    addError(message, "success");
  }, [addError]);

  const showInfo = useCallback((message: string) => {
    addError(message, "info");
  }, [addError]);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
    }
  ): Promise<T | null> => {
    try {
      const result = await operation();
      
      if (options?.successMessage) {
        showSuccess(options.successMessage);
      }
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      const errorMessage = options?.errorMessage || "Operation failed";
      handleApiError(error, errorMessage);
      
      if (options?.onError) {
        options.onError(error);
      }
      
      return null;
    }
  }, [handleApiError, showSuccess]);

  return {
    handleApiError,
    handleNetworkError,
    handleAuthError,
    handleValidationError,
    showSuccess,
    showInfo,
    handleAsyncOperation,
  };
}