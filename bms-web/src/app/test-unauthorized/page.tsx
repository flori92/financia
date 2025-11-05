"use client";
import { useState } from "react";
import { UnauthorizedAccess } from "@/components/auth/UnauthorizedAccess";
import { Shield, Lock, Users, Settings, FileText, DollarSign } from "lucide-react";

export default function TestUnauthorizedPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    requiredRoles?: string[];
    resource?: string;
  }>({});

  const testScenarios = [
    {
      title: "Accès Admin",
      description: "Tentative d'accès aux paramètres système",
      icon: Settings,
      color: "bg-purple-600",
      requiredRoles: ["Administrateur"],
      resource: "les paramètres système",
    },
    {
      title: "Accès Comptabilité",
      description: "Tentative d'accès au grand livre",
      icon: FileText,
      color: "bg-blue-600",
      requiredRoles: ["Expert Comptable", "Comptable"],
      resource: "le grand livre comptable",
    },
    {
      title: "Accès RH",
      description: "Tentative d'accès aux bulletins de paie",
      icon: Users,
      color: "bg-rose-600",
      requiredRoles: ["RH Manager", "Admin"],
      resource: "les bulletins de paie",
    },
    {
      title: "Accès Trésorerie",
      description: "Tentative d'accès aux comptes bancaires",
      icon: DollarSign,
      color: "bg-emerald-600",
      requiredRoles: ["Trésorier", "Directeur Financier"],
      resource: "les comptes bancaires",
    },
    {
      title: "Accès Multi-rôles",
      description: "Fonctionnalité nécessitant plusieurs rôles",
      icon: Shield,
      color: "bg-amber-600",
      requiredRoles: ["Admin", "Manager", "Expert Comptable"],
      resource: "cette fonctionnalité avancée",
    },
    {
      title: "Accès Générique",
      description: "Test avec message par défaut",
      icon: Lock,
      color: "bg-slate-600",
      requiredRoles: undefined,
      resource: undefined,
    },
  ];

  const handleTest = (scenario: typeof testScenarios[0]) => {
    setConfig({
      requiredRoles: scenario.requiredRoles,
      resource: scenario.resource,
    });
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#0D9488] flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Test Accès Non Autorisé
              </h1>
              <p className="text-slate-600">
                Testez le composant avec Po le panda qui pleure 🐼
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testScenarios.map((scenario, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-lg ${scenario.color} flex items-center justify-center flex-shrink-0`}
                >
                  <scenario.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {scenario.title}
                  </h3>
                  <p className="text-sm text-slate-600">{scenario.description}</p>
                </div>
              </div>

              {scenario.requiredRoles && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">
                    Rôles requis:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {scenario.requiredRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleTest(scenario)}
                className="w-full px-4 py-2.5 bg-[#0D9488] text-white font-medium rounded-lg hover:bg-[#0B7C74] transition-colors"
              >
                Tester ce scénario
              </button>
            </div>
          ))}
        </div>
      </div>

      <UnauthorizedAccess
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        requiredRoles={config.requiredRoles}
        resource={config.resource}
      />
    </div>
  );
}
