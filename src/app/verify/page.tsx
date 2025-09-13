'use client';

import { useState } from 'react';

export default function VerifyTicket() {
  const [ticketId, setTicketId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Verification failed');
      }
      
      setResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Verify Ticket</h1>
        
        {!result ? (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Ticket ID
                </label>
                <input
                  type="text"
                  id="ticketId"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ticket ID or scan code"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={!ticketId || loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Ticket'}
              </button>
            </form>
            {loading && <p className="text-blue-500 text-center">Verifying...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${result.valid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {result.valid ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${result.valid ? 'text-green-800' : 'text-red-800'}`}>
                    {result.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                  </h3>
                  <div className="mt-1 text-sm text-gray-600">
                    {result.valid ? 'This ticket is valid for entry' : result.error}
                  </div>
                </div>
              </div>
            </div>

            {result.valid && result.ticket && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Ticket Details</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">Event</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.ticket.eventName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Attendee</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.ticket.attendeeName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Ticket Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.ticket.ticketType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.ticket.isNewScan ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {result.ticket.isNewScan ? 'First Use' : 'Previously Used'}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expires</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(result.ticket.expiresAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setTicketId('');
                  setError(null);
                }}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Verify Another Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
