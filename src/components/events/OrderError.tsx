import React from 'react';

interface OrderErrorProps {
  message: string;
  onRetry?: () => void;
  maxRetriesReached?: boolean;
}

export const OrderError: React.FC<OrderErrorProps> = ({ 
  message, 
  onRetry, 
  maxRetriesReached = false 
}) => (
  <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-8 border border-red-900/50 shadow-xl text-center">
    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-8 w-8 text-red-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-white mb-2">
      {maxRetriesReached ? 'Unable to Process' : 'Something Went Wrong'}
    </h3>
    <p className="text-gray-300 mb-6">{message}</p>
    
    {!maxRetriesReached && onRetry && (
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center mx-auto"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
        Try Again
      </button>
    )}
    
    {maxRetriesReached && (
      <div className="mt-6 pt-6 border-t border-dark-700">
        <p className="text-sm text-gray-400 mb-4">Need help with your order?</p>
        <a 
          href="mailto:support@example.com" 
          className="inline-flex items-center text-primary-400 hover:text-primary-300 text-sm font-medium"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
          Contact Support
        </a>
      </div>
    )}
  </div>
);
