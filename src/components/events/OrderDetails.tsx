import React from 'react';

interface Order {
  id: string;
  amount: string | number;
  createdAt: string;
  ticketType?: string;
  paymentStatus: string;
}

interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => (
  <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-6 border border-dark-700/50 shadow-xl">
    <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-dark-700 inline-block">
      Order Details
    </h3>
    <dl className="space-y-5">
      <div className="flex justify-between items-center py-3 border-b border-dark-700/50">
        <dt className="text-sm font-medium text-gray-400">Order Number</dt>
        <dd className="text-sm font-mono text-gray-200 bg-dark-900/50 px-3 py-1.5 rounded">
          {order.id}
        </dd>
      </div>
      <div className="flex justify-between items-center py-3 border-b border-dark-700/50">
        <dt className="text-sm font-medium text-gray-400">Date</dt>
        <dd className="text-sm text-gray-200">
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </dd>
      </div>
      <div className="flex justify-between items-center py-3 border-b border-dark-700/50">
        <dt className="text-sm font-medium text-gray-400">Total Amount</dt>
        <dd className="text-lg font-bold text-white">
          ${parseFloat(order.amount.toString()).toFixed(2)}
        </dd>
      </div>
      {order.ticketType && (
        <div className="flex justify-between items-center py-3">
          <dt className="text-sm font-medium text-gray-400">Ticket Type</dt>
          <dd className="text-sm font-medium text-primary-300 bg-primary-900/20 px-3 py-1 rounded-full">
            {order.ticketType.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ')}
          </dd>
        </div>
      )}
      <div className="flex justify-between items-center py-3">
        <dt className="text-sm font-medium text-gray-400">Status</dt>
        <dd className={`text-sm font-medium px-3 py-1 rounded-full ${
          order.paymentStatus === 'paid' 
            ? 'bg-green-900/30 text-green-400' 
            : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          {order.paymentStatus === 'paid' ? 'Paid' : 'Processing'}
        </dd>
      </div>
    </dl>
  </div>
);
