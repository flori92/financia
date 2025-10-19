"use client";
import { useRouter } from "next/navigation";
import { Building2, TrendingUp, Shield, Zap } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Building2 className="w-12 h-12 text-app-primary" />
            <h1 className="text-5xl font-bold text-slate-900">BMS</h1>
          </div>
          <h2 className="text-3xl font-semibold text-slate-800 mb-4">
            Business Management System
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            La meilleure solution pour la gestion comptable et financière de votre entreprise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <TrendingUp className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Gestion Complète</h3>
            <p className="text-slate-600">
              Comptabilité, trésorerie, facturation, CRM et bien plus dans une seule plateforme
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Shield className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sécurisé & Conforme</h3>
            <p className="text-slate-600">
              Conformité fiscale, archivage légal et sécurité des données garantis
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <Zap className="w-10 h-10 text-amber-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Rapide & Efficace</h3>
            <p className="text-slate-600">
              Automatisation intelligente et tableaux de bord en temps réel
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 bg-app-primary text-white text-lg font-semibold px-8 py-4 rounded-lg hover:bg-[#0F766E] transition-colors shadow-lg hover:shadow-xl"
          >
            Se connecter
          </button>
          <p className="text-sm text-slate-500 mt-4">
            Accédez à votre espace de gestion
          </p>
        </div>
      </div>
    </div>
  );
}
