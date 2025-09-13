import React from 'react';

interface OrderLoadingProps {
  progress?: number; // 0-100
  message?: string;
}

export const OrderLoading: React.FC<OrderLoadingProps> = ({ progress, message }) => (
  <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 flex items-center justify-center p-4">
    <div className="max-w-md w-full text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 border-4 border-primary-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary-500 border-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-primary-500/10 rounded-full"></div>
      </div>
      <h1 className="text-2xl font-bold text-white mb-4">Processing Your Order</h1>
      <p className="text-gray-400 mb-6">
        {message || "We're confirming your purchase. This usually takes just a moment..."}
      </p>
      {typeof progress === 'number' && (
        <>
          <div className="w-full bg-dark-700 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all" 
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {Math.round(Math.min(100, Math.max(0, progress)))}%
          </p>
        </>
      )}
    </div>
  </div>
);
