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

       
       
      </div>
    </section>
  )
}

export default EventsHero





