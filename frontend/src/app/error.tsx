"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="container section-container">
      <div className="max-w-lg mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-light text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground font-light leading-relaxed">
            We encountered an unexpected error while loading this page. Please try again or return to the homepage.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
            <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-32">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button
            onClick={() => reset()}
            variant="outline"
            className="inline-flex items-center gap-2 font-light"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 font-light"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}