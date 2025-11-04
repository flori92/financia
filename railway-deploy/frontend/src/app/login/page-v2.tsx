"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authManager, type AuthState } from "@/lib/auth-manager";

export default function LoginPageV2() {
  const router = useRouter();
  const [email, setEmail] = useState("comptable@cabinet.bj");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    tokens: null,
    isLoading: false,
    error: null
  });

  // S'abonner aux changements d'état
  React.useEffect(() => {
    const unsubscribe = authManager.subscribe((state) => {
      setAuthState(state);
    });
    
    return unsubscribe;
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      await authManager.login(email, password);
      // La redirection est gérée par authManager
    } catch (error) {
      // L'erreur est déjà gérée dans le state
      console.error('Login failed:', error);
    }
  }

  function handleDemoLogin(role: 'entrepreneur' | 'accountant' | 'admin') {
    const demoAccounts = {
      entrepreneur: { email: 'entrepreneur@demo.bj', password: 'demo123' },
      accountant: { email: 'comptable@cabinet.bj', password: 'password123' },
      admin: { email: 'admin@bms.bj', password: 'admin123' }
    };
    
    const account = demoAccounts[role];
    setEmail(account.email);
    setPassword(account.password);
    
    // Auto-login pour demo
    setTimeout(() => {
      authManager.login(account.email, account.password);
    }, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-primary to-[#0F766E] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <span className="text-2xl font-bold text-app-primary">BMS</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">BMS</h1>
          <p className="text-app-primary-light/80">Business Management System</p>
          <p className="text-sm text-app-primary-light/60 mt-1">Plateforme de gestion professionnelle</p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Indicateur d'état */}
          {authState.isLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-blue-700">Connexion en cours...</span>
              </div>
            </div>
          )}

          {authState.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700">{authState.error}</span>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email professionnel
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-app-primary focus:border-transparent transition-all duration-200"
                  placeholder="nom@entreprise.bj"
                  autoComplete="email"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-app-primary focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-slate-300 text-app-primary focus:ring-app-primary" />
                <span className="ml-2 text-sm text-slate-600">Se souvenir de moi</span>
              </label>
              <button type="button" className="text-sm text-app-primary hover:text-app-primary-dark transition-colors">
                Mot de passe oublié?
              </button>
            </div>

            <button
              type="submit"
              disabled={authState.isLoading}
              className="w-full bg-app-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-app-primary-dark focus:ring-4 focus:ring-app-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authState.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Comptes démo */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center mb-3">Comptes de démonstration</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin('entrepreneur')}
                className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                Entrepreneur
              </button>
              <button
                onClick={() => handleDemoLogin('accountant')}
                className="px-3 py-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
              >
                Comptable
              </button>
              <button
                onClick={() => handleDemoLogin('admin')}
                className="px-3 py-2 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/60">
            Version 3.0.0 • Sécurité renforcée • 
            <a href="#" className="hover:text-white transition-colors ml-1">Aide</a>
          </p>
        </div>
      </div>
    </div>
  );
}
