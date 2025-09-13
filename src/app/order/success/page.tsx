'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  customerEmail: string;
  amount: string | number;
  createdAt: string;
  updatedAt: string;
  status: string;
  paymentStatus: string;
  confirmation_sent: boolean;
  stripeSessionId: string;
  // Add other fields from your order object
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  // Polling interval in milliseconds
  const POLLING_INTERVAL = 2000;
  const MAX_RETRIES = 5;
  
  useEffect(() => {
    let retryCount = 0;
    let timeoutId: NodeJS.Timeout;

    const fetchOrder = async () => {
      if (!sessionId && !orderId) {
        setError('No order or session information provided');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        let orderData: Order | null = null;
        
        // Try to find the order by order_id or session_id
        if (orderId) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
            
          if (!error && data) {
            orderData = data;
          }
        } else if (sessionId) {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('stripeSessionId', sessionId)
            .maybeSingle();
            
          if (!error && data) {
            orderData = data;
            // Update URL to include order ID for better UX on refresh
            if (data.id && window.location.search !== `?order_id=${data.id}`) {
              window.history.replaceState({}, '', `?order_id=${data.id}`);
            }
          }
        }
        
        // If we found an order, check its status
        if (orderData) {
          if (orderData.paymentStatus === 'paid' && orderData.confirmation_sent) {
            // Order is paid and confirmed, show success
            setOrder(orderData);
            setLoading(false);
            return;
          } else if (orderData.paymentStatus === 'paid') {
            // Order is paid but no confirmation sent yet
            setError('Your payment was successful! We\'re finalizing your order. You\'ll receive a confirmation email shortly.');
            
            // Continue polling for confirmation
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              timeoutId = setTimeout(fetchOrder, POLLING_INTERVAL);
            } else {
              setLoading(false);
            }
            return;
          } else {
            // Order exists but not paid yet
            setError('Your order is being processed. Please wait...');
            
            // Continue polling for payment status
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              timeoutId = setTimeout(fetchOrder, POLLING_INTERVAL);
            } else {
              setLoading(false);
            }
            return;
          }
        }
        
        // If we get here, no order was found
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setError('Looking for your order...');
          timeoutId = setTimeout(fetchOrder, POLLING_INTERVAL);
        } else {
          setError('We couldn\'t find your order. Please check your email for confirmation or contact support.');
          setLoading(false);
        }
        
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('An error occurred while processing your order. Please contact support if the issue persists.');
        setLoading(false);
      }
    };
    
    // Start the initial fetch
    fetchOrder();
    
    // Cleanup function to clear any pending timeouts
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orderId, sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8 sm:p-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Processing your order</h2>
            <p className="mt-2 text-gray-600">Please wait while we confirm your payment details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8 sm:p-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Order Processing</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-6">
              <a
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Events
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8 sm:p-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Error Processing Order</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-6">
              <a
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Back to Events
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              Order Confirmed!
            </h2>
            <p className="mt-2 text-gray-600">
              Thank you for your purchase. Your order has been confirmed and a confirmation email has been sent to{' '}
              <span className="font-medium text-gray-900">{order?.customerEmail}</span>.
            </p>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <dl className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                  <dd className="text-sm text-gray-900">{order?.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-sm text-gray-900">
                    {order ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Total</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${order ? parseFloat(order.amount.toString()).toFixed(2) : '0.00'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8">
              <a
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View More Events
              </a>
              {order?.id && (
                <div className="mt-4">
                  <a
                    href={`/orders/${order.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View order details <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
