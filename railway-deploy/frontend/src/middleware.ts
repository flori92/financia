import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // SOLUTION FORTE : Proxy vers backend SAUF routes NextAuth locales
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
    
    // Construire l'URL complète vers le backend
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, backendUrl);
    
    // Copier TOUS les headers sauf ceux qui causent des problèmes
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      // Exclure les headers qui doivent être recalculés
      if (!['host', 'connection', 'accept-encoding', 'content-length'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });
    
    // Ajouter des headers de debug
    headers.set('x-forwarded-host', request.nextUrl.host);
    headers.set('x-forwarded-proto', request.nextUrl.protocol);
    headers.set('x-real-ip', request.ip || 'unknown');
    
    // Log de debug
    console.log(`🔄 API Proxy: ${request.method} ${request.nextUrl.pathname} → ${url.toString()}`);
    
    // Utiliser NextResponse.rewrite pour garder le domaine frontend
    return NextResponse.rewrite(url, {
      headers
    });
  }
  
  return NextResponse.next();
}

export const config = {
  // Matcher routes API SAUF NextAuth
  matcher: [
    '/api/((?!auth).*)',
    '/api/v1/:path*'
  ],
};
