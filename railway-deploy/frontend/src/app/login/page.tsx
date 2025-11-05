"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Calculator, 
  Briefcase, 
  Crown, 
  Users, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock,
  ArrowRight,
  Shield,
  AlertCircle,
  Receipt
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("comptable@cabinet.bj");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profiles = [
    {
      id: "expert_comptable",
      name: "Expert Comptable",
      description: "Accès complet à la comptabilité et audit",
      icon: Calculator,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      borderColor: "border-blue-600",
      demoEmail: "comptable@cabinet.bj"
    },
    {
      id: "entrepreneur",
      name: "Entrepreneur",
      description: "Pilotage stratégique et KPIs",
      icon: Briefcase,
      color: "bg-emerald-600",
      hoverColor: "hover:bg-emerald-700",
      borderColor: "border-emerald-600",
      demoEmail: "entreprise@company.bj"
    },
    {
      id: "administration_fiscal",
      name: "Administration Fiscale",
      description: "Déclarations fiscales et contrôles",
      icon: Receipt,
      color: "bg-amber-600",
      hoverColor: "hover:bg-amber-700",
      borderColor: "border-amber-600",
      demoEmail: "fiscal@dgfi.bj"
    },
    {
      id: "admin",
      name: "Administrateur",
      description: "Gestion système et utilisateurs",
      icon: Crown,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      borderColor: "border-purple-600",
      demoEmail: "admin@bms.bj"
    },
    {
      id: "hr_manager",
      name: "RH Manager",
      description: "Gestion du personnel et paie",
      icon: Users,
      color: "bg-rose-600",
      hoverColor: "hover:bg-rose-700",
      borderColor: "border-rose-600",
      demoEmail: "rh@company.bj"
    },
    {
      id: "manager",
      name: "Manager",
      description: "Management d'équipe et projets",
      icon: UserCheck,
      color: "bg-indigo-600",
      hoverColor: "hover:bg-indigo-700",
      borderColor: "border-indigo-600",
      demoEmail: "manager@company.bj"
    }
  ];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
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
        window.localStorage.setItem("bms_token", data.access_token);
        window.localStorage.setItem("user_email", email);
        window.localStorage.setItem("user_data", JSON.stringify(data.user || {}));
        
        // Déterminer la redirection selon le profil depuis le JWT
        const userRole = data.user?.role || 'user';
        const userProfile = data.user?.profile || 'entrepreneur';
        const userProfiles = data.user?.profiles || [userProfile];
        const userPrimaryProfile = data.user?.primaryProfile || userProfile;
        
        // Si l'utilisateur a plusieurs profils, rediriger vers la page de sélection
        if (userProfiles.length > 1) {
          window.localStorage.setItem("user_data", JSON.stringify(data.user));
          window.localStorage.setItem("user_role", userRole);
          window.localStorage.setItem("user_profile", userProfile);
          router.push('/profile-selection');
          return;
        }
        
        let redirectTo = '/dashboard';
        
        // Redirection selon le profil principal
        switch (userPrimaryProfile) {
          case 'expert_comptable':
          case 'accountant':
            redirectTo = '/accountant';
            break;
          case 'admin':
            redirectTo = '/admin';
            break;
          case 'administration_fiscal':
            redirectTo = '/tax-admin';
            break;
          case 'hr_manager':
            redirectTo = '/hr';
            break;
          case 'manager':
            redirectTo = '/manager';
            break;
          case 'entrepreneur':
            redirectTo = '/dashboard';
            break;
          default:
            redirectTo = '/dashboard';
        }
        
        window.localStorage.setItem("user_data", JSON.stringify(data.user));
        window.localStorage.setItem("user_role", userRole);
        window.localStorage.setItem("user_profile", userProfile);
        
        router.push(redirectTo);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  // Profile selection UI retirée de la page de connexion

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">

      <div className="relative w-full max-w-2xl">
        <div className="flex items-center justify-center">

          {/* Section Login Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Connexion</h2>
              <p className="text-slate-400">
                Accédez à votre espace de travail BMS ERP
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-600/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-rose-400 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" autoComplete="on">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="email@entreprise.bj"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={1.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900/50 text-blue-600 focus:ring-blue-500/20 focus:outline-none"
                  />
                  <span className="text-sm text-slate-400">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mot de passe oublié?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative bg-[#0D9488] text-white font-semibold py-4 rounded-xl hover:bg-[#0B7C74] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm">
                Pas encore de compte?{" "}
                <button
                  onClick={() => router.push('/register')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Demander une démo
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" strokeWidth={1.5} />
                  <span>Connexion sécurisée</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" strokeWidth={1.5} />
                  <span>RGPD compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
