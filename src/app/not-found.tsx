import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 text-white p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-primary-500 mb-4">Coming Soon</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">This page is under construction</h2>
          <p className="text-gray-300 mb-8 text-lg">
            We're working hard to bring you something amazing. Please check back later!
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/" 
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Return Home
          </Link>
          <Link 
            href="/contact" 
            className="px-6 py-3 border border-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
          >
            Contact Us
          </Link>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500">
            In the meantime, check out our{' '}
            <Link href="/events" className="text-primary-400 hover:underline">upcoming events</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
