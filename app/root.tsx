import {
  Links,
  Meta,
  Outlet,
  ScrollRestoration,
  Scripts,
  LiveReload,
  useNavigate,
  useMatches,
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
        <LiveReload />
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
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/socket`
    : '';

  // Use the WebSocket hook with proper error handling
  const { isConnected } = useWebSocket({
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
        'handshake'
      ];

      if (ignoredErrors.some(err => event.message.includes(err))) {
        return;
      }

      console.error('Unhandled error:', event.error);
      
      // Navigate to error page only for critical errors
      const isCriticalError = event.error && 
        !(event.error instanceof TypeError) && 
        !event.message.includes('chunk') &&
        !event.message.includes('loading');
        
      if (isCriticalError) {
        navigate('/error');
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [navigate]);

  // Prevent hydration errors from causing navigation
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      // Ignore hydration warnings and expected development issues
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: Text content did not match') ||
         args[0].includes('Warning: Expected server HTML to contain') ||
         args[0].includes('WebSocket connection') ||
         args[0].includes('Invalid hook call') ||
         args[0].includes('Cannot read properties of null'))
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