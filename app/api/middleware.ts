import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs before all API routes to ensure cookies are properly handled
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Ensure cookies can be accessed and set in API routes
  response.headers.append('x-middleware-cache', 'no-cache');
  
  return response;
}

// Only run this middleware on API routes
export const config = {
  matcher: '/api/:path*',
}; 