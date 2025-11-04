/**
 * Gestionnaire d'authentification professionnel
 * Résout les problèmes 401 et standardise le flux auth
 */

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  companyId: string;
  profiles: string[];
  primaryProfile: string;
  uxLevel?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
}

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    tokens: null,
    isLoading: false,
    error: null
  };
  private listeners: ((state: AuthState) => void)[] = [];
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeFromStorage();
    this.setupAutoRefresh();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private initializeFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem('bms_access_token');
      const userStr = localStorage.getItem('bms_user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.state = {
          ...this.state,
          isAuthenticated: true,
          user,
          tokens: { access_token: token, accessToken: token, refresh_token: token, refreshToken: token }
        };
      }
    } catch (error) {
      console.warn('Erreur initialisation auth:', error);
      this.clearStorage();
    }
  }

  private setupAutoRefresh() {
    // Rafraîchir le token 5 minutes avant expiration
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    
    this.refreshTimer = setInterval(() => {
      if (this.state.isAuthenticated && this.state.tokens?.access_token) {
        this.refreshTokenIfNeeded();
      }
    }, 4 * 60 * 1000); // 4 minutes
  }

  private async refreshTokenIfNeeded() {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app'}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.state.tokens?.refresh_token
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.updateTokens(data);
      } else {
        await this.logout();
      }
    } catch (error) {
      console.warn('Erreur refresh token:', error);
      await this.logout();
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.setState({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://bms-production-d9e9.up.railway.app'}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Identifiants invalides');
      }

      // Valider la structure des tokens
      const tokens: AuthTokens = {
        access_token: data.access_token || data.accessToken,
        refresh_token: data.refresh_token || data.refreshToken,
        accessToken: data.accessToken || data.access_token,
        refreshToken: data.refreshToken || data.refresh_token
      };

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Réponse serveur invalide');
      }

      this.updateTokens(tokens);
      this.setUser(data.user);
      
      // Redirection intelligente selon le profil
      const redirectUrl = this.getRedirectUrl(data.user);
      window.location.href = redirectUrl;
      
    } catch (error) {
      this.setState({ 
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        isLoading: false 
      });
      throw error;
    }
  }

  private updateTokens(tokens: AuthTokens) {
    this.state.tokens = tokens;
    this.state.isAuthenticated = true;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('bms_access_token', tokens.access_token);
      localStorage.setItem('bms_refresh_token', tokens.refresh_token);
    }
    
    this.notifyListeners();
  }

  private setUser(user: AuthUser) {
    this.state.user = user;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('bms_user', JSON.stringify(user));
      localStorage.setItem('user_role', user.role);
    }
    
    this.notifyListeners();
  }

  private getRedirectUrl(user: AuthUser): string {
    const role = user.role?.toLowerCase();
    const primaryProfile = user.primaryProfile?.toLowerCase();
    
    // Redirection selon le profil principal
    if (primaryProfile === 'accountant' || role === 'accountant') {
      return '/accountant';
    }
    if (primaryProfile === 'admin' || role === 'admin') {
      return '/admin';
    }
    return '/dashboard';
  }

  async logout(): Promise<void> {
    this.clearStorage();
    this.state = {
      isAuthenticated: false,
      user: null,
      tokens: null,
      isLoading: false,
      error: null
    };
    
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    this.notifyListeners();
    window.location.href = '/login';
  }

  private clearStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bms_access_token');
      localStorage.removeItem('bms_refresh_token');
      localStorage.removeItem('bms_user');
      localStorage.removeItem('user_role');
      localStorage.removeItem('bms_token'); // Ancien format
      localStorage.removeItem('user_data'); // Ancien format
    }
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.state.tokens?.access_token) {
      headers['Authorization'] = `Bearer ${this.state.tokens.access_token}`;
    }

    return headers;
  }

  getCurrentUser(): AuthUser | null {
    return this.state.user;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  getError(): string | null {
    return this.state.error;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Validation du token
  validateToken(): boolean {
    if (!this.state.tokens?.access_token) return false;
    
    try {
      // Décoder le JWT (sans vérifier la signature côté client)
      const payload = JSON.parse(atob(this.state.tokens.access_token.split('.')[1]));
      const now = Date.now() / 1000;
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Accéder à l'état actuel
  getState(): AuthState {
    return this.state;
  }

  // Obtenir un companyId de démo pour le développement
  getDemoCompanyId(): string {
    return 'demo-company-123';
  }
}

export const authManager = AuthManager.getInstance();
export default authManager;
