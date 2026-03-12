"use client";

import { WifiOff, Wifi, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Check initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
            isOnline
              ? 'bg-green-500/10 text-green-600'
              : 'bg-muted text-muted-foreground'
          }`}>
            {isOnline ? (
              <Wifi className="w-12 h-12" />
            ) : (
              <WifiOff className="w-12 h-12" />
            )}
          </div>
          {!isOnline && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h1 className="text-3xl font-light text-foreground">
            {isOnline ? "You're back online!" : "You're offline"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {isOnline
              ? "Great! Your connection has been restored. You can now refresh the page to continue shopping."
              : "No internet connection detected. Some features may not be available, but you can still browse cached content."
            }
          </p>
        </div>

        {/* Connection Status Indicator */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          isOnline
            ? 'bg-green-500/10 text-green-700 dark:text-green-300'
            : 'bg-red-500/10 text-red-700 dark:text-red-300'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Disconnected</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {isOnline ? (
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full"
              size="lg"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}

          <Link href="/">
            <Button variant="ghost" className="w-full" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        {/* Offline Features */}
        {!isOnline && (
          <div className="bg-muted/50 rounded-lg p-6 text-left space-y-4">
            <h3 className="font-medium text-foreground">What you can still do:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Browse previously visited pages
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                View cached product information
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Continue shopping when connection returns
              </li>
            </ul>
          </div>
        )}

        {/* App Installation Hint */}
        <div className="text-xs text-muted-foreground">
          <p>
            Install our app for better offline experience and faster loading times.
          </p>
        </div>
      </div>
    </div>
  );
}