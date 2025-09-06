import { NextRequest, NextResponse } from 'next/server'

export async function middleware() {
  // Allow all access without authentication
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
