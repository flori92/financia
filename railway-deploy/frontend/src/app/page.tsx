"use client";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  BookOpen, 
  Wallet, 
  ShoppingCart, 
  BarChart3, 
  Shield, 
  Zap, 
  CheckCircle2,
  Users,
  TrendingUp,
  Calculator,
  Briefcase,
  GraduationCap,
  Crown,
  Building,
  UserCheck,
  ChevronRight,
  Star,
  ArrowRight
} from "lucide-react";

export default function Page() {
  const router = useRouter();

  const profiles = [
    {
      name: "Expert Comptable",
      description: "Gestion comptable avancée, audit, conseil fiscal",
      icon: Calculator,
      color: "bg-blue-600",
      features: ["Comptabilité OHADA", "Audit financier", "Conseil fiscal", "Reporting expert"],
      bgColor: "bg-slate-800",
      borderColor: "border-slate-700"
    },
    {
      name: "Entrepreneur",
      description: "Pilotage d'entreprise, décisions stratégiques",
      icon: Briefcase,
      color: "bg-[#0D9488]",
      features: ["Dashboard stratégique", "KPIs temps réel", "Prévisions", "Business Intelligence"],
      bgColor: "bg-slate-800",
      borderColor: "border-slate-700"
    },
    {
      name: "Banque",
      description: "Opérations bancaires, conformité réglementaire",
      icon: Building,
      color: "bg-purple-600",
      features: ["API bancaires", "Conformité", "Risk Management", "Transactions sécurisées"],
      bgColor: "bg-slate-800",
      borderColor: "border-slate-700"
    },
    {
      name: "Administration Fiscale",
      description: "Gestion fiscale, déclarations, contrôles",
      icon: Crown,
      color: "bg-amber-600",
      features: ["Télédéclarations", "Contrôles fiscaux", "Optimisation", "Conformité"],
      bgColor: "bg-slate-800",
      borderColor: "border-slate-700"
    },
    {
      name: "RH Manager",
      description: "Gestion RH, paie, talent management",
      icon: Users,
      color: "bg-rose-600",
      features: ["Paie automatisée", "Talent acquisition", "Performance", "Engagement"],
      bgColor: "bg-slate-800",
      borderColor: "border-slate-700"
    },
    {
      name: "Manager",
      description: "Management d'équipe, productivité",
      icon: UserCheck,
      color: "bg-indigo-600",
      features: ["Team management", "Productivité", "Objectifs", "Collaboration"],
      bgColor: "bg-slate-800",
      borderColor: "border-slate-700"
    }
  ];

  const coreModules = [
    {
      icon: BookOpen,
      title: "Comptabilité OHADA",
      description: "Plan comptable SYSCOHADA, écritures automatiques, lettrage intelligent",
      color: "text-blue-400"
    },
    {
      icon: Wallet,
      title: "Trésorerie",
      description: "Multi-banques, rapprochement automatique, prévisionnel en temps réel",
      color: "text-emerald-400"
    },
    {
      icon: ShoppingCart,
      title: "Facturation",
      description: "Facturation électronique, relances automatiques, suivi des paiements",
      color: "text-purple-400"
    },
    {
      icon: BarChart3,
      title: "Reporting & Analytics",
      description: "Tableaux de bord personnalisés, KPIs en temps réel, analyses avancées",
      color: "text-amber-400"
    }
  ];

  const aiFeatures = [
    "OCR + IA pour saisie automatique des documents",
    "Prédictions financières et anomalies detection",
    "Assistant IA pour conseils comptables",
    "Automatisation intelligente des tâches",
    "Chatbot pour support 24/7",
    "Machine Learning pour optimisation fiscale"
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-800/50">
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            {/* Logo et Titre centrés */}
            <div className="flex flex-col items-center mb-12">
              <div className="w-24 h-24 rounded-2xl bg-[#0D9488] flex items-center justify-center shadow-2xl mb-6">
                <Building2 className="w-14 h-14 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-7xl font-bold text-white tracking-tight mb-2">BMS ERP</h1>
              <p className="text-xl text-slate-400 font-medium">Business Management System</p>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6">
              Solution <span className="text-[#0D9488]">Multi-Profils</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Plateforme ERP moderne avec architecture adaptative par profil. 
              Chaque rôle dispose d'interfaces et fonctionnalités spécialisées pour une expérience utilisateur optimale.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => router.push('/login')}
                className="group inline-flex items-center gap-3 bg-[#0D9488] text-white text-lg font-semibold px-10 py-5 rounded-xl hover:bg-[#0B7C74] transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
              >
                Se connecter
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold px-10 py-5 rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Essai gratuit
                <Star className="w-5 h-5 text-yellow-400" />
              </button>
            </div>
            
            <p className="text-slate-400 mt-6">
              Accédez à votre espace personnalisé selon votre profil professionnel
            </p>
          </div>
        </div>
      </div>

      {/* Profiles Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Portails <span className="text-[#0D9488]">Spécialisés</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Chaque profil dispose d'un portail dédié avec des fonctionnalités adaptées à ses besoins spécifiques
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {profiles.map((profile, index) => (
            <div 
              key={index}
              className={`group relative ${profile.bgColor} rounded-2xl p-8 border ${profile.borderColor} hover:shadow-2xl hover:border-[#0D9488]/50 transition-all duration-300 cursor-pointer`}
              onClick={() => router.push('/login')}
            >
              <div className="absolute top-4 right-4">
                <div className={`w-12 h-12 rounded-full ${profile.color} flex items-center justify-center`}>
                  <profile.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 pr-16">{profile.name}</h3>
              <p className="text-slate-300 mb-6 leading-relaxed">{profile.description}</p>
              
              <div className="space-y-3">
                {profile.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-slate-200 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-[#0D9488] group-hover:text-[#0B7C74] transition-colors">
                <span className="text-sm font-medium">Accéder au portail</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Modules Section */}
      <div className="bg-slate-800/50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Modules <span className="text-[#0D9488]">Intégrés</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Fonctionnalités complètes pour la gestion de votre entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreModules.map((module, index) => (
              <div 
                key={index}
                className="bg-slate-900/50 rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl"
              >
                <module.icon className={`w-12 h-12 ${module.color} mb-6`} strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-white mb-3">{module.title}</h3>
                <p className="text-slate-400 leading-relaxed">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Intelligence <span className="text-[#0D9488]">Artificielle</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Fonctionnalités IA avancées pour automatiser et optimiser vos processus
          </p>
        </div>

        <div className="bg-slate-800 rounded-3xl p-12 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0D9488] flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-slate-200 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-800 py-20 border-t border-slate-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à transformer votre gestion ?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Rejoignez les centaines d'entreprises qui font confiance à BMS ERP pour leur gestion quotidienne
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => router.push('/login')}
              className="group inline-flex items-center gap-3 bg-[#0D9488] text-white text-lg font-semibold px-10 py-5 rounded-xl hover:bg-[#0B7C74] transition-all shadow-2xl hover:scale-105"
            >
              Commencer l'essai gratuit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => router.push('/demo-preview')}
              className="inline-flex items-center gap-3 bg-slate-700 text-white text-lg font-semibold px-10 py-5 rounded-xl hover:bg-slate-600 transition-all border border-slate-600"
            >
              Découvrir en Démo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0D9488] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-white font-bold text-xl">BMS ERP</span>
            </div>
            
            <div className="flex items-center gap-8 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" strokeWidth={1.5} />
                <span>ISO 27001</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" strokeWidth={1.5} />
                <span>RGPD</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" strokeWidth={1.5} />
                <span>SOC 2</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            <p>© 2025 BMS ERP. Tous droits réservés. Solution de gestion d'entreprise multi-profils.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
