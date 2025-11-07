import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // IGNORER les requêtes Vite client
  if (request.nextUrl.pathname === '/@vite/client') {
    return NextResponse.next();
  }
  
  // SOLUTION FORTE : Proxy vers backend SAUF routes NextAuth locales
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/auth/')) {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app';
      
      // Vérifier que l'URL du backend est valide
      if (!backendUrl || backendUrl === '') {
        console.error('❌ Erreur: NEXT_PUBLIC_API_URL non définie');
        return NextResponse.json(
          { error: 'Configuration API manquante', details: 'La variable NEXT_PUBLIC_API_URL n\'est pas définie' },
          { status: 500 }
        );
      }
      
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
    } catch (error) {
      console.error('❌ Erreur middleware proxy:', error);
      return NextResponse.json(
        { 
          error: 'Erreur de connexion au serveur backend', 
          details: error instanceof Error ? error.message : 'Erreur inconnue',
          solution: 'Vérifiez que le serveur backend est accessible'
        },
        { status: 503 }
      );
    }
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
