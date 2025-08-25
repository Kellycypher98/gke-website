import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase (for admin UI interactions if needed)
// Uses public anon key; RLS should protect data appropriately if you ever expose tables directly.
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default supabaseClient
