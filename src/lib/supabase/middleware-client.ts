import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieOptions = {
  name: string
  value: string
  path?: string
  domain?: string
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none' | boolean
}

export function createClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Anon Key')
  }

  const cookieOptions = {
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(name: string, value: string, options: CookieOptions) {
      try {
        cookieStore.set({
          name,
          value,
          ...options,
          sameSite: options.sameSite as 'lax' | 'strict' | 'none' | undefined,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        } as any)
      } catch (error) {
        console.error('Error setting cookie:', error)
      }
    },
    remove(name: string, options: Omit<CookieOptions, 'name' | 'value'>) {
      try {
        cookieStore.set({
          name,
          value: '',
          ...options,
          maxAge: 0,
          sameSite: options.sameSite as 'lax' | 'strict' | 'none' | undefined,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
        } as any)
      } catch (error) {
        console.error('Error removing cookie:', error)
      }
    },
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (key: string) => {
        return cookieOptions.get(key)
      },
      set: (key: string, value: string, options: any) => {
        return cookieOptions.set(key, value, options)
      },
      remove: (key: string, options: any) => {
        return cookieOptions.remove(key, options)
      },
    },
  })
}
