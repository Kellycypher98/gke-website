'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Calendar, Users, BookOpen, Image as ImageIcon, Phone } from 'lucide-react'
import Image from 'next/image'
import logo from '../../public/images/logo.png';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Home', href: '/', icon: null },
    { name: 'About', href: '/about', icon: Users },
    { name: 'Our Brands', href: '/brands', icon: BookOpen },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Gallery', href: '/gallery', icon: ImageIcon },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Contact', href: '/contact', icon: Phone },
  ]

  return (
    <nav className={`fixed  top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-dark-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="container-custom mx-5\\">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center overflow-hidden">
              <Image src={logo} alt="logo" width={60} height={60} className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-heading font-bold text-white group-hover:text-primary-500 transition-colors">
                Global Kontakt Empire
              </h1>
              <p className="text-xs text-gray-400">Ltd</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-primary-500 font-medium transition-colors duration-300 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link href="/events" className="btn-primary">
              Buy Tickets
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-primary-500 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-dark-800/95 backdrop-blur-md border-t border-dark-700">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-primary-500 font-medium transition-colors duration-300 py-2"
                >
                  {item.icon && <item.icon size={20} />}
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-dark-700">
                <Link
                  href="/events"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full text-center block"
                >
                  Buy Tickets
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation



