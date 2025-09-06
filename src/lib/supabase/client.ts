import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>

// Create a single supabase client for client-side interactions
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return null
        const cookie = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${name}=`))
        return cookie ? cookie.split('=')[1] : null
      },
      set(name: string, value: string, options: { [key: string]: any }) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=${value}; ${Object.entries(options)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ')}`
      },
      remove(name: string, options: { [key: string]: any }) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${Object.entries(options)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ')}`
      },
    },
  })
}

export const supabase = createClient()
