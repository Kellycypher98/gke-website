import { redirect } from 'next/navigation';

export default function OrderErrorPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const errorMessage =
    searchParams.message ||
    'There was an error processing your order. Please try again or contact support if the issue persists.';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-gray-600">{errorMessage}</p>
            
            <div className="mt-8">
              <a
                href="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Events
              </a>
              <div className="mt-4">
                <a
                  href="/contact"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Contact Support <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
