import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  amount: string | number;
  createdAt: string;
  updatedAt: string;
  status: string;
  paymentStatus: string;
  confirmation_sent: boolean;
  stripeSessionId: string;
  eventId?: string;
  ticketType?: string;
}

interface UseOrderConfirmationProps {
  sessionId: string | null;
  orderId: string | null;
}

interface UseOrderConfirmationReturn {
  order: Order | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  fetchOrder: (isManualRetry?: boolean) => Promise<boolean>;
}

const POLLING_INTERVAL = 2000;
const MAX_RETRIES = 15; // 30 seconds total with 2-second intervals

export const useOrderConfirmation = ({ 
  sessionId, 
  orderId 
}: UseOrderConfirmationProps): UseOrderConfirmationReturn => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Normalize DB row (snake_case) to our local Order type (camelCase)
  const normalizeOrder = (row: any): Order => {
    return {
      id: row.id,
      customerEmail: row.customerEmail ?? row.customer_email ?? '',
      customerName: row.customerName ?? row.customer_name ?? '',
      amount: row.amount,
      createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
      updatedAt: row.updatedAt ?? row.updated_at ?? new Date().toISOString(),
      status: row.status,
      paymentStatus: row.paymentStatus ?? row.payment_status ?? '',
      confirmation_sent: row.confirmation_sent ?? row.confirmationSent ?? false,
      stripeSessionId: row.stripeSessionId ?? row.stripe_session_id ?? '',
      eventId: row.eventId ?? row.event_id,
      ticketType: row.ticketType ?? row.ticket_type,
    };
  };

  const fetchOrder = useCallback(async (isManualRetry = false): Promise<boolean> => {
    if (isManualRetry) {
      setError(null);
      setLoading(true);
      setRetryCount(0);
    }
    if ((!sessionId && !orderId) || (!isManualRetry && retryCount >= MAX_RETRIES)) {
      if (!isManualRetry) {
        setError('We\'re having trouble finding your order. Please check your email for confirmation or contact support.');
        setLoading(false);
      }
      return false;
    }

    try {
      console.log(`[Attempt ${retryCount + 1}] Fetching order...`, { orderId, sessionId });
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
          orderData = normalizeOrder(data);
        }
      } else if (sessionId) {
        // Match either camelCase or snake_case column name
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`stripeSessionId.eq.${sessionId},stripe_session_id.eq.${sessionId}`)
          .maybeSingle();
          
        if (!error && data) {
          orderData = normalizeOrder(data);
          // Update URL to include order ID for better UX on refresh
          if (orderData.id && window.location.search !== `?order_id=${orderData.id}`) {
            window.history.replaceState({}, '', `?order_id=${orderData.id}`);
          }
        }
      }
      
      // If we found an order, check its status
      if (orderData) {
        console.log('Order found:', { 
          id: orderData.id, 
          status: orderData.status, 
          paymentStatus: orderData.paymentStatus,
          confirmation_sent: orderData.confirmation_sent
        });

        setOrder(orderData);
        
        if (orderData.paymentStatus === 'paid') {
          // Consider success as soon as payment is confirmed
          setLoading(false);
          setError(null);
          return true;
        } else {
          // Payment still processing
          setError('Your order is being processed. Please wait...');
          
          if (!isManualRetry) setRetryCount(prev => prev + 1);
          return true;
        }
      }
      
      // If we get here, no order was found yet
      if (!isManualRetry) {
        setRetryCount(prev => {
          const newCount = prev + 1;
          if (newCount < MAX_RETRIES) {
            setError(`Looking for your order... (${newCount}/${MAX_RETRIES})`);
          } else {
            setError('We couldn\'t find your order. Please check your email or contact support.');
            setLoading(false);
          }
          return newCount;
        });
      }
      
      return false;
    } catch (err) {
      console.error('Error fetching order:', err);
      if (!isManualRetry) {
        setRetryCount(prev => {
          const newCount = prev + 1;
          if (newCount < MAX_RETRIES) {
            setError('Connection error. Retrying...');
          } else {
            setError('We encountered an error processing your order. Please try again or contact support.');
            setLoading(false);
          }
          return newCount;
        });
      } else {
        setError('Failed to fetch order. Please try again.');
      }
      return false;
    }
  }, [sessionId, orderId, retryCount]);

  // Set up polling effect
  useEffect(() => {
    if (loading && retryCount < MAX_RETRIES) {
      const timer = setTimeout(() => {
        if (loading) fetchOrder();
      }, POLLING_INTERVAL);
      return () => clearTimeout(timer);
    }
    return;
  }, [loading, retryCount, fetchOrder]);

  // Initial fetch
  useEffect(() => {
    // Fresh start when query params change
    setOrder(null);
    setError(null);
    setLoading(true);
    setRetryCount(0);
    fetchOrder();
  }, [sessionId, orderId]);

  return {
    order,
    loading,
    error,
    retryCount,
    maxRetries: MAX_RETRIES,
    fetchOrder
  };
};
