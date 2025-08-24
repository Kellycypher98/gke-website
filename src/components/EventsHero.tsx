'use client'

import { useState } from 'react'
import { Search, Filter, Calendar, MapPin, Users } from 'lucide-react'

const EventsHero = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedBrand, setSelectedBrand] = useState('all')

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'cultural-festival', label: 'Cultural Festival' },
    { value: 'business-summit', label: 'Business Summit' },
    { value: 'networking', label: 'Networking' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'investment-forum', label: 'Investment Forum' },
    { value: 'awards-ceremony', label: 'Awards Ceremony' },
  ]

  const brands = [
    { value: 'all', label: 'All Brands' },
    { value: 'afro-splash', label: 'Afro Splash Night' },
    { value: 'kente-banquet', label: 'Kente Banquet' },
    { value: 'gbu-uk', label: 'GBU-UK' },
  ]

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

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
              >
                {brands.map((brand) => (
                  <option key={brand.value} value={brand.value}>
                    {brand.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </section>
  )
}

export default EventsHero





