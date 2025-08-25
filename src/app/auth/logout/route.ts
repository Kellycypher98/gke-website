import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })

  const supabase = createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options?: any) {
        res.cookies.set({ name, value, ...options })
      },
      remove(name: string, options?: any) {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })

  await supabase.auth.signOut()

  // Optionally redirect to home after logout
  const redirect = req.nextUrl.searchParams.get('redirect')
  if (redirect) {
    return NextResponse.redirect(new URL(redirect, req.url))
  }

  return res
}
