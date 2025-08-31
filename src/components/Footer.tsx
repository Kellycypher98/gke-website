'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Brands', href: '/brands' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    events: [
      { name: 'Upcoming Events', href: '/events' },
      { name: 'Past Events', href: '/events/past' },
      { name: 'Event Gallery', href: '/gallery' },
      { name: 'Book Event', href: '/events/book' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    brands: [
      { name: 'Afro Splash Night', href: '/brands/afro-splash' },
      { name: 'Kente Banquet', href: '/brands/kente-banquet' },
      { name: 'GBU-UK', href: '/brands/gbu-uk' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
  ]

  return (
    <footer className="bg-dark-800 border-t border-dark-700">
      {/* Main Footer Content */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-secondary-500 to-royal-500 rounded-lg flex items-center justify-center">
                <span className="text-dark-900 font-bold text-2xl">GKE</span>
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-white">Global Kontakt Empire</h3>
                <p className="text-sm text-gray-400">Ltd</p>
              </div>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Experience Culture. Empower Business. Celebrate Life. We are the premier Afrocentric event hosting 
              and business empowerment brand, creating unforgettable cultural experiences and fostering business growth.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-dark-700 hover:bg-primary-500 rounded-lg flex items-center justify-center text-gray-400 hover:text-dark-900 transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-white mb-4">Events</h4>
            <ul className="space-y-3">
              {footerLinks.events.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-dark-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="text-primary-500" size={20} />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <a href="mailto:info@globalkontaktempire.com" className="text-white hover:text-primary-500 transition-colors">
                  info@globalkontaktempire.com
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="text-primary-500" size={20} />
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <a href="tel:+44123456789" className="text-white hover:text-primary-500 transition-colors">
                  +44 123 456 789
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="text-primary-500" size={20} />
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white">London, United Kingdom</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-dark-900 border-t border-dark-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-500">
                &copy; {currentYear} Global Kontakt Empire Ltd. All rights reserved.
              </p>
              <Link 
                href="/admin" 
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors duration-300"
              >
                Admin Access
              </Link>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-primary-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary-500 transition-colors">
                Terms of Service
              </Link>
              <span className="flex items-center">
                Made with <Heart className="w-4 h-4 mx-1 text-accent-500" /> in London
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer



