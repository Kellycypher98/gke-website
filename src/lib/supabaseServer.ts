import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from './types/supabase'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side Supabase for Route Handlers (app/api/*)
export const supabaseRoute = () => {
  const cookieStore = cookies() as any
  return createServerClient<Database>(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options?: any) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })
}

// Server-side Supabase for Server Components (app/* server components)
export const supabaseServer = () => {
  const cookieStore = cookies() as any
  return createServerClient<Database>(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options?: any) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })
}

export default supabaseServer
