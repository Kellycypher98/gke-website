'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Ticket, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { getEvent, type Event } from '@/lib/events'
import { createCheckoutSession } from '@/app/actions/checkout'

const formatDate = (dateString: string, recurrence?: string) => {
  const date = new Date(dateString)
  const formattedDate = format(date, 'EEEE, d MMMM yyyy')
  
  if (!recurrence || recurrence === 'NONE') return formattedDate
  
  const recurrenceMap: Record<string, string> = {
    'LAST_FRIDAY_MONTHLY': ' (Last Friday of every month)',
    'FIRST_FRIDAY_MONTHLY': ' (First Friday of every month)',
    'WEEKLY': ' (Every week)',
    'BIWEEKLY': ' (Every other week)',
    'MONTHLY': ' (Monthly)'
  }
  
  return `${formattedDate}${recurrenceMap[recurrence] || ''}`
}

const formatTimeRange = (startTime?: string, endTime?: string) => {
  if (!startTime) return 'TBA'
  if (!endTime) return format(new Date(`2000-01-01T${startTime}`), 'h:mm a')
  return `${format(new Date(`2000-01-01T${startTime}`), 'h:mm a')} - ${format(new Date(`2000-01-01T${endTime}`), 'h:mm a')}`
}

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

function EventDetailPageContent({ id }: { id: string }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEvent(id)
        setEvent(data)
      } catch (err) {
        console.error('Error fetching event:', err)
        setError('Failed to load event. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvent()
  }, [id])
  
  if (loading) {
    return (
      <div className="container-custom section-padding text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary-400" />
        <p className="mt-4">Loading event details...</p>
      </div>
    )
  }
  
  if (!event) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="text-3xl font-heading font-semibold mb-4">Event Not Found</h1>
        <p className="text-foreground/70 mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Link href="/events" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
      </div>
    )
  }

  const { 
    title = 'Event Title', 
    description = 'No description available', 
    content = '', 
    image = '', 
    tags = [], 
    first_event_date = '',
    date = '',
    recurrence = 'NONE', 
    time_start = '', 
    time_end = '', 
    time = '',
    address = '', 
    city = '', 
    country = '',
    capacity = 0,
    sold = 0,
    ticket_prices = {}
  } = event
  
  const ticketPrices = ticket_prices || {}
  const currency = ticketPrices?.currency ?? 'GBP'
  
  // Debug log to check the event data
  console.log('Event data:', {
    ticketPrices,
    event
  });

  // Get all available ticket types from the event
  const availableTickets = Object.entries(ticketPrices)
    .filter(([key, value]) => {
      // Skip non-ticket fields and invalid prices
      return typeof value === 'number' && value > 0 && key !== 'currency';
    })
    .map(([type, price]) => {
      const displayName = type.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        type,
        price,
        displayName,
        currency: ticketPrices.currency || 'GBP'
      };
    });

  // Tickets that have a price but are not available for online purchase
  const unavailableTickets = Object.entries(ticketPrices)
    .filter(([key, value]) => {
      return typeof value === 'number' && 
             value > 0 && 
             key !== 'currency' &&
             !availableTickets.some(t => t.type === key);
    })
    .map(([type]) => type);
    
  console.log('Available tickets:', availableTickets);
  console.log('Unavailable tickets:', unavailableTickets);
  
  const eventDate = first_event_date || date || ''
  const formattedDate = eventDate ? formatDate(eventDate, recurrence) : 'Date to be announced'
  const formattedTime = time_start && time_end 
    ? formatTimeRange(time_start, time_end) 
    : time || 'Time to be announced'
  const locationText = [address, city, country].filter(Boolean).join(', ') || 'Location TBA'

  const handleCheckout = async () => {
    if (!selectedTicket) {
      setError('Please select a ticket type')
      return
    }
    
    if (!event) return
    
    try {
      setCheckoutLoading(true)
      setError(null)
      
      // Find the selected ticket to get its price ID
      const selectedTicketData = availableTickets.find(t => t.type === selectedTicket);
      
      if (!selectedTicketData) {
        throw new Error('Selected ticket not found');
      }
      
      console.log('Creating checkout session with:', {
        amount: selectedTicketData.price,
        currency: selectedTicketData.currency,
        eventId: event.id,
        ticketType: selectedTicket,
        quantity
      });
      
      const { url } = await createCheckoutSession({
        amount: selectedTicketData.price,
        currency: selectedTicketData.currency,
        eventId: event.id,
        ticketType: selectedTicket,
        quantity,
        successUrl: `${window.location.origin}/events/${event.id}/success`,
        cancelUrl: window.location.href,
      });

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  }

  // Show setup warning if there are no tickets available
  const showSetupWarning = unavailableTickets.length > 0 && availableTickets.length === 0;

  return (
    <div className="container-custom section-padding space-y-10">
      <div className="mt-10">
        <Link href="/events" className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>

      <header className="space-y-4">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-white">{title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-secondary-400" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-royal-300" />
            <span>{city || 'Location TBA'}</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-dark-900">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                priority
                unoptimized={true}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
                <div className="text-center p-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-gray-400">Event Image</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-heading font-semibold mb-4">About This Event</h2>
              <p className="text-gray-300 leading-relaxed">{description}</p>
              
              {content && (
                <div className="mt-6">
                  <div dangerouslySetInnerHTML={{ __html: content }} className="space-y-4" />
                </div>
              )}
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="text-xl font-heading font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-royal-400" />
                Location
              </h3>
              <div className="space-y-2">
                <p className="text-gray-300">{locationText}</p>
                {address && (
                  <p className="text-sm text-gray-400">
                    {[address, city, country].filter(Boolean).join(', ')}
                  </p>
                )}
                <div className="pt-4">
                  <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                    View on map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 space-y-6">
          <div className="card p-6 space-y-6">
            <h3 className="text-xl font-heading font-semibold">Get Tickets</h3>
            
            {/* Setup Warning */}
            {showSetupWarning && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-300">Tickets Not Available</h4>
                    <p className="text-sm text-yellow-200 mt-1">
                      Online ticket sales are not set up for this event. Please contact the event organizer for ticket information.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Unavailable Tickets Info */}
            {unavailableTickets.length > 0 && process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-300">Tickets Not Available for Online Purchase</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      These tickets are not available for online purchase: {unavailableTickets.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {availableTickets.map((ticket) => (
                <button
                  key={ticket.type}
                  onClick={() => setSelectedTicket(ticket.type)}
                  className={`w-full text-left p-4 border rounded-lg transition-all ${
                    selectedTicket === ticket.type
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-gray-700 hover:border-primary-500/50 hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{ticket.displayName}</h4>
                      {ticket.type === 'early_bird' && (
                        <p className="text-sm text-gray-400">
                          Available until {eventDate ? format(new Date(eventDate), 'MMM d') : 'soon'}
                        </p>
                      )}
                    </div>
                    <div className="text-lg font-semibold">
                      {currency === 'GBP' ? '£' : currency}{ticket.price}
                    </div>
                  </div>
                </button>
              ))}

              {/* Show unavailable tickets */}
              {unavailableTickets.map((ticketType) => {
                const price = ticketPrices[ticketType];
                const displayName = ticketType.split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                
                return (
                  <div key={ticketType} className="relative">
                    <div className="w-full text-left p-4 border border-gray-800 rounded-lg opacity-60">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-400">{displayName}</h4>
                          <p className="text-sm text-gray-500">Currently unavailable</p>
                        </div>
                        <div className="text-lg font-semibold text-gray-500">
                          {currency === 'GBP' ? '£' : currency}{price}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Gate ticket - always show as unavailable for online purchase */}
              {ticketPrices.gate > 0 && !availableTickets.find(t => t.type === 'gate') && (
                <div className="relative">
                  <div className="w-full text-left p-4 border border-gray-800 rounded-lg opacity-60">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-400">Gate Ticket</h4>
                        <p className="text-sm text-gray-400">Available at the gate</p>
                      </div>
                      <div className="text-lg font-semibold text-gray-500">
                        {currency === 'GBP' ? '£' : currency}{ticketPrices.gate}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-gray-900 text-xs text-gray-400 px-2 py-1 rounded">Gate Only</span>
                  </div>
                </div>
              )}
            </div>

            {availableTickets.length > 0 && (
              <>
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                    <span>Quantity</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
                    <button 
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <div className="flex-1 text-center py-2">{quantity}</div>
                    <button 
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setQuantity(prev => prev + 1)}
                      disabled={quantity >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={!selectedTicket || checkoutLoading || availableTickets.length === 0}
                  className={`btn-primary w-full flex items-center justify-center gap-2 mt-4 ${
                    (!selectedTicket || checkoutLoading || availableTickets.length === 0) 
                      ? 'opacity-70 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-5 h-5" />
                      {selectedTicket === 'early_bird' ? 'Get Early Bird Ticket' : 'Get Tickets'}
                    </>
                  )}
                </button>
              </>
            )}

            {availableTickets.length === 0 && !showSetupWarning && (
              <div className="text-center py-4">
                <p className="text-gray-400">No tickets available for online purchase</p>
                <p className="text-sm text-gray-500 mt-1">Check back later or contact the organizer</p>
              </div>
            )}
          </div>

          {tags && tags.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-heading font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span 
                    key={i}
                    className="px-3 py-1 bg-dark-700 text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <EventDetailPageContent id={id} />
}