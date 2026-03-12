"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, X, User, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WebSocketAPI } from '@/lib/websocket';

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  message: string;
  timestamp: number;
  sender?: {
    name: string;
    avatar?: string;
  };
  status?: 'sending' | 'sent' | 'failed';
}

interface LiveChatProps {
  roomId?: string;
  autoOpen?: boolean;
}

export default function LiveChat({ roomId = 'general', autoOpen = false }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle incoming chat messages
  const handleChatMessage = useCallback((message: any) => {
    const chatMessage: ChatMessage = {
      id: message.data.id || `msg_${Date.now()}`,
      type: message.data.type || 'agent',
      message: message.data.message,
      timestamp: message.data.timestamp || Date.now(),
      sender: message.data.sender,
      status: 'sent',
    };

    setMessages(prev => [...prev, chatMessage]);

    // Update unread count if chat is minimized or closed
    if (!isOpen || isMinimized) {
      setUnreadCount(prev => prev + 1);
    }

    // Auto-open chat for first message from agent
    if (chatMessage.type === 'agent' && !isOpen) {
      setIsOpen(true);
    }
  }, [isOpen, isMinimized]);

  // Handle typing indicators
  const handleTyping = useCallback((message: any) => {
    if (message.data.type === 'agent' && message.data.isTyping !== undefined) {
      setAgentTyping(message.data.isTyping);
    }
  }, []);

  useEffect(() => {
    // Subscribe to chat messages
    const unsubscribeMessages = WebSocketAPI.chat.subscribe(handleChatMessage);

    // Subscribe to typing indicators
    const unsubscribeTyping = WebSocketAPI.chat.subscribe(handleTyping);

    // Join chat room
    WebSocketAPI.chat.joinRoom(roomId);

    // Check connection status
    const checkConnection = () => {
      const status = WebSocketAPI.getConnectionStatus();
      setIsConnected(status.chat === 'OPEN');
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      WebSocketAPI.chat.leaveRoom(roomId);
      clearInterval(connectionInterval);
    };
  }, [roomId, handleChatMessage, handleTyping]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Clear unread count when chat is opened and not minimized
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: ChatMessage = {
      id: `temp_${Date.now()}`,
      type: 'user',
      message: newMessage.trim(),
      timestamp: Date.now(),
      status: 'sending',
    };

    setMessages(prev => [...prev, message]);

    // Send via WebSocket
    const success = WebSocketAPI.chat.sendMessage(newMessage.trim(), roomId);

    if (success) {
      setMessages(prev =>
        prev.map(m => m.id === message.id ? { ...m, status: 'sent' } : m)
      );
    } else {
      setMessages(prev =>
        prev.map(m => m.id === message.id ? { ...m, status: 'failed' } : m)
      );
    }

    setNewMessage('');
    setIsTyping(false);
    WebSocketAPI.chat.typing(false, roomId);
  };

  const handleTypingStart = () => {
    if (!isTyping && isConnected) {
      setIsTyping(true);
      WebSocketAPI.chat.typing(true, roomId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      WebSocketAPI.chat.typing(false, roomId);
    }, 3000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageStatusIcon = (status?: ChatMessage['status']) => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'failed': return '❌';
      default: return null;
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-14 h-14 shadow-lg"
        size="mobile-icon"
        aria-label={`Open chat ${unreadCount > 0 ? `(${unreadCount} new messages)` : ''}`}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg transition-all duration-300 ${
      isMinimized ? 'w-80 h-14' : 'w-80 h-96'
    }`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="font-medium text-sm">Live Chat</h3>
            <p className="text-xs opacity-80">
              {isConnected ? 'Online' : 'Connecting...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Hello! How can we help you today?</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg'
                    : 'bg-muted text-foreground rounded-r-lg rounded-tl-lg'
                } p-3`}>
                  {message.sender && (
                    <div className="flex items-center gap-2 mb-1">
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <span className="text-xs font-medium">
                        {message.sender.name}
                      </span>
                    </div>
                  )}

                  <p className="text-sm">{message.message}</p>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.type === 'user' && (
                      <span className="text-xs">
                        {getMessageStatusIcon(message.status)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {agentTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-r-lg rounded-tl-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span className="text-sm">Agent is typing...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTypingStart();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                size="mobile-icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}