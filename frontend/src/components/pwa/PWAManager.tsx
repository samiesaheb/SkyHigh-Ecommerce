"use client";

import { useEffect, useState } from "react";
import { X, Download, Bell, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export default function PWAManager() {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isClient, setIsClient] = useState(false);
  const [notificationsDismissed, setNotificationsDismissed] = useState(false);

  // Client-side initialization
  useEffect(() => {
    setIsClient(true);

    // Check localStorage for dismissed notifications
    if (typeof window !== 'undefined' && localStorage) {
      setNotificationsDismissed(localStorage.getItem('notifications-dismissed') === 'true');
    }
  }, []);

  useEffect(() => {
    // Only run on client side
    if (!isClient) return;

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA: Service Worker registered successfully:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, show update notification
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error);
        });
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Don't show banner if already installed
      if (!isInstalled && typeof window !== 'undefined' && !localStorage.getItem('pwa-install-dismissed')) {
        setShowInstallBanner(true);
      }
    };

    // Check if app is already installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Check if app is installed (display-mode check)
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = isiOS && (navigator as any).standalone;

      setIsInstalled(isStandalone || isFullscreen || isIOSStandalone);
    };

    checkIfInstalled();

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA: User accepted install prompt');
    } else {
      console.log('PWA: User dismissed install prompt');
      if (typeof window !== 'undefined') {
        localStorage.setItem('pwa-install-dismissed', 'true');
      }
    }

    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        // Show success message
        new Notification('Sky High Notifications Enabled', {
          body: 'You\'ll now receive updates about orders and promotions!',
          icon: '/android-chrome-192x192.png'
        });
      }
    }
  };

  const showUpdateNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sky High Updated', {
        body: 'A new version is available. Refresh to get the latest features!',
        icon: '/android-chrome-192x192.png',
        tag: 'app-update'
      });
    }
  };

  return (
    <>
      {/* Install Banner */}
      {showInstallBanner && deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto animate-in slide-in-from-bottom-4">
          <div className="bg-background border border-border/20 rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-sm text-foreground">Install Sky High App</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get faster access and offline browsing
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleInstallClick}
                    className="h-8 px-3 text-xs"
                  >
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={dismissInstallBanner}
                    className="h-8 px-3 text-xs"
                  >
                    Not now
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={dismissInstallBanner}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950">
          <div className="flex items-center justify-center gap-2 py-2 px-4">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You're offline. Some features may be limited.
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowOfflineBanner(false)}
              className="h-6 w-6 p-0 ml-2 hover:bg-amber-600/20"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Notification Permission Banner */}
      {isClient && notificationPermission === 'default' && !notificationsDismissed && (
        <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto">
          <div className="bg-background border border-border/20 rounded-lg shadow-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-sm text-foreground">Stay Updated</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get notified about order updates and exclusive offers
                </p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={requestNotificationPermission}
                    className="h-8 px-3 text-xs"
                  >
                    Enable
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNotificationsDismissed(true);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('notifications-dismissed', 'true');
                      }
                    }}
                    className="h-8 px-3 text-xs"
                  >
                    Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Status Indicator */}
      <div className="fixed bottom-4 right-4 z-30">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all duration-300 ${
          isOnline
            ? 'bg-green-500/10 text-green-700 dark:text-green-300'
            : 'bg-red-500/10 text-red-700 dark:text-red-300'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </>
  );
}