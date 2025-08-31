'use client'

import { Calendar, MapPin, Users } from 'lucide-react'

const EventsHero = () => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 african-pattern-bg opacity-5" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6">
            Discover Our{' '}
            <span className="text-gradient">Events</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the magic of Afrocentric culture, connect with business leaders, 
            and celebrate heritage through our exclusive events and programs.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-dark-800/50 rounded-lg border border-dark-700">
            <Calendar className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">25+</div>
            <div className="text-gray-400">Upcoming Events</div>
          </div>
          <div className="text-center p-4 bg-dark-800/50 rounded-lg border border-dark-700">
            <MapPin className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">15+</div>
            <div className="text-gray-400">Cities</div>
          </div>
          <div className="text-center p-4 bg-dark-800/50 rounded-lg border border-dark-700">
            <Users className="w-8 h-8 text-royal-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-gray-400">Attendees</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default EventsHero





