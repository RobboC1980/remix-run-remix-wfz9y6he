import { Link } from "@remix-run/react";

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-lg rounded-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            An unexpected error occurred. Please try again later.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 