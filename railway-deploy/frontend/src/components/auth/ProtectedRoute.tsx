// Composant de protection des routes
"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  module: string;
  action?: 'read' | 'write' | 'configure' | 'admin';
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  module, 
  action = 'read',
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { canAccess, getAccessMessage } = usePermissions();

  useEffect(() => {
    if (!canAccess(module, action)) {
      // Rediriger vers page non autorisée
      router.push('/unauthorized');
    }
  }, [module, action, canAccess, router]);

  if (!canAccess(module, action)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-4">{getAccessMessage(module)}</p>
          <button 
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
