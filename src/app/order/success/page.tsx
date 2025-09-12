import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const supabase = createServerSupabaseClient();
  
  // If no order ID, redirect to home
  if (!searchParams.order_id) {
    redirect('/');
  }

  // Fetch order details
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', searchParams.order_id)
    .single();

  // If order not found, redirect to home
  if (!order) {
    redirect('/');
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
              <span className="font-medium text-gray-900">{order.customerEmail}</span>.
            </p>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <dl className="mt-4 space-y-4">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                  <dd className="text-sm text-gray-900">{order.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Total</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ${parseFloat(order.amount).toFixed(2)}
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
              <div className="mt-4">
                <a
                  href={`/orders/${order.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View order details <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
