'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ArrowRight, Ticket } from 'lucide-react'

const FeaturedEvents = () => {
  const [afroSplashEvent, setAfroSplashEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Afro Splash event from API
  useEffect(() => {
    const fetchAfroSplashEvent = async () => {
      try {
        setLoading(true)
        // Fetch all events and filter for Afro Splash
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const events = await response.json()
        
        // Find the Afro Splash event
        const afroSplash = events.find((event: any) => 
          event.brand === 'Afro Splash Night' || 
          event.title.toLowerCase().includes('afro splash')
        )
        
        setAfroSplashEvent(afroSplash || null)
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch event')
        console.error('Error fetching Afro Splash event:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAfroSplashEvent()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    const weekday = weekdays[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${weekday}, ${day} ${month} ${year}`
  }

  const getTimeUntilEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const now = new Date()
    const diff = eventDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Event has passed'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} to go`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} to go`
    return 'Starting soon!'
  }

  const getSoldPercentage = (sold: number, capacity: number) => {
    return Math.round((sold / capacity) * 100)
  }

  return (
    <section className="section-padding bg-dark-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 african-pattern-bg opacity-5" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Featured Event: Afro Splash
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Don't miss out on our premier Afrocentric cultural celebration. Book your tickets early 
            and secure your spot at this exclusive experience.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading Afro Splash event...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">Error loading event: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : afroSplashEvent ? (
          <div className="max-w-4xl mx-auto">
            <div
              className="group relative overflow-hidden rounded-2xl bg-dark-900 border border-dark-700 hover:border-primary-500/50 transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Event Image */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.8)), url(${afroSplashEvent.image})`,
                  }}
                />
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 bg-primary-500 text-dark-900 px-3 py-1 rounded-full text-sm font-semibold">
                  Featured Event
                </div>
                
                {/* Countdown */}
                <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-sm text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                  {getTimeUntilEvent(afroSplashEvent.date)}
                </div>
                
                {/* Event Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-dark-900/80 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-xl font-heading font-bold text-white mb-2">
                      {afroSplashEvent.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        <span>{formatDate(afroSplashEvent.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span>{afroSplashEvent.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-primary-400 font-semibold uppercase tracking-wide">
                    {afroSplashEvent.brand}
                  </span>
                  <span className="text-sm text-gray-400">
                    {afroSplashEvent.category}
                  </span>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {afroSplashEvent.description}
                </p>

                {/* Location */}
                <div className="flex items-center space-x-2 mb-4 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{afroSplashEvent.location}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {afroSplashEvent.tags?.map((tag: string) => (
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
                      {afroSplashEvent.capacity - afroSplashEvent.sold} of {afroSplashEvent.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getSoldPercentage(afroSplashEvent.sold, afroSplashEvent.capacity)}%` }}
                    />
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {afroSplashEvent.currency} {afroSplashEvent.price}
                    </div>
                    <div className="text-sm text-gray-400">per ticket</div>
                  </div>
                  <Link
                    href={`/events/${afroSplashEvent.id}`}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Buy Tickets</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No Afro Splash event found.</p>
        </div>
        )}

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
