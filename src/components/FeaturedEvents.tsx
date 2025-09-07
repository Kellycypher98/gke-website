'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ArrowRight, Ticket } from 'lucide-react'

type Event = {
  id: string
  title: string
  description: string
  content: string
  image: string
  gallery: string[] | null
  brand: string
  category: string
  tags: string[]
  first_event_date: string
  recurrence: string
  time_start: string
  time_end: string
  location: string
  address: string
  city: string
  country: string
  capacity: number
  sold: number
  featured: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
  ticket_prices: {
    early_bird: number
    gate: number
    currency: string
  }
  meta_title: string
  meta_description: string
  meta_keywords: string[]
  created_at: string
  updated_at: string
}

const FeaturedEvents = () => {
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch featured events from API
  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching featured events from API...')
        // Fetch only featured and published events
        const response = await fetch('/api/events?featured=true')
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error Response:', errorText)
          throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Featured Events API Response:', data)
        
        if (!data.events || !Array.isArray(data.events)) {
          throw new Error('Invalid response format: expected events array')
        }
        
        // Get the first featured event (or null if none)
        const featuredEvent = data.events[0] || null
        
        if (!featuredEvent) {
          console.warn('No featured events found')
        } else {
          console.log('Found featured event:', featuredEvent)
        }
        
        setFeaturedEvent(featuredEvent)
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to fetch event'
        console.error('Error fetching featured events:', err)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Error loading featured event: {error}</span>
            </div>
          </div>
        </div>
      </section>
    )
  }
  
  if (!featuredEvent) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Upcoming Events</h2>
            <p className="text-gray-600 mb-8">Check back soon for our next event!</p>
            <Link 
              href="/events" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              View Past Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const formatDate = (dateString: string, recurrence?: string) => {
    if (!dateString) return 'Date TBA'
    const date = new Date(dateString)
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const weekday = weekdays[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    let formattedDate = `${weekday}, ${day} ${month} ${year}`
    
    // Add recurrence info if available
    if (recurrence && recurrence !== 'NONE') {
      const recurrenceMap: Record<string, string> = {
        'LAST_FRIDAY_MONTHLY': ' (Last Friday of every month)',
        'FIRST_FRIDAY_MONTHLY': ' (First Friday of every month)',
        'WEEKLY': ' (Every week)',
        'BIWEEKLY': ' (Every other week)',
        'MONTHLY': ' (Monthly)'
      }
      formattedDate += recurrenceMap[recurrence] || ''
    }
    
    return formattedDate
  }

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime) return 'Time TBA'
    if (!endTime) return formatTime(startTime)
    return `${formatTime(startTime)} - ${formatTime(endTime)}`
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatPrice = (prices?: { early_bird?: number, gate?: number, currency?: string }) => {
    if (!prices) return 'Free'
    const { early_bird, gate, currency = '£' } = prices
    if (early_bird && gate) {
      return `${currency}${early_bird} - ${currency}${gate}`
    }
    if (early_bird) return `${currency}${early_bird}`
    if (gate) return `${currency}${gate}`
    return 'Free'
  }

  const formatLocation = (event: Event) => {
    const { location, address, city, country } = event
    const parts = [address, city, country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Location TBA'
  }

  const getSoldPercentage = (sold: number, capacity: number) => {
    if (!capacity || capacity === 0) return 0
    return Math.round((sold / capacity) * 100)
  }

  const getTimeUntilEvent = (event: Event) => {
    if (!event.first_event_date) return 'Date TBA'
    
    try {
      const eventDate = new Date(`${event.first_event_date}T${event.time_start || '00:00:00'}`)
      const now = new Date()
      const diff = eventDate.getTime() - now.getTime()
      
      // If event is in the past and not recurring, show that it's passed
      if (diff <= 0 && (!event.recurrence || event.recurrence === 'NONE')) {
        return 'Event has passed'
      }
      
      // If event is in the past but recurring, show when it's next occurring
      if (diff <= 0) {
        return 'Next occurrence coming soon!'
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) return `${days} day${days !== 1 ? 's' : ''} to go`
      if (hours > 0) return `Starts in ${hours} hour${hours !== 1 ? 's' : ''}`
      
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      return `Starts in ${minutes} minute${minutes !== 1 ? 's' : ''}`
    } catch (error) {
      console.error('Error calculating time until event:', error)
      return 'Date TBA'
    }
  }

  if (loading) {
    return (
      <section className="section-padding bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 african-pattern-bg opacity-5" />
        <div className="container-custom relative z-10">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading featured event...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section-padding bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 african-pattern-bg opacity-5" />
        <div className="container-custom relative z-10">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg inline-flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Error loading featured event: {error}</span>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!featuredEvent) {
    return (
      <section className="section-padding bg-dark-800 relative overflow-hidden">
        <div className="absolute inset-0 african-pattern-bg opacity-5" />
        <div className="container-custom relative z-10">
          <div className="text-center py-12">
            <p className="text-gray-400">No featured events available at this time.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 african-pattern-bg opacity-5" />
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="group relative overflow-hidden rounded-2xl bg-dark-900 border border-dark-700 hover:border-primary-500/50 transition-all duration-500 transform hover:-translate-y-2">
              {/* Event Image */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.8)), url(${featuredEvent.image || '/images/event-placeholder.jpg'})`,
                  }}
                />
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 bg-primary-500 text-dark-900 px-3 py-1 rounded-full text-sm font-semibold">
                  {featuredEvent.category?.replace('_', ' ') || 'Featured Event'}
                </div>
                
                {/* Countdown */}
                <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-sm text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                  {getTimeUntilEvent(featuredEvent)}
                </div>
                
                {/* Event Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-dark-900/80 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-xl font-heading font-bold text-white mb-2">
                      {featuredEvent.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        <span>{formatDate(featuredEvent.first_event_date, featuredEvent.recurrence)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span>{formatTimeRange(featuredEvent.time_start, featuredEvent.time_end)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {featuredEvent.brand && (
                      <span className="text-sm text-primary-400 font-semibold uppercase tracking-wide">
                        {featuredEvent.brand}
                      </span>
                    )}
                    {featuredEvent.category && (
                      <span className="text-sm bg-dark-700 text-gray-300 px-2 py-1 rounded">
                        {featuredEvent.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {featuredEvent.ticket_prices?.early_bird ? (
                      <span className="text-sm font-medium text-secondary-400">
                        From {featuredEvent.ticket_prices.currency || '£'}{featuredEvent.ticket_prices.early_bird}
                      </span>
                    ) : featuredEvent.ticket_prices?.gate ? (
                      <span className="text-sm font-medium text-secondary-400">
                        {featuredEvent.ticket_prices.currency || '£'}{featuredEvent.ticket_prices.gate}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-green-400">Free</span>
                    )}
                    <span className="text-sm text-gray-400">•</span>
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{featuredEvent.city || 'Location TBA'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {featuredEvent.description || 'Join us for an amazing event!'}
                </p>

                {/* Location */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{formatLocation(featuredEvent)}</span>
                  </div>
                  {featuredEvent.address && (
                    <div className="text-xs text-gray-500 pl-6">
                      {[featuredEvent.address, featuredEvent.city, featuredEvent.country]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {Array.isArray(featuredEvent.tags) && featuredEvent.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-dark-700 text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Capacity Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Tickets Available</span>
                    <span className="text-white">
                      {featuredEvent.capacity - (featuredEvent.sold || 0)} of {featuredEvent.capacity || '∞'}
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getSoldPercentage(featuredEvent.sold || 0, featuredEvent.capacity || 1)}%` }}
                    />
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    {featuredEvent.ticket_prices?.early_bird && featuredEvent.ticket_prices?.gate ? (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {formatPrice(featuredEvent.ticket_prices)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Early bird: {featuredEvent.ticket_prices.currency || '£'}{featuredEvent.ticket_prices.early_bird} | 
                          Gate: {featuredEvent.ticket_prices.currency || '£'}{featuredEvent.ticket_prices.gate}
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-white">
                        {formatPrice(featuredEvent.ticket_prices)}
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/events/${featuredEvent.id}`}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Buy Tickets</span>
                  </Link>
                </div>
              </div>
          </div>
        </div>
        
        {/* View All Events CTA */}
        <div className="text-center mt-12">
          <Link
            href="/events"
            className="btn-outline text-lg px-8 py-4 inline-flex items-center space-x-2"
          >
            <span>View All Events</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedEvents
