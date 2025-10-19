"use client";
import { useRouter } from "next/navigation";
import { Building2, BookOpen, Wallet, ShoppingCart, BarChart3, Shield, Zap, CheckCircle2 } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F3D3A] via-[#0D9488] to-[#0F3D3A]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-6xl font-bold text-white tracking-tight">BMS ERP</h1>
          </div>
          <h2 className="text-4xl font-semibold text-white mb-6">
            Solution Comptable Intégrée
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12">
            Gérez votre comptabilité, trésorerie, facturation et fiscalité avec une solution moderne et complète
          </p>
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 bg-white text-[#0F3D3A] text-lg font-semibold px-10 py-5 rounded-xl hover:bg-white/90 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            Se connecter
          </button>
          <p className="text-sm text-white/60 mt-4">
            Accédez à votre espace de gestion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
            <BookOpen className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold mb-2 text-white">Comptabilité</h3>
            <p className="text-white/80 text-sm">
              Plan comptable SYSCOHADA, écritures automatiques, lettrage intelligent
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
            <Wallet className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold mb-2 text-white">Trésorerie</h3>
            <p className="text-white/80 text-sm">
              Multi-banques, rapprochement automatique, prévisionnel en temps réel
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
            <ShoppingCart className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold mb-2 text-white">Facturation</h3>
            <p className="text-white/80 text-sm">
              Facturation électronique, relances automatiques, suivi des paiements
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
            <BarChart3 className="w-12 h-12 text-white mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold mb-2 text-white">Reporting</h3>
            <p className="text-white/80 text-sm">
              Tableaux de bord personnalisés, KPIs en temps réel, analyses avancées
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 border border-white/20">
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">Fonctionnalités avancées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, text: "OCR + IA pour saisie automatique" },
              { icon: CheckCircle2, text: "API bancaire temps réel" },
              { icon: CheckCircle2, text: "Lettrage automatique" },
              { icon: CheckCircle2, text: "Multi-devises & multi-entités" },
              { icon: CheckCircle2, text: "Conformité RGPD & ISO 27001" },
              { icon: CheckCircle2, text: "Télédéclarations fiscales" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <feature.icon className="w-5 h-5 text-green-400 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-white/90 text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 text-white/60 text-sm">
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
      </div>
    </div>
  );
}
