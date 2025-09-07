import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Clock, Ticket, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { getEvent, type Event } from '@/lib/events'


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

export default async function EventDetailPage({ params }: PageProps) {
  const event = await getEvent(params.id)
  
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
  
  // Destructure with defaults to prevent runtime errors
  const { 
    title = 'Event Title', 
    description = 'No description available', 
    content = '', 
    image = '', 
    brand = '', 
    category = '', 
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
  } = event || {}
  
  // Safely access ticket prices with fallbacks
  const ticketPrices = event?.ticket_prices || {};
  const early_bird = 'early_bird' in ticketPrices ? ticketPrices.early_bird : 0;
  const gate = 'gate' in ticketPrices ? ticketPrices.gate : 0;
  const currency = 'currency' in ticketPrices ? ticketPrices.currency : 'GBP';
  
  // Handle date fallbacks
  const eventDate = first_event_date || date || ''
  
  const formattedDate = eventDate ? formatDate(eventDate, recurrence) : 'Date to be announced';
  const formattedTime = time_start && time_end 
    ? formatTimeRange(time_start, time_end) 
    : time || 'Time to be announced';
  const locationText = [address, city, country].filter(Boolean).join(', ') || 'Location TBA'
  const soldPercentage = capacity > 0 ? Math.round((sold / capacity) * 100) : 0

  return (
    <div className="container-custom section-padding space-y-10">
      {/* Back Button */}
      <div className="mt-4">
        <Link href="/events" className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>

      {/* Header */}
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

      {/* Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Image */}
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

          {/* Event Description */}
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

            {/* Location Details */}
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

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 space-y-6">
          {/* Ticket Info */}
          <div className="card p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-semibold">Tickets</h3>
              
              {/* Price */}
              <div className="space-y-1">
                {early_bird && gate ? (
                  <div>
                    <span className="text-3xl font-bold text-white">
                      {currency || '£'}{early_bird}
                    </span>
                    <span className="text-gray-400 ml-2 line-through">
                      {currency || '£'}{gate}
                    </span>
                    <div className="text-sm text-secondary-400 mt-1">
                      Early bird price available until {eventDate ? format(new Date(eventDate), 'MMM d') : 'soon'}
                    </div>
                  </div>
                ) : gate ? (
                  <div className="text-3xl font-bold text-white">
                    {currency || '£'}{gate}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-green-400">Free</div>
                )}
              </div>

              {/* Capacity */}
              {capacity > 0 && (
                <div className="space-y-2 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tickets Available</span>
                    <span className="text-white">
                      {capacity - sold} of {capacity}
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pt-4">
                <Link 
                  href={`/events/${event.id}/book`} 
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  Book Now
                </Link>
              </div>
            </div>
          </div>

          {/* Event Tags */}
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



