/**
 * Wrapper de page sécurisée avec AuthGuard et ErrorBoundary
 * Utilisé pour protéger toutes les pages sensibles
 */

import * as React from 'react';
import { AuthGuard } from './auth/AuthGuard';
import ErrorBoundary from './auth/ErrorBoundary';
import { Loader2 } from 'lucide-react';

interface SecurePageProps {
  children: React.ReactNode;
}

/**
 * Composant de loading par défaut
 */
function DefaultLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <p className="text-gray-600 text-lg">Chargement sécurisé...</p>
    </div>
  );
}

/**
 * Page sécurisée avec protection d'authentification et gestion d'erreurs
 * 
 * @example
 * ```tsx
 * export default function AccountantPage() {
 *   return (
 *     <SecurePage requiredProfile="accountant">
 *       <DashboardContent />
 *     </SecurePage>
 *   );
 * }
 * ```
 */
export function SecurePage({ 
  children
}: SecurePageProps) {
  return (
    <ErrorBoundary>
      <AuthGuard>
        {children}
      </AuthGuard>
    </ErrorBoundary>
  );
}

/**
 * Wrapper pour les pages publiques (sans authentification requise)
 * Garde la gestion d'erreurs mais pas l'AuthGuard
 */
export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

/**
 * HOC pour créer une page sécurisée
 * 
 * @example
 * ```tsx
 * const AccountantPage = withSecurePage(
 *   () => <DashboardContent />,
 *   { requiredProfile: 'accountant' }
 * );
 * ```
 */
export function withSecurePage<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<SecurePageProps, 'children'>
) {
  return function SecurePageWrapper(props: P) {
    return (
      <SecurePage {...options}>
        <Component {...props} />
      </SecurePage>
    );
  };
}

export default SecurePage;
