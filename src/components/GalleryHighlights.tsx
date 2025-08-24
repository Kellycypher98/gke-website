'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Image, Video, Filter, ArrowRight, Play, Eye } from 'lucide-react'

const GalleryHighlights = () => {
  const [activeFilter, setActiveFilter] = useState('all')

  const galleryItems = [
    {
      id: 1,
      title: 'Afro Splash Night 2023',
      category: 'afro-splash',
      type: 'image',
      image: '/images/gallery/afro-splash-1.jpg',
      thumbnail: '/images/gallery/afro-splash-1-thumb.jpg',
      description: 'Vibrant celebration of Afro-Caribbean culture with live performances and dancing.',
      date: '2023-12-15',
      views: 1240,
      featured: true,
    },
    {
      id: 2,
      title: 'Kente Banquet Awards Ceremony',
      category: 'kente-banquet',
      type: 'video',
      image: '/images/gallery/kente-awards.jpg',
      thumbnail: '/images/gallery/kente-awards-thumb.jpg',
      description: 'Elegant awards ceremony celebrating African business excellence and cultural heritage.',
      date: '2023-11-20',
      views: 890,
      featured: true,
    },
    {
      id: 3,
      title: 'GBU-UK Business Workshop',
      category: 'gbu-uk',
      type: 'image',
      image: '/images/gallery/gbu-workshop.jpg',
      thumbnail: '/images/gallery/gbu-workshop-thumb.jpg',
      description: 'Interactive business workshop empowering African entrepreneurs with practical skills.',
      date: '2023-10-28',
      views: 567,
      featured: false,
    },
    {
      id: 4,
      title: 'Cultural Dance Performance',
      category: 'afro-splash',
      type: 'video',
      image: '/images/gallery/dance-performance.jpg',
      thumbnail: '/images/gallery/dance-performance-thumb.jpg',
      description: 'Stunning traditional African dance performances that captivated the audience.',
      date: '2023-09-15',
      views: 2100,
      featured: true,
    },
    {
      id: 5,
      title: 'Business Networking Mixer',
      category: 'kente-banquet',
      type: 'image',
      image: '/images/gallery/networking-mixer.jpg',
      thumbnail: '/images/gallery/networking-mixer-thumb.jpg',
      description: 'Successful networking event connecting African business leaders and entrepreneurs.',
      date: '2023-08-30',
      views: 445,
      featured: false,
    },
    {
      id: 6,
      title: 'Investment Forum Panel',
      category: 'gbu-uk',
      type: 'video',
      image: '/images/gallery/investment-forum.jpg',
      thumbnail: '/images/gallery/investment-forum-thumb.jpg',
      description: 'Expert panel discussion on investment opportunities in African markets.',
      date: '2023-07-22',
      views: 678,
      featured: false,
    },
    {
      id: 7,
      title: 'Live Music Performance',
      category: 'afro-splash',
      type: 'image',
      image: '/images/gallery/live-music.jpg',
      thumbnail: '/images/gallery/live-music-thumb.jpg',
      description: 'Incredible live music performances featuring Afro-Caribbean artists.',
      date: '2023-06-18',
      views: 1560,
      featured: true,
    },
    {
      id: 8,
      title: 'Cultural Fashion Show',
      category: 'kente-banquet',
      type: 'image',
      image: '/images/gallery/fashion-show.jpg',
      thumbnail: '/images/gallery/fashion-show-thumb.jpg',
      description: 'Stunning showcase of traditional and modern African fashion designs.',
      date: '2023-05-12',
      views: 890,
      featured: false,
    },
  ]

  const filters = [
    { key: 'all', label: 'All Media', count: galleryItems.length },
    { key: 'afro-splash', label: 'Afro Splash', count: galleryItems.filter(item => item.category === 'afro-splash').length },
    { key: 'kente-banquet', label: 'Kente Banquet', count: galleryItems.filter(item => item.category === 'kente-banquet').length },
    { key: 'gbu-uk', label: 'GBU-UK', count: galleryItems.filter(item => item.category === 'gbu-uk').length },
  ]

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <section className="section-padding bg-dark-900">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Gallery Highlights
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Relive the magic of our past events through stunning photos and videos. 
            Filter by event type to discover the cultural richness and business impact we create.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeFilter === filter.key
                  ? 'bg-primary-500 text-dark-900 shadow-lg'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              <span className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>{filter.label}</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {filter.count}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 transition-all duration-500 transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image/Video */}
              <div className="relative aspect-square overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${item.thumbnail})`,
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Media Type Indicator */}
                <div className="absolute top-3 left-3">
                  {item.type === 'video' ? (
                    <div className="w-10 h-10 bg-accent-500/90 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-primary-500/90 rounded-full flex items-center justify-center">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute top-3 right-3 bg-secondary-500 text-dark-900 px-2 py-1 rounded-full text-xs font-semibold">
                    Featured
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex space-x-4">
                    <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    {item.type === 'video' && (
                      <button className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-white hover:bg-accent-600 transition-colors">
                        <Play className="w-5 h-5 ml-1" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Item Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="bg-dark-900/90 backdrop-blur-sm rounded-lg p-3">
                    <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDate(item.date)}</span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{item.views.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Gallery CTA */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="btn-outline text-lg px-8 py-4 inline-flex items-center space-x-2"
          >
            <span>View Full Gallery</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default GalleryHighlights






