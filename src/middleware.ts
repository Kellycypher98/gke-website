import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware-client'
import { UserRole } from '@/lib/supabase/types'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createClient()

  try {
    // Get the user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }
    
    // If no session and trying to access protected route, redirect to admin login
    if (!session && request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
      const redirectUrl = new URL('/admin/login', request.url)
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // If user is not an admin and trying to access admin routes, redirect to home
    if (session && request.nextUrl.pathname.startsWith('/admin')) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
        
      if (userError || !userData || userData.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, redirect to home
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
