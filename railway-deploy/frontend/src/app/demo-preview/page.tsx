"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDemoMode } from "@/contexts/DemoModeContext";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Settings,
  Building2,
  CreditCard,
  Briefcase,
  Calendar,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  PieChart,
  Package,
  ShoppingCart,
  ArrowLeft,
  Eye,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";

interface MenuItem {
  id: string;
  title: string;
  icon: any;
  description: string;
  subItems?: {
    id: string;
    title: string;
    description: string;
  }[];
}

export default function DemoPreviewPage() {
  const router = useRouter();
  const { setDemoMode } = useDemoMode();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [attemptedResource, setAttemptedResource] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    // Activer le mode démo
    setDemoMode(true);

    return () => {
      setDemoMode(false);
    };
  }, [setDemoMode]);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      title: "Tableau de Bord",
      icon: LayoutDashboard,
      description: "Vue d'ensemble de votre activité",
      subItems: [
        { id: "overview", title: "Vue Générale", description: "KPIs principaux" },
        { id: "analytics", title: "Analytiques", description: "Analyses détaillées" },
      ],
    },
    {
      id: "accounting",
      title: "Comptabilité",
      icon: FileText,
      description: "Gestion comptable complète",
      subItems: [
        { id: "journal", title: "Journal", description: "Écritures comptables" },
        { id: "balance", title: "Balance", description: "Balance générale" },
        { id: "reports", title: "Rapports", description: "États financiers" },
      ],
    },
    {
      id: "invoices",
      title: "Factures",
      icon: DollarSign,
      description: "Gestion des factures",
      subItems: [
        { id: "sales", title: "Ventes", description: "Factures clients" },
        { id: "purchases", title: "Achats", description: "Factures fournisseurs" },
        { id: "quotes", title: "Devis", description: "Gestion des devis" },
      ],
    },
    {
      id: "crm",
      title: "CRM",
      icon: Users,
      description: "Gestion de la relation client",
      subItems: [
        { id: "customers", title: "Clients", description: "Base clients" },
        { id: "leads", title: "Prospects", description: "Gestion des leads" },
        { id: "opportunities", title: "Opportunités", description: "Pipeline des ventes" },
      ],
    },
    {
      id: "treasury",
      title: "Trésorerie",
      icon: TrendingUp,
      description: "Gestion de trésorerie",
      subItems: [
        { id: "cash-flow", title: "Flux de trésorerie", description: "Suivi des flux" },
        { id: "payments", title: "Paiements", description: "Gestion des paiements" },
        { id: "forecasting", title: "Prévisions", description: "Prévisions financières" },
      ],
    },
    {
      id: "hr",
      title: "Ressources Humaines",
      icon: UserPlus,
      description: "Gestion RH",
      subItems: [
        { id: "employees", title: "Employés", description: "Gestion du personnel" },
        { id: "payroll", title: "Paie", description: "Gestion de la paie" },
        { id: "leaves", title: "Congés", description: "Gestion des congés" },
        { id: "attendance", title: "Présences", description: "Suivi des présences" },
      ],
    },
    {
      id: "inventory",
      title: "Stock",
      icon: Package,
      description: "Gestion des stocks",
      subItems: [
        { id: "products", title: "Produits", description: "Catalogue produits" },
        { id: "movements", title: "Mouvements", description: "Entrées/Sorties" },
        { id: "inventory-reports", title: "Rapports Stock", description: "États des stocks" },
      ],
    },
    {
      id: "reporting",
      title: "Reporting",
      icon: BarChart3,
      description: "Rapports et analyses",
      subItems: [
        { id: "financial", title: "Rapports Financiers", description: "États financiers" },
        { id: "sales-reports", title: "Rapports Ventes", description: "Analyses des ventes" },
        { id: "custom", title: "Rapports Personnalisés", description: "Créer vos rapports" },
      ],
    },
  ];

  const handleMenuClick = (item: MenuItem, subItem?: any) => {
    const resourceName = subItem
      ? `${item.title} > ${subItem.title}`
      : item.title;

    setAttemptedResource(resourceName);
    setShowUnauthorized(true);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0D9488] flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BMS ERP</h1>
                  <p className="text-sm text-gray-500">Mode Découverte</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Mode Démo
              </div>
              <button
                onClick={() => setShowContactForm(true)}
                className="px-6 py-2 bg-[#0D9488] hover:bg-[#0B7C74] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Nous Contacter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Banner Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                🎭 Bienvenue dans le Mode Découverte BMS ERP
              </h2>
              <p className="text-blue-800 mb-3">
                Explorez toutes les fonctionnalités disponibles dans notre solution.
                Vous pouvez voir les sections et sous-sections, mais l'accès complet
                nécessite un compte actif.
              </p>
              <p className="text-blue-700 text-sm">
                💡 <strong>Astuce :</strong> Cliquez sur n'importe quelle section pour
                voir le message d'accès restreint avec Po le Panda ! 🐼
              </p>
            </div>
          </div>
        </div>

        {/* Grid des fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedSections.includes(item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Section principale */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection(item.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-[#0D9488]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                    {item.subItems && (
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(item);
                    }}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Voir {item.title}
                  </button>
                </div>

                {/* Sous-sections */}
                {isExpanded && item.subItems && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {item.subItems.map((subItem) => (
                      <div
                        key={subItem.id}
                        className="px-6 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleMenuClick(item, subItem)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {subItem.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {subItem.description}
                            </p>
                          </div>
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Bottom */}
        <div className="mt-12 bg-gradient-to-br from-[#0D9488] to-emerald-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à débloquer toutes les fonctionnalités ?
          </h2>
          <p className="text-xl mb-6 text-white/90">
            Contactez-nous pour une démonstration personnalisée ou créez votre compte
            dès maintenant !
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowContactForm(true)}
              className="px-8 py-4 bg-white text-[#0D9488] font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Demander une Démo
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-8 py-4 bg-emerald-900 text-white font-semibold rounded-lg hover:bg-emerald-950 transition-colors"
            >
              Créer un Compte
            </button>
          </div>
        </div>
      </div>

      {/* Composant UnauthorizedAccess */}
      <UnauthorizedAccess
        isOpen={showUnauthorized}
        onClose={() => setShowUnauthorized(false)}
        requiredRoles={["Compte Actif"]}
        currentRole="Visiteur Démo"
        resourceName={attemptedResource}
        backdropVariant="gradient"
        onContactAdmin={() => {
          setShowUnauthorized(false);
          setShowContactForm(true);
        }}
      />

      {/* Contact Form Modal */}
      {showContactForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowContactForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Contactez-nous
              </h2>
              <button
                onClick={() => setShowContactForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Notre équipe vous recontactera dans les 24h pour organiser une
              démonstration personnalisée.
            </p>
            <button
              onClick={() => router.push("/contact-demo")}
              className="w-full px-6 py-3 bg-[#0D9488] hover:bg-[#0B7C74] text-white font-semibold rounded-lg transition-colors"
            >
              Remplir le Formulaire
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
