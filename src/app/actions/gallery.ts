'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface DatabaseGalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  category: string;
  type: 'image' | 'video';
  image_url: string;
  thumbnail_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string | null;
  [key: string]: any; // Add index signature to handle dynamic properties
}

export type GalleryItem = Omit<DatabaseGalleryItem, 'image_url' | 'thumbnail_url'> & {
  image: string;
  thumbnail?: string | null;
  date: string;
  description?: string | null;
  updated_at?: string | null;
};

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const supabase = await createServerSupabaseClient();
  
  try {
    const { data: galleryItems, error } = await supabase
      .from('gallery_items')
      .select('id, title, image_url, thumbnail_url, category, type, featured, created_at, description')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery items:', error);
      throw error;
    }

    // Transform the data to match our GalleryItem type
    const items: GalleryItem[] = (galleryItems || []).map((item: any) => {
      // Add cache-busting parameter to prevent stale images
      const timestamp = new Date().getTime();
      const imageUrl = item.image_url 
        ? `${item.image_url}${item.image_url.includes('?') ? '&' : '?'}_t=${timestamp}`
        : '';
      
      const thumbnailUrl = item.thumbnail_url
        ? `${item.thumbnail_url}${item.thumbnail_url.includes('?') ? '&' : '?'}_t=${timestamp}`
        : undefined;

      // Create a new object with the correct shape for GalleryItem
      const galleryItem: GalleryItem = {
        id: item.id,
        title: item.title || 'Untitled',
        description: item.description || undefined,
        category: item.category,
        type: item.type,
        image: imageUrl,
        thumbnail: thumbnailUrl,
        featured: item.featured,
        created_at: item.created_at,
        updated_at: item.updated_at || undefined,
        date: item.created_at
      };
      
      return galleryItem;
    });

    return items;
  } catch (error) {
    console.error('Error in getGalleryItems:', error);
    return [];
  }
}
