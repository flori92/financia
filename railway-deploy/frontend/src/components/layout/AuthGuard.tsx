"use client";

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useIsAuthenticated } from '@/components/providers/AuthProvider';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  roles?: string[];
  profiles?: string[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  roles = [],
  profiles = [],
  redirectTo = '/login',
  fallback
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Si le chargement est terminé
    if (!isLoading) {
      // Si l'authentification est requise mais que l'utilisateur n'est pas connecté
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Si des rôles spécifiques sont requis
      if (requireAuth && isAuthenticated && roles.length > 0 && user) {
        const hasRequiredRole = roles.includes(user.role) || 
                               roles.some(role => user.profiles?.includes(role));
        
        if (!hasRequiredRole) {
          router.push('/unauthorized');
          return;
        }
      }

      // Si des profils spécifiques sont requis
      if (requireAuth && isAuthenticated && profiles.length > 0 && user) {
        const hasRequiredProfile = profiles.includes(user.primaryProfile) || 
                                  profiles.some(profile => user.profiles?.includes(profile));
        
        if (!hasRequiredProfile) {
          router.push('/unauthorized');
          return;
        }
      }
    }
  }, [isLoading, isAuthenticated, user, roles, profiles, redirectTo, router]);

  // Pendant le chargement
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié et que l'auth est requise
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Redirection vers la page de connexion...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  // Si les rôles/profils ne correspondent pas
  if (requireAuth && isAuthenticated && user) {
    if (roles.length > 0) {
      const hasRequiredRole = roles.includes(user.role) || 
                             roles.some(role => user.profiles?.includes(role));
      if (!hasRequiredRole) {
        return fallback || (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <p className="text-slate-600">Accès non autorisé</p>
            </div>
          </div>
        );
      }
    }

    if (profiles.length > 0) {
      const hasRequiredProfile = profiles.includes(user.primaryProfile) || 
                                profiles.some(profile => user.profiles?.includes(profile));
      if (!hasRequiredProfile) {
        return fallback || (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <p className="text-slate-600">Accès non autorisé</p>
            </div>
          </div>
        );
      }
    }
  }

  // Tout est OK, afficher les enfants
  return <>{children}</>;
}

// Guards spécialisés
export function EntrepreneurGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard 
      requireAuth={true} 
      roles={['entrepreneur']} 
      profiles={['entrepreneur']}
    >
      {children}
    </AuthGuard>
  );
}

export function AccountantGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard 
      requireAuth={true} 
      roles={['accountant']} 
      profiles={['accountant']}
    >
      {children}
    </AuthGuard>
  );
}

export function AdminGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard 
      requireAuth={true} 
      roles={['admin']} 
      profiles={['admin']}
    >
      {children}
    </AuthGuard>
  );
}

export function AnyAuthGuard({ children }: { children: ReactNode }) {
  return (
    <AuthGuard 
      requireAuth={true}
      roles={['entrepreneur', 'accountant', 'admin']}
    >
      {children}
    </AuthGuard>
  );
}

export default AuthGuard;
