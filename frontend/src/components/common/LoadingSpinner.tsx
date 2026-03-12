"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "secondary" | "muted";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

const colorClasses = {
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-muted-foreground",
};

export default function LoadingSpinner({ 
  size = "md", 
  className,
  color = "primary"
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export function LoadingBar({ progress }: { progress?: number }) {
  return (
    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
        style={{ 
          width: progress ? `${Math.min(100, Math.max(0, progress))}%` : '0%',
          animation: progress === undefined ? 'loading-bar 2s ease-in-out infinite' : undefined
        }}
      />
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}