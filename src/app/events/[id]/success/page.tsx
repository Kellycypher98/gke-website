'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your payment...')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error')
        setMessage('No session ID found. Please check your email for confirmation.')
        return
      }

      try {
        const response = await fetch(`/api/checkout/success?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message || 'Your payment was successful! You will receive a confirmation email shortly.')
        } else {
          setStatus('error')
          setMessage(data.error || 'There was an issue processing your payment. Please contact support if the issue persists.')
        }
      } catch (error) {
        console.error('Error verifying payment:', error)
        setStatus('error')
        setMessage('Unable to verify payment status. Please check your email for confirmation or contact support.')
      }
    }

    verifyPayment()
  }, [sessionId])

  return (
    <div className="container-custom section-padding text-center space-y-6">
      <div className="flex flex-col items-center justify-center">
        {status === 'success' ? (
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        ) : status === 'error' ? (
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        ) : (
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        )}

        <h1 className="text-3xl md:text-4xl font-heading font-semibold mb-2">
          {status === 'success' 
            ? 'Payment Successful!' 
            : status === 'error' 
              ? 'Payment Processing Issue'
              : 'Processing Payment...'}
        </h1>
        
        <p className="text-foreground/80 max-w-lg mx-auto">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-8 justify-center">
          <Link 
            href="/events" 
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            Browse More Events
          </Link>
          
          <Link 
            href="/account/tickets" 
            className="btn-outline inline-flex items-center justify-center gap-2"
          >
            View My Tickets
          </Link>
        </div>
      </div>
    </div>
  )
}
