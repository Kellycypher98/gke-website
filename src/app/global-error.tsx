'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-dark-900 text-white p-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-red-500 mb-4">Oops!</h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">Something went wrong</h2>
            <p className="text-gray-300 mb-4">
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Error: {error.message}
            </p>
          </div>
          
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-500">
              Need help?{' '}
              <a href="/contact" className="text-primary-400 hover:underline">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
