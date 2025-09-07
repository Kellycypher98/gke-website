'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getEvent, type Event } from '@/lib/events'
import { createCheckoutSession } from '@/app/actions/checkout'

// Client component for ticket selection UI
function TicketSelection({ event }: { event: Event }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTicketClick = async (ticketType: 'early_bird' | 'gate') => {
    if (!event) return
    
    setIsLoading(ticketType)
    setError(null)
    
    try {
      const priceId = ticketType === 'early_bird' 
        ? event.stripe_early_bird_price_id 
        : event.stripe_standard_price_id
      
      if (!priceId) {
        throw new Error('Price ID not found for selected ticket')
      }

      await createCheckoutSession({
        priceId,
        eventId: event.id,
        ticketType,
        quantity: 1,
        successUrl: `${window.location.origin}/events/${event.id}/success`,
        cancelUrl: window.location.href,
      })
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Failed to start checkout. Please try again.')
      setIsLoading(null)
    }
  }

  return (
    <div className="container-custom section-padding space-y-8">
      <header className="space-y-2">
        <Link 
          href={`/events/${event.id}`} 
          className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors text-sm mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Event
        </Link>
        <h1 className="text-3xl md:text-4xl font-heading font-semibold">Book Tickets: {event.title}</h1>
      </header>

      <div className="card p-6 space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="prose prose-invert max-w-none">
          {event.ticket_prices && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Available Tickets</h3>
              <div className="space-y-3">
                {event.ticket_prices.early_bird && (
                  <button
                    onClick={() => handleTicketClick('early_bird')}
                    disabled={isLoading === 'early_bird'}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      isLoading === 'early_bird'
                        ? 'border-primary-500/50 bg-gray-800/50 cursor-wait'
                        : 'border-gray-700 hover:border-primary-500/50 hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Early Bird</h4>
                        <p className="text-sm text-gray-400">
                          Available until {event.first_event_date ? new Date(event.first_event_date).toLocaleDateString() : 'soon'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {event.ticket_prices.currency || '£'}{event.ticket_prices.early_bird}
                        </span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-primary-500"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
                
                {event.ticket_prices.gate && (
                  <button
                    onClick={() => handleTicketClick('gate')}
                    disabled={isLoading === 'gate'}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      isLoading === 'gate'
                        ? 'border-primary-500/50 bg-gray-800/50 cursor-wait'
                        : 'border-gray-700 hover:border-primary-500/50 hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Standard Ticket</h4>
                        <p className="text-sm text-gray-400">Regular admission</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">
                          {event.ticket_prices.currency || '£'}{event.ticket_prices.gate}
                        </span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-primary-500"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Link 
          href={`/events/${event.id}`} 
          className="btn-outline inline-flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Event Details
        </Link>
        <Link 
          href="/events" 
          className="btn-outline inline-flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to All Events
        </Link>
      </div>
    </div>
  )
}

// Main page component
export default function EventBookingPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true)
        const eventData = await getEvent(params.id)
        setEvent(eventData)
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Failed to load event details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container-custom section-padding text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
        <p className="mt-4 text-foreground/80">Loading event details...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container-custom section-padding text-center space-y-4">
        <h1 className="text-3xl font-heading font-semibold">Event Not Found</h1>
        <p className="text-foreground/70">The event you're looking for doesn't exist or has been removed.</p>
        <div className="flex justify-center gap-3 pt-4">
          <Link href="/events" className="btn-primary inline-flex items-center gap-2">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return <TicketSelection event={event} />
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
