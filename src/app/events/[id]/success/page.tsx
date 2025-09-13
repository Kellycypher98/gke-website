'use client';

// Static success page: render a simple thank-you message

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Thank you for your order!</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Please check your email for your order confirmation and ticket details.
          </p>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-8 border border-dark-700/50 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-2">What's next?</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>Look for your confirmation email in your inbox (and spam folder just in case).</li>
            <li>Save your ticket/QR code for entry to the event.</li>
            <li>Reach out if you need any help.</li>
          </ul>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/events"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-dark-900"
          >
            Browse More Events
          </a>
          <a
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-xl border border-dark-600 hover:border-dark-500 transition-colors duration-300"
          >
            Go to Homepage
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-700 text-center">
          <p className="text-sm text-gray-400 mb-2">Need help with your order?</p>
          <a href="mailto:support@example.com" className="inline-flex items-center text-primary-400 hover:text-primary-300 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
