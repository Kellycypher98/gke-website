import React from 'react';
import Link from 'next/link';

interface OrderSuccessMessageProps {
  orderId: string;
  eventId?: string;
}

export const OrderSuccessMessage: React.FC<OrderSuccessMessageProps> = ({ 
  orderId,
  eventId 
}) => (
  <div className="text-center">
    <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-12 w-12 text-green-500" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 13l4 4L19 7" 
        />
      </svg>
    </div>
    
    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
      Order Confirmed!
    </h1>
    
    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
      Thank you for your purchase! Your order <span className="font-mono text-primary-300">#{orderId}</span> has been confirmed. 
      We've sent a confirmation email with all the details.
    </p>
    
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
      <Link 
        href="/events"
        className="inline-flex items-center justify-center px-8 py-4 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-xl border border-dark-600 hover:border-dark-500 transition-colors duration-300"
      >
        Back to Events
      </Link>
      
      {eventId && (
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-dark-900"
        >
          View Event Details
        </Link>
      )}
    </div>
    
    <div className="mt-10 pt-6 border-t border-dark-700">
      <p className="text-sm text-gray-400 mb-2">Need help with your order?</p>
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
  </div>
);
