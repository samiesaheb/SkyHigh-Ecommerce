"use client";

import { useEffect } from "react";
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useError, ErrorMessage } from "./ErrorContext";

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

const colorMap = {
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

const iconColorMap = {
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
  success: "text-green-500",
};

interface ErrorItemProps {
  error: ErrorMessage;
  onRemove: (id: string) => void;
}

function ErrorItem({ error, onRemove }: ErrorItemProps) {
  const Icon = iconMap[error.type];

  useEffect(() => {
    // Auto-dismiss success and info messages after 5 seconds
    if (error.type === "success" || error.type === "info") {
      const timer = setTimeout(() => {
        onRemove(error.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error.id, error.type, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${colorMap[error.type]} animate-in slide-in-from-top-2 duration-300`}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorMap[error.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{error.message}</p>
      </div>
      <button
        onClick={() => onRemove(error.id)}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ErrorDisplay() {
  const { errors, removeError } = useError();

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-full space-y-2">
      {errors.map((error) => (
        <ErrorItem
          key={error.id}
          error={error}
          onRemove={removeError}
        />
      ))}
    </div>
  );
}