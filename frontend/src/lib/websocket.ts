// Real-time WebSocket manager for live features

export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: number;
}

export interface WebSocketOptions {
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

export type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<WebSocketOptions>;
  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isManuallyDisconnected = false;

  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url;
    this.options = {
      reconnectDelay: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      debug: false,
      ...options,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.isManuallyDisconnected = false;

        this.ws.onopen = () => {
          this.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            this.log('Failed to parse message:', error);
          }
        };

        this.ws.onclose = (event) => {
          this.log('WebSocket disconnected:', event.code, event.reason);
          this.stopHeartbeat();

          if (!this.isManuallyDisconnected && this.shouldReconnect()) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.log('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  send(type: string, data: unknown): boolean {
    if (!this.isConnected()) {
      this.log('Cannot send message: WebSocket not connected');
      return false;
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    try {
      this.ws!.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.log('Failed to send message:', error);
      return false;
    }
  }

  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    this.log('Received message:', message.type, message.data);

    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          this.log('Error in message handler:', error);
        }
      });
    }

    // Handle system messages
    if (message.type === 'pong') {
      this.log('Pong received');
    }
  }

  private shouldReconnect(): boolean {
    return this.reconnectAttempts < this.options.maxReconnectAttempts;
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();

    const delay = this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
      } catch (error) {
        this.log('Reconnection failed:', error);
      }
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private log(...args: unknown[]): void {
    if (this.options.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// Global WebSocket instances
let inventoryWS: WebSocketManager | null = null;
let chatWS: WebSocketManager | null = null;
let notificationWS: WebSocketManager | null = null;

// Initialize WebSocket connections
export function initializeWebSockets(): void {
  if (typeof window === 'undefined') return;

  const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

  // Inventory updates WebSocket
  inventoryWS = new WebSocketManager(`${wsBaseUrl}/inventory/`, {
    debug: process.env.NODE_ENV === 'development',
    heartbeatInterval: 60000, // 1 minute for inventory updates
  });

  // Chat WebSocket
  chatWS = new WebSocketManager(`${wsBaseUrl}/chat/`, {
    debug: process.env.NODE_ENV === 'development',
    heartbeatInterval: 30000, // 30 seconds for chat
  });

  // Notifications WebSocket
  notificationWS = new WebSocketManager(`${wsBaseUrl}/notifications/`, {
    debug: process.env.NODE_ENV === 'development',
    heartbeatInterval: 45000, // 45 seconds for notifications
  });

  // Auto-connect on page load
  window.addEventListener('load', () => {
    connectWebSockets();
  });

  // Reconnect when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      connectWebSockets();
    }
  });
}

// Connect all WebSocket instances
async function connectWebSockets(): Promise<void> {
  try {
    if (inventoryWS && !inventoryWS.isConnected()) {
      await inventoryWS.connect();
    }
    if (chatWS && !chatWS.isConnected()) {
      await chatWS.connect();
    }
    if (notificationWS && !notificationWS.isConnected()) {
      await notificationWS.connect();
    }
  } catch (error) {
    console.warn('Failed to connect WebSockets:', error);
  }
}

// WebSocket API exports
export const WebSocketAPI = {
  // Inventory updates
  inventory: {
    subscribe: (handler: MessageHandler) =>
      inventoryWS?.subscribe('inventory_update', handler) || (() => {}),

    requestUpdate: (productId: string) =>
      inventoryWS?.send('request_inventory', { productId }),
  },

  // Live chat
  chat: {
    subscribe: (handler: MessageHandler) =>
      chatWS?.subscribe('chat_message', handler) || (() => {}),

    sendMessage: (message: string, roomId?: string) =>
      chatWS?.send('chat_message', { message, roomId }),

    joinRoom: (roomId: string) =>
      chatWS?.send('join_room', { roomId }),

    leaveRoom: (roomId: string) =>
      chatWS?.send('leave_room', { roomId }),

    typing: (isTyping: boolean, roomId?: string) =>
      chatWS?.send('typing', { isTyping, roomId }),
  },

  // Real-time notifications
  notifications: {
    subscribe: (handler: MessageHandler) =>
      notificationWS?.subscribe('notification', handler) || (() => {}),

    markAsRead: (notificationId: string) =>
      notificationWS?.send('mark_read', { notificationId }),

    subscribeToOrder: (orderId: string) =>
      notificationWS?.send('subscribe_order', { orderId }),
  },

  // Connection status
  getConnectionStatus: () => ({
    inventory: inventoryWS?.getConnectionState() || 'DISCONNECTED',
    chat: chatWS?.getConnectionState() || 'DISCONNECTED',
    notifications: notificationWS?.getConnectionState() || 'DISCONNECTED',
  }),

  // Disconnect all
  disconnectAll: () => {
    inventoryWS?.disconnect();
    chatWS?.disconnect();
    notificationWS?.disconnect();
  },
};

// Event emitter for cross-component communication
class EventEmitter {
  private events = new Map<string, Set<Function>>();

  on(event: string, callback: Function): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }
}

export const realTimeEvents = new EventEmitter();

// Initialize WebSockets when module loads
if (typeof window !== 'undefined') {
  initializeWebSockets();
}

// Real-time data synchronization
export const RealTimeSync = {
  // Sync inventory levels
  syncInventory: (productId: string, newStock: number) => {
    realTimeEvents.emit('inventory:update', { productId, stock: newStock });

    // Invalidate related caches
    import('./cache').then(({ CacheInvalidation }) => {
      CacheInvalidation.products();
    });
  },

  // Sync cart updates
  syncCart: (cartData: unknown) => {
    realTimeEvents.emit('cart:update', cartData);

    // Invalidate cart cache
    import('./cache').then(({ CacheInvalidation }) => {
      CacheInvalidation.cart();
    });
  },

  // Sync order status
  syncOrderStatus: (orderId: string, status: string, details?: unknown) => {
    realTimeEvents.emit('order:status_update', { orderId, status, details });
  },

  // Sync user notifications
  syncNotifications: (notification: unknown) => {
    realTimeEvents.emit('notifications:new', notification);
  },
};