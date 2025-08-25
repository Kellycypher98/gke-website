import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(req: NextRequest) {
  const res = NextResponse.next()

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

  const code = req.nextUrl.searchParams.get('code')
  const redirect = req.nextUrl.searchParams.get('redirect') || '/admin'

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const url = new URL('/login', req.url)
      url.searchParams.set('error', error.message)
      url.searchParams.set('redirect', redirect)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.redirect(new URL(redirect, req.url))
}
