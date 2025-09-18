'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, Filter, ArrowRight, Eye } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

// Define the type for gallery items
interface GalleryItem {
  id: number | string;
  title: string;
  category: string;
  type: 'image' | 'video';
  image: string;
  thumbnail: string;
  description: string;
  date: string;
  views: number;
  featured: boolean;
}

// Sample data that will be used if Supabase fetch fails
const sampleGalleryItems: GalleryItem[] = [
  {
    id: 'sample-1',
    title: 'Sample Event 1',
    category: 'events',
    type: 'image',
    image: 'https://images.unsplash.com/photo-1516450360452-9311f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9311f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    description: 'Sample event description',
    date: '2023-01-01',
    views: 0,
    featured: true,
  },
];

const GalleryHighlights = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add more sample items to the existing sampleGalleryItems array
  const extendedSampleItems: GalleryItem[] = [
    ...sampleGalleryItems,
    {
      id: 3,
      title: 'Dance Performance',
      category: 'afro-splash',
      type: 'video',
      image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1501612780327-45045538702b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      description: 'Stunning traditional African dance performances that captivated the audience.',
      date: '2023-09-15',
      views: 2100,
      featured: true,
    },
    {
      id: 4,
      title: 'Business Networking Mixer',
      category: 'kente-banquet',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      description: 'Successful networking event connecting African business leaders and entrepreneurs.',
      date: '2023-08-30',
      views: 445,
      featured: false,
    },
    {
      id: 5,
      title: 'Investment Forum Panel',
      category: 'gbu-uk',
      type: 'video',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      description: 'Expert panel discussion on investment opportunities in African markets.',
      date: '2023-07-22',
      views: 678,
      featured: false,
    },
    {
      id: 6,
      title: 'Live Music Performance',
      category: 'afro-splash',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      description: 'Incredible live music performances featuring Afro-Caribbean artists.',
      date: '2023-06-18',
      views: 1560,
      featured: true,
    },
    {
      id: 7,
      title: 'Cultural Fashion Show',
      category: 'kente-banquet',
      type: 'image',
      image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80',
      description: 'Stunning showcase of traditional and modern African fashion designs.',
      date: '2023-05-12',
      views: 890,
      featured: false,
    },
  ];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        
        // Initialize Supabase client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        
        // List all files in the 'gallery' bucket
        const { data: files, error } = await supabase
          .storage
          .from('gallery')
          .list('', { 
            limit: 100, 
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' }
          });
        
        if (error) throw error;
        
        if (!files || files.length === 0) {
          console.log('No files found in the gallery bucket');
          throw new Error('No images found in the gallery');
        }
        
        console.log('Files in bucket:', files); // Debug log
        
        // Filter for image files
        const imageFiles = files.filter((file: { name: string }) => {
          const ext = file.name.split('.').pop()?.toLowerCase();
          const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '');
          console.log(`File: ${file.name}, isImage: ${isImage}`); // Debug log
          return isImage;
        });
        
        if (imageFiles.length === 0) {
          console.log('No image files found after filtering');
          throw new Error('No valid image files found');
        }
        
        // Transform to gallery items
        const items: GalleryItem[] = await Promise.all(imageFiles.map(async (file: { name: string; created_at: string }, index: number) => {
          // Get public URL for the image
          const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(file.name);
            
          console.log(`Generated URL for ${file.name}:`, publicUrl); // Debug log
            
          // Create a test image to check if it loads
          const imageUrl = await new Promise<string>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve(publicUrl);
            img.onerror = () => {
              console.error(`Failed to load image: ${file.name}`);
              // Fallback to a placeholder if image fails to load
              resolve('https://placehold.co/600x400?text=Image+Not+Found');
            };
            img.src = publicUrl;
          });
            
          return {
            id: `img-${index}`,
            title: file.name.split('.')[0].replace(/[-_]/g, ' '),
            category: 'gallery',
            type: 'image',
            image: imageUrl,
            thumbnail: imageUrl, // Using same image for thumbnail for simplicity
            description: `Image from ${new Date(file.created_at).toLocaleDateString()}`,
            date: new Date(file.created_at).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 1000),
            featured: index < 3 // First 3 images are featured
          };
        });
        
        setGalleryItems(items);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Using sample gallery data');
        setGalleryItems(sampleGalleryItems);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-dark-900">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">Gallery Highlights</h2>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">Loading...</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-dark-900">
        <div className="container-custom">
          <div className="text-center py-12">
            <div className="bg-yellow-900/20 border border-yellow-900/50 text-yellow-300 px-6 py-4 rounded-lg inline-flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const filters = [
    { key: 'all', label: 'All Media', count: galleryItems.length },
    { key: 'afro-splash', label: 'Afro Splash', count: galleryItems.filter(item => item.category === 'afro-splash').length },
    { key: 'kente-banquet', label: 'Kente Banquet', count: galleryItems.filter(item => item.category === 'kente-banquet').length },
    { key: 'gbu-uk', label: 'GBU-UK', count: galleryItems.filter(item => item.category === 'gbu-uk').length },
  ]

  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  const featuredItems = galleryItems.filter(item => item.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <section className="py-16 bg-dark-900">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-2">Gallery Highlights</h2>
            <p className="text-gray-400">Experience our latest events and moments</p>
          </div>
          <Link 
            href="/gallery" 
            className="inline-flex items-center text-primary-400 hover:text-primary-300 mt-4 md:mt-0"
          >
            View Full Gallery <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.slice(0, 6).map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden relative">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                    {item.category.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-1" /> {item.views.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{item.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  {item.type === 'video' && (
                    <span className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg> Watch
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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






