// Hook d'authentification pour BMS
import { useState, useEffect } from 'react';

export type UserRole = 'expert-comptable' | 'entrepreneur' | 'bank' | 'fiscal';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler la vérification d'authentification
    // En production, ceci viendrait de votre système d'auth (NextAuth, etc.)
    const checkAuth = () => {
      // Pour le développement, nous utilisons un utilisateur mock
      const mockUser: User = {
        id: '1',
        name: 'Utilisateur Test',
        email: 'test@bms.com',
        role: 'entrepreneur', // Peut être changé pour tester
        companyId: 'company-1'
      };
      
      setUser(mockUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock login - en production, appeler votre API
      const mockUser: User = {
        id: '1',
        name: email.split('@')[0],
        email,
        role: 'entrepreneur',
        companyId: 'company-1'
      };
      
      setUser(mockUser);
      return { success: true, user: mockUser };
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  return {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated
  };
};
