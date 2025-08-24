'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, MapPin, Star, Award, Heart } from 'lucide-react'

const StatsSection = () => {
  const [counts, setCounts] = useState({
    events: 0,
    attendees: 0,
    cities: 0,
    satisfaction: 0,
  })

  const targetCounts = {
    events: 500,
    attendees: 10000,
    cities: 25,
    satisfaction: 98,
  }

  useEffect(() => {
    const animateCounts = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps

        setCounts({
          events: Math.floor(targetCounts.events * progress),
          attendees: Math.floor(targetCounts.attendees * progress),
          cities: Math.floor(targetCounts.cities * progress),
          satisfaction: Math.floor(targetCounts.satisfaction * progress),
        })

        if (currentStep >= steps) {
          clearInterval(interval)
          setCounts(targetCounts)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounts()
          observer.unobserve(entry.target)
        }
      })
    })

    const element = document.getElementById('stats-section')
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const stats = [
    {
      icon: Calendar,
      value: counts.events,
      suffix: '+',
      label: 'Events Hosted',
      color: 'primary',
    },
    {
      icon: Users,
      value: counts.attendees,
      suffix: '+',
      label: 'Happy Attendees',
      color: 'secondary',
    },
    {
      icon: MapPin,
      value: counts.cities,
      suffix: '+',
      label: 'Cities Reached',
      color: 'royal',
    },
    {
      icon: Star,
      value: counts.satisfaction,
      suffix: '%',
      label: 'Satisfaction Rate',
      color: 'accent',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'text-primary-500 bg-primary-500/20',
      secondary: 'text-secondary-500 bg-secondary-500/20',
      royal: 'text-royal-500 bg-royal-500/20',
      accent: 'text-accent-500 bg-accent-500/20',
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  return (
    <section id="stats-section" className="section-padding bg-dark-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 african-pattern-bg opacity-5" />
      
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover the scale of our cultural impact and business empowerment across the globe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-20 h-20 ${getColorClasses(stat.color)} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-10 h-10" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 font-heading">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-gray-400 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Additional Achievements */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-white mb-2">Industry Recognition</h3>
            <p className="text-gray-400">Multiple awards for cultural excellence and business innovation</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-royal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-white mb-2">Community Impact</h3>
            <p className="text-gray-400">Supporting local businesses and cultural preservation initiatives</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-royal-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-white mb-2">Global Reach</h3>
            <p className="text-gray-400">Connecting cultures and businesses across continents</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsSection



