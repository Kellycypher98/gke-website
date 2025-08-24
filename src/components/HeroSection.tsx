'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, ArrowRight, Star, Users, Calendar, MapPin } from 'lucide-react'

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0)

  const heroImages = [
    '/images/friends-hero.jpg',
   '/images/dj.jpeg',
    '/images/girl-hero.jpg',

  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      {/* African Pattern Overlay */}
      <div className="absolute inset-0 african-pattern-bg opacity-10" />

      {/* Content */}
      <div className="relative z-10 container-custom text-center px-4">
        <div className="max-w-4xl mx-auto mt-10">
          

          {/* Main Heading */}
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-heading  pt-10 font-bold text-white mb-6 ">
            Experience{' '}
            <span className="text-gradient">Culture</span>
            <br />
            Empower{' '}
            <span className="text-gradient">Business</span>
            <br />
            Celebrate{' '}
            <span className="text-gradient">Life</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Discover the magic of Afrocentric culture through our exclusive events, 
            business empowerment programs, and unforgettable experiences that celebrate 
            heritage and drive success.
          </p>

          {/* CTA Button */}
          <Link href="/events" className="btn-primary text-lg px-8 py-2 inline-flex items-center justify-center">
            Explore Events
          </Link>

        

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-8 mt-8 md:mt-10">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-500" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">10K+</div>
              <div className="text-gray-400 text-sm sm:text-base">Happy Attendees</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-secondary-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-secondary-500" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">100+</div>
              <div className="text-gray-400 text-sm sm:text-base">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-royal-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-royal-500" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">10+</div>
              <div className="text-gray-400 text-sm sm:text-base">Cities Reached</div>
            </div>
          </div>
        </div>
      </div>

     
    


      {/* Image Indicators */}
      <div className="hidden md:flex absolute bottom-8 right-8 space-x-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImage ? 'bg-primary-500 w-8' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection



