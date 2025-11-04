/**
 * Composant wrapper simple pour protéger les pages
 * Usage: <ProtectedPage><YourPageContent /></ProtectedPage>
 */

"use client";
import { AuthGuard } from './AuthGuard';
import ErrorBoundary from '../error/ErrorBoundary';

interface ProtectedPageProps {
  children: React.ReactNode;
}

export function ProtectedPage({ children }: ProtectedPageProps) {
  return (
    <ErrorBoundary>
      <AuthGuard>
        {children}
      </AuthGuard>
    </ErrorBoundary>
  );
}
