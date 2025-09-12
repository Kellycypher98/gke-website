import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  // For server-side operations that don't need auth
  if (!cookieStore) {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
      auth: { persistSession: false }
    })
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore.get(name))?.value
        },
        async set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting in middleware
          }
        },
        async remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          } catch (error) {
            // Handle cookie removal in middleware
          }
        },
      },
    }
  )
}