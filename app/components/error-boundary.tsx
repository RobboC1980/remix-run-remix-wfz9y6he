import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            {error.status} {error.statusText}
          </h1>
          <p className="mt-2 text-gray-600">{error.data}</p>
        </div>
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">Application Error</h1>
          <p className="mt-2 text-gray-600">
            An unexpected error occurred. Please try again later.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-4 max-w-lg overflow-auto rounded bg-gray-100 p-4 text-sm">
              {error.message}
              {error.stack}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return children || null;
}