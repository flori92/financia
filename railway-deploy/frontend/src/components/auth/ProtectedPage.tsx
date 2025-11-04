/**
 * Composant wrapper simple pour protéger les pages
 * Usage: <ProtectedPage><YourPageContent /></ProtectedPage>
 */

"use client";
import { AuthGuard } from './AuthGuard';
import ErrorBoundary from '../error/ErrorBoundary';

interface ProtectedPageProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedPage({ children, requiredRole }: ProtectedPageProps) {
  return (
    <ErrorBoundary>
      <AuthGuard requiredRole={requiredRole}>
        {children}
      </AuthGuard>
    </ErrorBoundary>
  );
}
