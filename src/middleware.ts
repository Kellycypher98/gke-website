import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )

  // Skip middleware for auth routes and static files
  if (
    request.nextUrl.pathname.startsWith('/admin/login') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return response
  }

  // Get the session
  const { data: { session } } = await supabase.auth.getSession()

  // If no session and trying to access admin route, redirect to login
  if (!session && request.nextUrl.pathname.startsWith('/admin')) {
    const redirectUrl = new URL('/admin/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access login page, redirect to admin
  if (session && request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Check if user is admin for admin routes
  if (session && request.nextUrl.pathname.startsWith('/admin')) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (user?.role !== 'ADMIN') {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
