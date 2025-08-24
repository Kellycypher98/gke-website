import { cookies, headers } from 'next/headers'
import { createRouteHandlerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './types/supabase'

// Server-side Supabase for Route Handlers (app/api/*)
export const supabaseRoute = () => {
  return createRouteHandlerClient<Database>({
    cookies,
    headers,
  })
}

// Server-side Supabase for Server Components (app/* server components)
export const supabaseServer = () => {
  return createServerComponentClient<Database>({
    cookies,
    headers,
  })
}

export default supabaseServer
