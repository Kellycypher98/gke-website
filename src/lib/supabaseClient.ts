import { createBrowserClient } from '@supabase/ssr'

let cached: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (cached) return cached
  // Only attempt to create in the browser
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient must be called in the browser')
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('@supabase/ssr: Your project\'s URL and API key are required to create a Supabase client!')
  }
  cached = createBrowserClient(url, anon)
  return cached
}

export default getSupabaseClient
