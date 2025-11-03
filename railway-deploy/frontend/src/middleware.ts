import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Rediriger tous les appels API vers le backend
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, backendUrl);
    
    // Copier les headers importants
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!['host', 'connection', 'accept-encoding'].includes(key)) {
        headers.set(key, value);
      }
    });
    
    return NextResponse.rewrite(url, {
      headers,
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};
