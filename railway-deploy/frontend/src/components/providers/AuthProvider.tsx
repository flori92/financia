"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { authManager, type AuthState, type AuthUser } from '@/lib/auth-manager';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = React.useState<AuthState>({
    isAuthenticated: false,
    user: null,
    tokens: null,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // S'abonner aux changements d'état
    const unsubscribe = authManager.subscribe((state) => {
      setAuthState({ ...state });
    });

    // Nettoyage
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    await authManager.login(email, password);
  };

  const logout = async (): Promise<void> => {
    await authManager.logout();
  };

  const refreshUser = async (): Promise<void> => {
    // Implémenter si nécessaire pour rafraîchir les données utilisateur
    const currentUser = authManager.getCurrentUser();
    if (currentUser) {
      // Optionnel: recharger les données fraîches depuis le backend
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook utilitaires
export function useCurrentUser(): AuthUser | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}

export function useAuthError(): string | null {
  const { error } = useAuth();
  return error;
}

// Hook de permissions
export function usePermissions() {
  const { user } = useAuth();
  
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role || user.profiles?.includes(role);
  };

  const hasProfile = (profile: string): boolean => {
    if (!user) return false;
    return user.primaryProfile === profile || user.profiles?.includes(profile);
  };

  const canAccess = (resource: string): boolean => {
    if (!user) return false;
    
    // Logique de permissions basique
    const permissions = {
      admin: ['*'],
      accountant: ['accounting', 'reports', 'treasury'],
      entrepreneur: ['dashboard', 'invoices', 'contacts']
    };

    const userPermissions = permissions[user.role as keyof typeof permissions] || [];
    return userPermissions.includes('*') || userPermissions.includes(resource);
  };

  return {
    hasRole,
    hasProfile,
    canAccess,
    user
  };
}

export default AuthProvider;
