import { NextResponse } from 'next/server';

export async function middleware() {
  // Basic middleware allowing all requests
  return NextResponse.next();
}

export const config = {
  // No specific routes to match
  matcher: [],
};
