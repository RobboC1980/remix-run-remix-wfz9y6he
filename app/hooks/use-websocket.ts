import { useEffect, useRef, useState } from 'react';

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
  const mountedRef = useRef(true);

  const handleReconnect = () => {
    if (!mountedRef.current || attemptRef.current >= reconnectAttempts) {
      return;
    }

    const delay = Math.min(
      reconnectInterval * Math.pow(1.5, attemptRef.current),
      maxReconnectDelay
    );
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        attemptRef.current++;
        connect();
      }
    }, delay);
  };

  const connect = () => {
    if (!mountedRef.current) return;

    // Clean up existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      wsRef.current = new WebSocket(url);

      // Add error handling for connection timeout
      const connectionTimeout = setTimeout(() => {
        if (mountedRef.current && wsRef.current?.readyState !== WebSocket.OPEN) {
          wsRef.current?.close();
        }
      }, 5000);

      wsRef.current.onopen = () => {
        if (!mountedRef.current) return;
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        attemptRef.current = 0;
        onOpen?.();
      };

      wsRef.current.onclose = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        onClose?.();
        handleReconnect();
      };

      wsRef.current.onerror = (error) => {
        if (!mountedRef.current) return;
        // Silent error handling in production
        if (process.env.NODE_ENV === 'development') {
          console.debug('WebSocket connection error:', error);
        }
      };

      wsRef.current.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          onMessage?.(event);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };
    } catch (error) {
      if (!mountedRef.current) return;
      setIsConnected(false);
      handleReconnect();
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // Early return for non-browser environments
    if (typeof window === 'undefined') {
      return;
    }

    // Check for WebContainer environment
    const isWebContainer = 
      window.location.hostname.includes('webcontainer-api.io') ||
      window.location.hostname.includes('stackblitz.io');

    // Early return for WebContainer or no URL
    if (isWebContainer || !url) {
      return;
    }

    connect();

    return () => {
      mountedRef.current = false;
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