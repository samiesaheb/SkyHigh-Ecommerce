"use client";

import { useEffect, useState, useCallback } from 'react';
import { Package, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { WebSocketAPI, realTimeEvents } from '@/lib/websocket';

interface InventoryStatusProps {
  productId: string;
  initialStock?: number;
  lowStockThreshold?: number;
  showDetailedStatus?: boolean;
  className?: string;
}

interface StockInfo {
  current: number;
  available: number;
  reserved: number;
  incoming: number;
  lastUpdated: number;
}

export default function InventoryStatus({
  productId,
  initialStock = 0,
  lowStockThreshold = 5,
  showDetailedStatus = false,
  className = '',
}: InventoryStatusProps) {
  const [stockInfo, setStockInfo] = useState<StockInfo>({
    current: initialStock,
    available: initialStock,
    reserved: 0,
    incoming: 0,
    lastUpdated: Date.now(),
  });

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Handle real-time inventory updates
  const handleInventoryUpdate = useCallback((data: { productId: string; stock: number; details?: Partial<StockInfo> }) => {
    if (data.productId === productId) {
      setStockInfo(prev => ({
        ...prev,
        current: data.stock,
        available: data.details?.available ?? data.stock,
        reserved: data.details?.reserved ?? prev.reserved,
        incoming: data.details?.incoming ?? prev.incoming,
        lastUpdated: Date.now(),
      }));
      setLastUpdate(new Date());
    }
  }, [productId]);

  useEffect(() => {
    // Subscribe to inventory updates via WebSocket
    const unsubscribeWS = WebSocketAPI.inventory.subscribe((message) => {
      if (message.type === 'inventory_update') {
        handleInventoryUpdate(message.data);
      }
    });

    // Subscribe to real-time events
    const unsubscribeEvents = realTimeEvents.on('inventory:update', handleInventoryUpdate);

    // Request initial inventory data
    WebSocketAPI.inventory.requestUpdate(productId);

    // Check connection status
    const checkConnection = () => {
      const status = WebSocketAPI.getConnectionStatus();
      setIsConnected(status.inventory === 'OPEN');
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 10000);

    return () => {
      unsubscribeWS();
      unsubscribeEvents();
      clearInterval(connectionInterval);
    };
  }, [productId, handleInventoryUpdate]);

  const getStockStatus = () => {
    const { current, available } = stockInfo;

    if (current === 0) {
      return {
        status: 'out-of-stock',
        label: 'Out of Stock',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        icon: AlertTriangle,
      };
    }

    if (current <= lowStockThreshold) {
      return {
        status: 'low-stock',
        label: `Low Stock (${current} left)`,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        icon: AlertTriangle,
      };
    }

    if (available < current) {
      return {
        status: 'limited',
        label: `${available} Available`,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        icon: Clock,
      };
    }

    return {
      status: 'in-stock',
      label: 'In Stock',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: CheckCircle,
    };
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return null;

    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return 'Just updated';
    if (minutes < 60) return `Updated ${minutes}m ago`;
    return `Updated ${lastUpdate.toLocaleTimeString()}`;
  };

  const status = getStockStatus();
  const StatusIcon = status.icon;

  if (showDetailedStatus) {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Main Status */}
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${status.color} ${status.bgColor}`}>
          <StatusIcon className="w-4 h-4" />
          <span>{status.label}</span>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">Total Stock:</span>
            <span className="font-medium">{stockInfo.current}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">Available:</span>
            <span className="font-medium">{stockInfo.available}</span>
          </div>

          {stockInfo.reserved > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Reserved:</span>
              <span className="font-medium">{stockInfo.reserved}</span>
            </div>
          )}

          {stockInfo.incoming > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Incoming:</span>
              <span className="font-medium text-blue-600">+{stockInfo.incoming}</span>
            </div>
          )}
        </div>

        {/* Connection Status & Last Update */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Live' : 'Offline'}</span>
          </div>

          {formatLastUpdate() && (
            <span>{formatLastUpdate()}</span>
          )}
        </div>
      </div>
    );
  }

  // Simple status display
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.color} ${status.bgColor} ${className}`}>
      <StatusIcon className="w-4 h-4" />
      <span>{status.label}</span>
      {!isConnected && (
        <div className="w-1.5 h-1.5 bg-current rounded-full opacity-50" title="Offline mode" />
      )}
    </div>
  );
}

// Hook for real-time inventory data
export function useInventoryStatus(productId: string) {
  const [stockInfo, setStockInfo] = useState<StockInfo>({
    current: 0,
    available: 0,
    reserved: 0,
    incoming: 0,
    lastUpdated: Date.now(),
  });

  const [isLoading, setIsLoading] = useState(true);

  const handleInventoryUpdate = useCallback((data: { productId: string; stock: number; details?: Partial<StockInfo> }) => {
    if (data.productId === productId) {
      setStockInfo(prev => ({
        ...prev,
        current: data.stock,
        available: data.details?.available ?? data.stock,
        reserved: data.details?.reserved ?? prev.reserved,
        incoming: data.details?.incoming ?? prev.incoming,
        lastUpdated: Date.now(),
      }));
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const unsubscribeWS = WebSocketAPI.inventory.subscribe((message) => {
      if (message.type === 'inventory_update') {
        handleInventoryUpdate(message.data);
      }
    });

    const unsubscribeEvents = realTimeEvents.on('inventory:update', handleInventoryUpdate);

    // Request initial data
    WebSocketAPI.inventory.requestUpdate(productId);

    // Set loading timeout
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      unsubscribeWS();
      unsubscribeEvents();
      clearTimeout(loadingTimeout);
    };
  }, [productId, handleInventoryUpdate]);

  return {
    stockInfo,
    isLoading,
    isInStock: stockInfo.current > 0,
    isLowStock: stockInfo.current > 0 && stockInfo.current <= 5,
    isOutOfStock: stockInfo.current === 0,
  };
}