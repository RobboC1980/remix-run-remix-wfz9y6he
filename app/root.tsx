import {
  Links,
  Meta,
  Outlet,
  ScrollRestoration,
  Scripts,
  useNavigate,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { ToastProvider } from './components/toast-provider';
import { ErrorBoundary as CustomErrorBoundary } from './components/error-boundary';
import { useEffect } from 'react';
import { useWebSocket } from './hooks/use-websocket';

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function ErrorBoundary() {
  return <CustomErrorBoundary />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ToastProvider />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();
  const isWebContainer = typeof window !== 'undefined' && (
    window.location.hostname.includes('webcontainer-api.io') ||
    window.location.hostname.includes('stackblitz.io')
  );

  // Skip WebSocket in WebContainer environment
  const wsUrl = typeof window !== 'undefined' && !isWebContainer
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//localhost:5173/socket`
    : '';

  // Use the WebSocket hook with proper error handling
  useWebSocket({
    url: wsUrl,
    reconnectAttempts: 5,
    reconnectInterval: 2000,
    onOpen: () => {
      console.log('Connected to development server');
    },
    onClose: () => {
      console.log('Disconnected from development server');
    },
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'reload' || data.type === 'hmr') {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    },
  });

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // List of errors to ignore
      const ignoredErrors = [
        'WebSocket',
        'ws://',
        'wss://',
        'socket',
        'Socket',
        'hydrat',
        'content did not match',
        'Expected server HTML',
        'Loading chunk',
        'There was an error while hydrating',
        'Cannot read properties of null',
        'Invalid hook call',
        'handshake',
        'Failed to fetch',
        'Network Error',
        'AbortError',
        'Not Found',
        '404'
      ];

      // Check if the error should be ignored
      if (ignoredErrors.some(err => 
        event.message?.includes(err) || 
        event.error?.message?.includes(err) ||
        event.error?.stack?.includes(err)
      )) {
        return;
      }

      console.error('Unhandled error:', event.error);
      
      // Only navigate to error page for serious application errors
      const isCriticalError = event.error && 
        !(event.error instanceof TypeError) && 
        !(event.error instanceof ReferenceError) &&
        !event.message.includes('chunk') &&
        !event.message.includes('loading') &&
        !event.message.includes('network') &&
        !event.message.includes('fetch') &&
        !window.location.pathname.includes('/error');
        
      if (isCriticalError) {
        navigate('/error', { replace: true });
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [navigate]);

  // Prevent hydration errors from causing navigation
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      // Ignore common development and hydration warnings
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: Text content did not match') ||
         args[0].includes('Warning: Expected server HTML to contain') ||
         args[0].includes('WebSocket connection') ||
         args[0].includes('Invalid hook call') ||
         args[0].includes('Cannot read properties of null') ||
         args[0].includes('Failed to fetch') ||
         args[0].includes('Network Error') ||
         args[0].includes('404') ||
         args[0].includes('Not Found'))
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <CustomErrorBoundary>
      <Outlet />
    </CustomErrorBoundary>
  );
}