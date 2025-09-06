import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

type SupabaseClient = ReturnType<typeof createSupabaseServerClient<Database>>

type CookieOptions = {
  name: string
  value: string
  httpOnly?: boolean
  path?: string
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
}

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Omit<CookieOptions, 'name' | 'value'>) {
          try {
            cookieStore.set({ name, value, ...options } as any)
          } catch (error) {
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: Omit<CookieOptions, 'name' | 'value'>) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 } as any)
          } catch (error) {
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )
}

export const supabaseServer = createServerSupabaseClient()
