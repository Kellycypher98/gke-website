import Link from 'next/link'
import { getEvent } from '@/lib/events'

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function EventBookingPage({ params }: PageProps) {
  const event = await getEvent(params.id)
  
  if (!event) {
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

  return (
    <div className="container-custom section-padding space-y-8">
      <header className="space-y-2">
        <Link href={`/events/${event.id}`} className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors text-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Event
        </Link>
        <h1 className="text-3xl md:text-4xl font-heading font-semibold">Book Tickets: {event.title}</h1>
      </header>

      <div className="card p-6 space-y-6">
        <div className="prose prose-invert max-w-none">
          <p className="text-foreground/80">
            Ticketing flow coming soon. Connect your payment provider (Stripe, Paystack, etc.) and implement
            checkout here.
          </p>
          
          {event.ticket_prices && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Available Tickets</h3>
              <div className="space-y-3">
                {event.ticket_prices.early_bird && (
                  <div className="p-4 border border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Early Bird</h4>
                        <p className="text-sm text-gray-400">Available until {event.first_event_date ? new Date(event.first_event_date).toLocaleDateString() : 'soon'}</p>
                      </div>
                      <span className="text-lg font-semibold">
                        {event.ticket_prices.currency || '£'}{event.ticket_prices.early_bird}
                      </span>
                    </div>
                  </div>
                )}
                
                {event.ticket_prices.gate && (
                  <div className="p-4 border border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Standard Ticket</h4>
                        <p className="text-sm text-gray-400">Regular admission</p>
                      </div>
                      <span className="text-lg font-semibold">
                        {event.ticket_prices.currency || '£'}{event.ticket_prices.gate}
                      </span>
                    </div>
                  </div>
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

export const dynamic = 'force-dynamic'





