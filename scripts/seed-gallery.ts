import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Sample gallery items data - replace with your actual images
const galleryItems = [
  {
    title: 'Global Kontakt',
    description: 'Community celebration event',
    category: 'gallery',
    type: 'image',
    image_url: 'https://xqnnayhsfnomihkajmqn.supabase.co/storage/v1/object/public/gallery/NAS_2402-Edit.JPG',
    thumbnail_url: 'https://xqnnayhsfnomihkajmqn.supabase.co/storage/v1/object/public/thumbnails/NAS_2402-Edit_thumb.jpg',
    featured: false
  },
  // Add more items here following the same structure
  // {
  //   title: 'Another Event',
  //   description: 'Event description',
  //   category: 'gallery',
  //   type: 'image',
  //   image_url: 'https://xqnnayhsfnomihkajmqn.supabase.co/storage/v1/object/public/gallery/filename.jpg',
  //   thumbnail_url: 'https://xqnnayhsfnomihkajmqn.supabase.co/storage/v1/object/public/thumbnails/filename_thumb.jpg',
  //   featured: true
  // }
];

async function seedGallery() {
  try {
    console.log('Starting gallery seeding...');
    
    // First, check if any items already exist
    const { data: existingItems } = await supabase
      .from('gallery_items')
      .select('image_url')
      .in('image_url', galleryItems.map(item => item.image_url));

    const existingUrls = new Set(existingItems?.map(item => item.image_url) || []);
    
    // Filter out items that already exist
    const newItems = galleryItems.filter(item => !existingUrls.has(item.image_url));

    if (newItems.length === 0) {
      console.log('All items already exist in the database.');
      return;
    }

    console.log(`Found ${newItems.length} new items to insert.`);
    
    // Insert new items
    const { data, error } = await supabase
      .from('gallery_items')
      .insert(newItems)
      .select();

    if (error) {
      console.error('Error inserting gallery items:', error);
      return;
    }

    console.log(`Successfully inserted ${data?.length || 0} gallery items.`);
    console.log('Seeding completed successfully!');
    
  } catch (error) {
    console.error('Error during gallery seeding:', error);
  }
}

// Run the seed function
seedGallery();
