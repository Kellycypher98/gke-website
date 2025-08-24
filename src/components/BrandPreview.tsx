'use client'

import Link from 'next/link'
import { ArrowRight, Star, Users, Calendar, MapPin } from 'lucide-react'

const BrandPreview = () => {
  const brands = [
    {
      name: 'Afro Splash Night',
      description: 'where Afrobeats, Amapiano, Dancehall and RnB meet on the water. The vibes, the culture, the people – one unforgettable night.',
      image: '/images/AfroSplash.jpg',
      href: '/brands/afro-splash',
      features: ['Live Music', 'Djs on rotation', 'Food and Drinks', 'Networking'],
      stats: { events: 150, attendees: 3000, rating: 4.9 },
      color: 'primary',
    },
    {
      name: 'Kente Banquet',
      description: 'An elegant celebration of African heritage through sophisticated dining, cultural performances, and business networking opportunities.',
      image: '/images/kente.jpeg',
      href: '/brands/kente-banquet',
      features: ['Fine Dining', 'Cultural Performances', 'Business Networking', 'Award Ceremonies'],
      stats: { events: 80, attendees: 1200, rating: 4.8 },
      color: 'secondary',
    },
    {
      name: 'GBU-UK',
      description: 'Global Business United - UK chapter dedicated to empowering African entrepreneurs and fostering international business connections.',
      image: '/images/gbu.jpeg',
      href: '/brands/gbu-uk',
      features: ['Business Workshops', 'Mentorship Programs', 'Investment Forums', 'International Trade'],
      stats: { events: 200, attendees: 5000, rating: 4.7 },
      color: 'royal',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'from-primary-500 to-primary-600',
      secondary: 'from-secondary-500 to-secondary-600',
      royal: 'from-royal-500 to-royal-600',
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  const getBorderColor = (color: string) => {
    const colors = {
      primary: 'border-primary-500/30',
      secondary: 'border-secondary-500/30',
      royal: 'border-royal-500/30',
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Our Signature Events
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover our signature events that celebrate culture, empower business, 
            and create unforgettable experiences across the United Kingdom and beyond.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {brands.map((brand, index) => (
            <div
              key={brand.name}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-all duration-500 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Background Image */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.8)), url(${brand.image})`,
                  }}
                />
                
                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-t ${getColorClasses(brand.color)} opacity-20`} />
                
                {/* Brand Name */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">
                    {brand.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-white/90">
                    {/* <Star className="w-4 h-4 text-primary-400" /> */}
                   {/*  <span className="text-sm">{brand.stats.rating}</span> */}
                   {/*  <span className="text-white/60">•</span> */}
                  {/*  <span className="text-sm">{brand.stats.events} events</span> */}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {brand.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                    What to expect
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {brand.features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full bg-${brand.color}-500`} />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

               

                {/* CTA Button */}
                <Link
                  href={brand.href}
                  className={`w-full bg-gradient-to-r ${getColorClasses(brand.color)} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2`}
                >
                  <span>Explore {brand.name}</span>
                 
                </Link>
              </div>

              {/* Hover Effect Border */}
              <div className={`absolute inset-0 rounded-2xl border-2 ${getBorderColor(brand.color)} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-block p-8 bg-dark-800 rounded-2xl border border-dark-700">
            <h3 className="text-2xl font-heading font-bold text-white mb-4">
              Partner With Us
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Ready to sponsor our events? Partner with us to reach 
              engaged audiences and showcase your brand to thousands of people.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/contact" className="btn-primary">
                Become a Sponsor
              </Link>
              <Link href="/events" className="btn-outline">
                View Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandPreview
