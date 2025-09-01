import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const publicPaths = ['/admin/login', '/admin/auth/login']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Skip middleware for login pages
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Only process admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

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

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to the login page with the original URL
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
