"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <AlertCircle className="w-20 h-20 text-red-500" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-light text-foreground">Oops! Something went wrong</h1>
              <p className="text-muted-foreground font-light leading-relaxed">
                We&apos;re experiencing some technical difficulties. This has been logged and our team will look into it.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
                <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">Error ID: {error.digest}</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                onClick={() => reset()}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}