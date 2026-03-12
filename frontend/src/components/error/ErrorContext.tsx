"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";

export interface ErrorMessage {
  id: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
  timestamp: number;
}

interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (message: string, type?: ErrorMessage["type"]) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  const addError = useCallback((message: string, type: ErrorMessage["type"] = "error") => {
    const id = Math.random().toString(36).substr(2, 9);
    const newError: ErrorMessage = {
      id,
      message,
      type,
      timestamp: Date.now(),
    };

    setErrors(prev => [...prev, newError]);

    // Auto-remove after 5 seconds for non-error messages
    if (type !== "error") {
      setTimeout(() => {
        setErrors(prev => prev.filter(error => error.id !== id));
      }, 5000);
    }
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const value = useMemo(() => ({
    errors,
    addError,
    removeError,
    clearErrors,
  }), [errors, addError, removeError, clearErrors]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};