'use client'

import { useState } from 'react'
import { Mail, CheckCircle, ArrowRight, Star, Users, Calendar } from 'lucide-react'

const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 1500)
  }

  const benefits = [
    {
      icon: Star,
      title: 'Exclusive Access',
      description: 'Be the first to know about new events and special offers',
    },
    {
      icon: Users,
      title: 'Community Updates',
      description: 'Stay connected with our growing Afrocentric community',
    },
    {
      icon: Calendar,
      title: 'Event Reminders',
      description: 'Never miss an important event or deadline',
    },
  ]

  if (isSubscribed) {
    return (
      <section className="section-padding bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 african-pattern-bg opacity-5" />
        
        <div className="container-custom relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              Welcome to the Family!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Thank you for subscribing to our newsletter. You're now part of our exclusive 
              community and will receive updates about our latest events, cultural experiences, 
              and business opportunities.
            </p>
            <button
              onClick={() => setIsSubscribed(false)}
              className="btn-outline"
            >
              Subscribe Another Email
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 african-pattern-bg opacity-5" />
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full px-4 py-2 mb-6">
              <Mail className="w-4 h-4 text-primary-500" />
              <span className="text-primary-500 font-semibold text-sm">Newsletter</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              Stay Connected with{' '}
              <span className="text-gradient">Global Kontakt Empire</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join our exclusive newsletter and be the first to discover upcoming events, 
              cultural experiences, and business opportunities. Get insider access to our 
              Afrocentric community and never miss a moment of celebration.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={benefit.title} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <benefit.icon className="w-4 h-4 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                    <p className="text-gray-400 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-500" />
                <span>10K+ subscribers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-secondary-500" />
                <span>98% satisfaction</span>
              </div>
            </div>
          </div>

          {/* Signup Form */}
          <div className="lg:pl-8">
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700">
              <h3 className="text-2xl font-heading font-bold text-white mb-6 text-center">
                Join Our Newsletter
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-4 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isLoading || !email
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white transform hover:scale-105 hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                By subscribing, you agree to receive marketing emails from Global Kontakt Empire Ltd. 
                You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NewsletterSignup






