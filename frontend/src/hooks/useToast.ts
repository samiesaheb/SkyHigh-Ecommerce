"use client";

import { useState, useCallback } from "react";
import { ToastState } from "@/components/common/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const addToast = useCallback((
    message: string, 
    type: "success" | "error" | "info" = "info",
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastState = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return addToast(message, "success", duration);
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    return addToast(message, "error", duration);
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    return addToast(message, "info", duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info
  };
}