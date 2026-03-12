"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[100] max-w-sm w-full transform transition-all duration-300 ease-out",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div
        className={cn(
          "card p-4 shadow-lg border-l-4 backdrop-blur-md",
          type === "success" && "border-l-green-500 bg-green-50/90 dark:bg-green-950/90",
          type === "error" && "border-l-red-500 bg-red-50/90 dark:bg-red-950/90",
          type === "info" && "border-l-blue-500 bg-blue-50/90 dark:bg-blue-950/90"
        )}
      >
        <div className="flex items-start gap-3">
          <Icon
            className={cn(
              "w-5 h-5 flex-shrink-0 mt-0.5",
              type === "success" && "text-green-600 dark:text-green-400",
              type === "error" && "text-red-600 dark:text-red-400",
              type === "info" && "text-blue-600 dark:text-blue-400"
            )}
          />
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-light text-foreground leading-relaxed">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export interface ToastState {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

export function ToastContainer({ toasts, onClose }: { 
  toasts: ToastState[]; 
  onClose: (id: string) => void; 
}) {
  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            top: `${1 + index * 5}rem`,
            right: "1rem",
            zIndex: 100 - index
          }}
          className="fixed"
        >
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </>
  );
}