import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

type SupabaseClient = ReturnType<typeof createSupabaseServerClient<Database>>

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
        set() {},
        remove() {}
      },
    }
  )
}

export const supabaseServer = createServerSupabaseClient()
