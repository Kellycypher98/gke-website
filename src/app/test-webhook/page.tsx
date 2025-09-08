'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestWebhookPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const triggerTestWebhook = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/webhooks/test')
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Test webhook triggered successfully! Check your console and database.')
        console.log('Test webhook response:', data)
        
        // If there's a checkout URL, you could redirect to it
        if (data.url) {
          // Uncomment this line to automatically redirect to Stripe checkout
          // window.location.href = data.url
        }
      } else {
        setMessage(`Error: ${data.error || 'Failed to trigger webhook'}`)
      }
    } catch (error) {
      console.error('Test webhook error:', error)
      setMessage('Failed to trigger test webhook. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Stripe Webhook Tester</h1>
          <p className="mt-2 text-sm text-gray-600">
            Test your Stripe webhook integration
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This is a test environment. No real payments will be processed.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-blue-800">How to test:</h3>
            <ol className="mt-2 text-sm text-blue-700 list-decimal list-inside space-y-1">
              <li>Click the button below to trigger a test webhook</li>
              <li>Check your browser console for the response</li>
              <li>Verify the webhook was received in your Stripe logs</li>
              <li>Check your database for the test entry</li>
            </ol>
          </div>

          <div className="mt-6">
            <button
              onClick={triggerTestWebhook}
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Trigger Test Webhook'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50' : 'bg-green-50'}`}>
              <p className={`text-sm ${message.includes('Error') ? 'text-red-700' : 'text-green-700'}`}>
                {message}
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900">Test Card Details</h3>
            <div className="mt-2 text-sm text-gray-700 space-y-1">
              <p>Card: <code className="bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code></p>
              <p>Any future date, any 3-digit CVC, any ZIP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
