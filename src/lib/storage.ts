import { getSupabaseClient } from './supabaseClient';

export function getImageUrl(bucket: string, path: string): string {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function listFiles(bucket: string, folder: string = '') {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder);
    
  if (error) {
    console.error('Error listing files:', error);
    throw error;
  }
  
  return data;
}
