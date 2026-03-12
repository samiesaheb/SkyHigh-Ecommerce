"use client";

import { useEffect, useState, useCallback } from 'react';
import { Bell, X, Package, ShoppingCart, Heart, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WebSocketAPI, realTimeEvents } from '@/lib/websocket';

export interface Notification {
  id: string;
  type: 'order' | 'inventory' | 'promotion' | 'system' | 'cart';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Handle new notifications from WebSocket
  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep only 50 most recent
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);

      // Show browser notification for high priority
      if (notification.priority === 'high' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/android-chrome-192x192.png',
          tag: notification.id,
        });
      }
    }
  }, []);

  // Handle inventory updates
  const handleInventoryUpdate = useCallback(({ productId, stock }: { productId: string; stock: number }) => {
    if (stock <= 5 && stock > 0) {
      const notification: Notification = {
        id: `inventory_${productId}_${Date.now()}`,
        type: 'inventory',
        title: 'Low Stock Alert',
        message: `Product ${productId} has only ${stock} items left in stock!`,
        timestamp: Date.now(),
        read: false,
        priority: 'medium',
        actionUrl: `/products/${productId}`,
      };
      handleNewNotification(notification);
    } else if (stock === 0) {
      const notification: Notification = {
        id: `inventory_out_${productId}_${Date.now()}`,
        type: 'inventory',
        title: 'Out of Stock',
        message: `Product ${productId} is now out of stock.`,
        timestamp: Date.now(),
        read: false,
        priority: 'high',
        actionUrl: `/products/${productId}`,
      };
      handleNewNotification(notification);
    }
  }, [handleNewNotification]);

  // Handle order status updates
  const handleOrderUpdate = useCallback(({ orderId, status }: { orderId: string; status: string }) => {
    const notification: Notification = {
      id: `order_${orderId}_${Date.now()}`,
      type: 'order',
      title: 'Order Update',
      message: `Your order ${orderId} status: ${status}`,
      timestamp: Date.now(),
      read: false,
      priority: 'medium',
      actionUrl: `/profile/orders/${orderId}`,
    };
    handleNewNotification(notification);
  }, [handleNewNotification]);

  useEffect(() => {
    // Subscribe to WebSocket notifications
    const unsubscribeWS = WebSocketAPI.notifications.subscribe((message) => {
      if (message.type === 'notification') {
        handleNewNotification(message.data);
      }
    });

    // Subscribe to real-time events
    const unsubscribeInventory = realTimeEvents.on('inventory:update', handleInventoryUpdate);
    const unsubscribeOrder = realTimeEvents.on('order:status_update', handleOrderUpdate);
    const unsubscribeNotifications = realTimeEvents.on('notifications:new', handleNewNotification);

    return () => {
      unsubscribeWS();
      unsubscribeInventory();
      unsubscribeOrder();
      unsubscribeNotifications();
    };
  }, [handleNewNotification, handleInventoryUpdate, handleOrderUpdate]);

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    WebSocketAPI.notifications.markAsRead(notificationId);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notifications.forEach(n => {
      if (!n.read) {
        WebSocketAPI.notifications.markAsRead(n.id);
      }
    });
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4" />;
      case 'inventory': return <AlertCircle className="w-4 h-4" />;
      case 'cart': return <ShoppingCart className="w-4 h-4" />;
      case 'promotion': return <Heart className="w-4 h-4" />;
      case 'system': return <User className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="mobile-icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="mobile-icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 w-6 p-0"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNotification(notification.id)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>

                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                markAsRead(notification.id);
                                window.location.href = notification.actionUrl!;
                              }}
                              className="text-xs h-6"
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}