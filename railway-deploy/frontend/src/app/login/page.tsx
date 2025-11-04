"use client";

import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("comptable@cabinet.bj");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Identifiants invalides");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        // Stocker le token JWT
        window.localStorage.setItem("bms_token", data.access_token);
        window.localStorage.setItem("user_email", email);
        window.localStorage.setItem("user_data", JSON.stringify(data.user || {}));
        
        // Stocker le companyId (essentiel pour toutes les requêtes API)
        const companyId = data.user?.companyId || "1805bc61-7cfd-44e9-8a63-17187bf05dc7";
        window.localStorage.setItem("company_id", companyId);
        
        // Déterminer les rôles pour notre architecture multi-rôles
        let roles: string[] = [];
        let primaryRole = 'ROLE_EMPLOYEE';
        let redirectTo = '/dashboard';
        
        if (email.includes('comptable') || email.includes('accountant')) {
          roles = ['ROLE_EMPLOYEE', 'ROLE_EXPERT_COMPTABLE', 'ROLE_FISCAL_ADMIN'];
          primaryRole = 'ROLE_EXPERT_COMPTABLE';
          redirectTo = '/expert-comptable';
        } else if (email.includes('admin') && email.includes('dgi')) {
          roles = ['ROLE_FISCAL_ADMIN'];
          primaryRole = 'ROLE_FISCAL_ADMIN';
          redirectTo = '/fiscal-admin';
        } else if (email.includes('admin')) {
          roles = ['ROLE_SUPER_ADMIN'];
          primaryRole = 'ROLE_SUPER_ADMIN';
          redirectTo = '/admin';
        } else if (email.includes('manager')) {
          roles = ['ROLE_EMPLOYEE', 'ROLE_MANAGER', 'ROLE_FISCAL_ADMIN'];
          primaryRole = 'ROLE_MANAGER';
          redirectTo = '/manager-space';
        } else if (email.includes('hr') || email.includes('rh')) {
          roles = ['ROLE_EMPLOYEE', 'ROLE_HR'];
          primaryRole = 'ROLE_HR';
          redirectTo = '/hr-space';
        } else {
          // Entrepreneur par défaut
          roles = ['ROLE_EMPLOYEE', 'ROLE_ENTREPRENEUR', 'ROLE_FISCAL_ADMIN'];
          primaryRole = 'ROLE_ENTREPRENEUR';
          redirectTo = '/entrepreneur';
        }
        
        // Stocker les rôles multiples (pour AuthGuard)
        window.localStorage.setItem("bms_user_roles", JSON.stringify(roles));
        window.localStorage.setItem("bms_user_role", primaryRole);
        window.localStorage.setItem("user_role", primaryRole); // Compatibilité
        
        router.push(redirectTo);
      }
    } catch (e) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-app-primary to-[#0F766E] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">BMS</h1>
            <p className="text-slate-600">Business Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-app-primary"
                placeholder="email@exemple.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-app-primary"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-app-primary text-white rounded-md py-3 font-medium hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center mb-3">
              Comptes de démonstration
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-medium">Entrepreneur:</span>
                <span>entrepreneur@test.bj</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Comptable:</span>
                <span>comptable@cabinet.bj</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Admin fiscal:</span>
                <span>taxadmin@dgi.bj</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span>admin@bms.bj</span>
              </div>
              <div className="text-center mt-2 text-slate-500">
                Mot de passe commun: <span className="font-mono">password123</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-4">
          © 2025 BMS - Business Management System
        </p>
      </div>
    </div>
  );
}
