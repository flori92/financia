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
  AlertCircle
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("comptable@cabinet.bj");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>("");

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
      const res = await fetch("http://localhost:3001/api/v1/auth/login", {
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
        
        let redirectTo = '/dashboard';
        
        // Redirection selon le profil
        switch (userProfile) {
          case 'expert_comptable':
          case 'accountant':
            redirectTo = '/accountant';
            break;
          case 'admin':
            redirectTo = '/admin';
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
        
        window.localStorage.setItem("user_role", userRole);
        window.localStorage.setItem("user_profile", userProfile);
        
        router.push(redirectTo);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      setLoading(false);
    }
  }

  function selectProfile(profile: any) {
    setSelectedProfile(profile.id);
    setEmail(profile.demoEmail);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-emerald-600/5"></div>
      
      <div className="relative w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Section Profil Selection */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">BMS ERP</h1>
                  <p className="text-blue-400 text-sm">Business Management System</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Choisissez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">profil</span>
              </h2>
              <p className="text-slate-400">
                Sélectionnez votre profil pour un accès personnalisé aux fonctionnalités adaptées à votre rôle
              </p>
            </div>

            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => selectProfile(profile)}
                  className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedProfile === profile.id
                      ? `${profile.borderColor} bg-slate-800/50`
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${profile.color} flex items-center justify-center flex-shrink-0`}>
                      <profile.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{profile.name}</h3>
                      <p className="text-slate-400 text-sm">{profile.description}</p>
                    </div>
                    {selectedProfile === profile.id && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                    )}
                  </div>
                  
                  {selectedProfile === profile.id && (
                    <div className="mt-3 text-xs text-blue-400 font-medium">
                      Compte démo: {profile.demoEmail}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-white font-semibold mb-1">Accès sécurisé</h4>
                  <p className="text-slate-400 text-sm">
                    Chaque profil dispose d'autorisations spécifiques selon votre rôle professionnel
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Login Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
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

            <form onSubmit={handleLogin} className="space-y-6">
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
                className="w-full group relative bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
