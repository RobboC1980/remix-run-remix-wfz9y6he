import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface WebSocketConfig {
  url: string;
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  maxReconnectDelay?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onOpen,
  onClose,
  reconnectAttempts = 5,
  reconnectInterval = 2000,
  maxReconnectDelay = 5000,
}: WebSocketConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const attemptRef = useRef(0);

  // Early return for non-browser environments
  if (typeof window === 'undefined') {
    return { isConnected: false };
  }

  // Check for WebContainer environment
  const isWebContainer = 
    window.location.hostname.includes('webcontainer-api.io') ||
    window.location.hostname.includes('stackblitz.io');

  // Early return for WebContainer or no URL
  if (isWebContainer || !url) {
    return { isConnected: false };
  }

  const handleReconnect = () => {
    if (attemptRef.current >= reconnectAttempts) {
      return;
    }

    const delay = Math.min(
      reconnectInterval * Math.pow(1.5, attemptRef.current),
      maxReconnectDelay
    );
    
    reconnectTimeoutRef.current = setTimeout(() => {
      attemptRef.current++;
      connect();
    }, delay);
  };

  const connect = () => {
    // Clean up existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      wsRef.current = new WebSocket(url);

      // Add error handling for connection timeout
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          wsRef.current?.close();
        }
      }, 5000);

      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        attemptRef.current = 0;
        onOpen?.();
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        onClose?.();
        handleReconnect();
      };

      wsRef.current.onerror = () => {
        // Silent error handling in production
        if (process.env.NODE_ENV === 'development') {
          console.debug('WebSocket connection error');
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          onMessage?.(event);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };
    } catch (error) {
      setIsConnected(false);
      handleReconnect();
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url]);

  return { isConnected };
}