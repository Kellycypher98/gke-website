'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, Filter, ArrowRight, Eye } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

// Define the base URL for Supabase Storage
const SUPABASE_URL = 'https://xqnnayhsfnomihkajmqn.supabase.co'

// Define the type for gallery items
interface GalleryItem {
  id: string;
  title: string;
  category: string;
  type: 'image' | 'video';
  image: string;
  description?: string;
  date: string;
  views: number;
  featured: boolean;
  created_at?: string;
}

const GalleryHighlights = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        
        // Check if we have cached data
        const cachedData = sessionStorage.getItem('galleryCache');
        const cacheTimestamp = sessionStorage.getItem('galleryCacheTimestamp');
        const now = new Date().getTime();
        
        // Use cached data if it's less than 5 minutes old
        if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp) < 5 * 60 * 1000)) {
          setGalleryItems(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
        
        // Initialize Supabase client
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Missing Supabase environment variables');
        }
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          {
            auth: { persistSession: false },
            global: { fetch: fetch } // Use native fetch for better performance
          }
        );

        // Only select necessary fields and optimize the query
        const { data: galleryItems, error } = await supabase
          .from('gallery_items')
          .select('id, title, image_path, category, type, featured, created_at, views, description')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Supabase query error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`Database error: ${error.message}`);
        }

        if (!galleryItems || galleryItems.length === 0) {
          console.warn('No gallery items found in the database');
          // Instead of throwing, we'll return an empty array which will be handled by the UI
          setGalleryItems([]);
          return;
        }

        // Transform database items to gallery items format
        const items: GalleryItem[] = galleryItems.map((item, index) => {
          // Construct the full image URL - bucket name is case-sensitive and is 'Gallery'
          const imageUrl = item.image_path?.startsWith('http') 
            ? item.image_path 
            : item.image_path
              ? `${SUPABASE_URL}/storage/v1/object/public/Gallery/${encodeURIComponent(item.image_path)}`
              : '';

          const galleryItem: GalleryItem = {
            id: String(item.id) || '',
            title: String(item.title || 'Untitled'),
            category: String(item.category || 'uncategorized'),
            type: (item.type === 'video' ? 'video' : 'image') as 'image' | 'video',
            image: imageUrl,
            description: item.description ? String(item.description) : '',
            date: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
            views: Number(item.views) || 0,
            featured: Boolean(item.featured)
          };
          return galleryItem;
        });
        
        // Cache the results
        setGalleryItems(items);
        sessionStorage.setItem('galleryCache', JSON.stringify(items));
        sessionStorage.setItem('galleryCacheTimestamp', now.toString());
      } catch (err) {
        console.error('Error fetching images:', err);
        
        // Try to use cached data if available
        const cachedData = sessionStorage.getItem('galleryCache');
        if (cachedData) {
          setGalleryItems(JSON.parse(cachedData));
          return;
        }
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load gallery images';
        if (err instanceof Error) {
          errorMessage = err.message;
          
          if (err.message.includes('Missing Supabase environment variables')) {
            errorMessage = 'Supabase configuration missing - using sample data';
          } else if (err.message.includes('Storage access error')) {
            errorMessage = 'Storage access denied - check RLS policies';
          } else if (err.message.includes('No storage buckets accessible')) {
            errorMessage = 'No storage buckets found - check configuration';
          } else if (err.message.includes('Expected bucket not found')) {
            errorMessage = 'Gallery bucket not found - using sample data';
          } else {
            errorMessage = `Storage error: ${err.message}`;
          }
        }
        
        setError(errorMessage);
    
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate filtered items
  const filteredItems = activeFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeFilter);

  const featuredItems = galleryItems.filter(item => item.featured);

  // Loading state
  if (loading) {
    return (
      <section className="py-16 bg-dark-900">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-2">Gallery Highlights</h2>
              <p className="text-gray-400">Loading gallery items...</p>
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

  // Error state
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

  const ImageWithFallback = ({ src, alt, priority, sizes, className }: { src: string; alt: string; priority: boolean; sizes: string; className: string }) => {
    const [fallbackTried, setFallbackTried] = useState(false);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!fallbackTried) {
        setFallbackTried(true);
        e.currentTarget.src = '/images/placeholder.jpg'; // Ensure this file exists in public/images
      } else {
        console.error('Fallback image also failed to load:', e.currentTarget.src);
      }
    };

    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        unoptimized={true}
        priority={priority}
        onError={handleError}
      />
    );
  };

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
          {filteredItems.slice(0, 6).map((item, index) => (
            <div key={item.id} className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300">
              <div className="relative w-full h-64 overflow-hidden rounded-lg">
                <div className="relative w-full h-full">
                  {!imageErrors[item.id] ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading={index < 4 ? 'eager' : 'lazy'}
                        priority={index < 4}
                        quality={80}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEBgMBpP8fFQAAAABJRU5ErkJggg=="
                        onError={(e) => {
                          console.error('Error loading image:', item.image);
                          setImageErrors(prev => ({ ...prev, [item.id]: true }));
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">Image not available</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(item.date)}</span>
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
        {galleryItems.length > 0 && (
          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="btn-outline text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default GalleryHighlights