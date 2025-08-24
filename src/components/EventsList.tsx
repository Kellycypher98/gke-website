'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, Star, ArrowRight, Ticket, Heart } from 'lucide-react'

const EventsList = () => {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch events from backend
  useEffect(() => {
    let cancelled = false
    async function fetchEvents() {
      try {
        setLoading(true)
        const limit = 6
        const res = await fetch(`/api/events?page=${currentPage}&limit=${limit}`)
        if (!res.ok) throw new Error('Failed to fetch events')
        const data = await res.json()
        // Normalize Decimal price strings to numbers for UI where needed
        const normalized = (data.events || []).map((e: any) => ({
          ...e,
          ticketTiers: (e.ticketTiers || []).map((t: any) => {
            const price = typeof t.price === 'string' ? Number(t.price) : t.price
            const quantity = typeof t.quantity === 'string' ? Number(t.quantity) : t.quantity
            const sold = typeof t.sold === 'string' ? Number(t.sold) : t.sold
            const availableCount = typeof quantity === 'number' && typeof sold === 'number' ? Math.max(0, quantity - sold) : undefined
            return {
              ...t,
              price,
              quantity,
              sold,
              availableCount,
            }
          }),
        }))
        if (!cancelled) {
          setEvents(normalized)
          setTotalPages(data.pagination?.totalPages || 1)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchEvents()
    return () => { cancelled = true }
  }, [currentPage])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
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

  if (loading) {
    return (
      <section className="section-padding bg-dark-900">
        <div className="container-custom text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading events...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-custom">
        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {events.map((event: any, index) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-2xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-all duration-500 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Event Image */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.8)), url(${event.image})`,
                  }}
                />
                
                {/* Featured Badge */}
                {event.featured && (
                  <div className="absolute top-4 left-4 bg-primary-500 text-dark-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Featured Event
                  </div>
                )}
                
                {/* Countdown */}
                <div className="absolute top-4 right-4 bg-dark-900/80 backdrop-blur-sm text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                  {getTimeUntilEvent(event.date)}
                </div>
                
                {/* Event Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-dark-900/80 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-xl font-heading font-bold text-white mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-secondary-400" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-primary-400 font-semibold uppercase tracking-wide">
                    {event.brand}
                  </span>
                  <span className="text-sm text-gray-400">
                    {event.category}
                  </span>
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">
                  {event.description}
                </p>

                {/* Location */}
                <div className="flex items-center space-x-2 mb-4 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{event.location}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-dark-700 text-gray-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Ticket Tiers */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    Ticket Options
                  </h4>
                  <div className="space-y-2">
                    {event.ticketTiers.map((tier: any) => (
                      <div key={tier.id || tier.name} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{tier.name}</div>
                          <div className="text-sm text-gray-400">{typeof tier.availableCount === 'number' ? `${tier.availableCount} available` : ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{tier.currency} {tier.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Tickets Available</span>
                    <span className="text-white">
                      {event.capacity - event.sold} of {event.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getSoldPercentage(event.sold, event.capacity)}%` }}
                    />
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/events/${event.id}`}
                    className="text-primary-500 hover:text-primary-400 font-medium text-sm flex items-center space-x-1 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/events/${event.id}/book`}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Buy Tickets</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-dark-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary-500 text-dark-900'
                    : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-dark-800 text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default EventsList





