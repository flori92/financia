"use client";

import { useState } from "react";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import { Lock, Shield, Users, Settings, FileText, DollarSign } from "lucide-react";

export default function TestUnauthorizedPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [backdropVariant, setBackdropVariant] = useState<'blur' | 'gradient' | 'solid'>('blur');
  const [scenario, setScenario] = useState<{
    requiredRoles: string[];
    currentRole: string;
    resourceName: string;
  }>({
    requiredRoles: ["Admin", "Manager"],
    currentRole: "Employé",
    resourceName: "cette page",
  });

  const testScenarios = [
    {
      title: "Accès Admin requis",
      icon: Shield,
      requiredRoles: ["Administrateur Système"],
      currentRole: "Employé",
      resourceName: "la configuration système",
    },
    {
      title: "Accès RH Manager",
      icon: Users,
      requiredRoles: ["RH Manager", "Admin"],
      currentRole: "Manager",
      resourceName: "la gestion des salaires",
    },
    {
      title: "Accès Expert Comptable",
      icon: FileText,
      requiredRoles: ["Expert Comptable", "Admin"],
      currentRole: "Employé",
      resourceName: "les rapports fiscaux",
    },
    {
      title: "Accès Banking",
      icon: DollarSign,
      requiredRoles: ["Banque Partenaire", "Trésorier"],
      currentRole: "Employé",
      resourceName: "les transactions bancaires",
    },
    {
      title: "Multi-rôles requis",
      icon: Lock,
      requiredRoles: ["Admin", "Manager", "RH Manager", "Expert Comptable"],
      currentRole: "Stagiaire",
      resourceName: "cette fonctionnalité avancée",
    },
  ];

  const handleOpenModal = (testCase: typeof testScenarios[0]) => {
    setScenario({
      requiredRoles: testCase.requiredRoles,
      currentRole: testCase.currentRole,
      resourceName: testCase.resourceName,
    });
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🐼 Test Accès Non Autorisé
          </h1>
          <p className="text-xl text-gray-600">
            Testez le composant UnauthorizedAccess avec Po le Panda triste
          </p>
        </div>

        {/* Sélecteur de variante Backdrop */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎨 Style de fond (Backdrop)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Choisissez le style de fond qui apparaît derrière le modal
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Blur */}
            <button
              onClick={() => setBackdropVariant('blur')}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                backdropVariant === 'blur'
                  ? 'border-[#0D9488] bg-[#0D9488]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[#0D9488]/40 via-emerald-600/30 to-teal-500/40 backdrop-blur-xl" 
                     style={{ backdropFilter: 'blur(20px)' }}
                />
              </div>
              <div className="relative z-10">
                <h3 className="font-semibold text-gray-900 mb-1">Flou (Blur)</h3>
                <p className="text-sm text-gray-600">
                  Page floue + dégradé transparent
                </p>
                {backdropVariant === 'blur' && (
                  <div className="mt-2 px-2 py-1 bg-[#0D9488] text-white text-xs rounded-full inline-block">
                    ✓ Sélectionné
                  </div>
                )}
              </div>
            </button>

            {/* Gradient */}
            <button
              onClick={() => setBackdropVariant('gradient')}
              className={`relative p-6 rounded-xl border-2 transition-all overflow-hidden ${
                backdropVariant === 'gradient'
                  ? 'border-[#0D9488] bg-[#0D9488]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="absolute inset-0">
                <div className="w-full h-full bg-gradient-to-br from-[#0D9488]/85 via-emerald-600/75 to-teal-500/85" />
              </div>
              <div className="relative z-10">
                <h3 className="font-semibold text-white mb-1">Dégradé</h3>
                <p className="text-sm text-white/90">
                  Dégradé vert BMS semi-transparent
                </p>
                {backdropVariant === 'gradient' && (
                  <div className="mt-2 px-2 py-1 bg-white text-[#0D9488] text-xs rounded-full inline-block">
                    ✓ Sélectionné
                  </div>
                )}
              </div>
            </button>

            {/* Solid */}
            <button
              onClick={() => setBackdropVariant('solid')}
              className={`relative p-6 rounded-xl border-2 transition-all overflow-hidden ${
                backdropVariant === 'solid'
                  ? 'border-[#0D9488] bg-[#0D9488]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="absolute inset-0">
                <div className="w-full h-full bg-gradient-to-br from-[#0D9488] to-emerald-700" />
              </div>
              <div className="relative z-10">
                <h3 className="font-semibold text-white mb-1">Solide</h3>
                <p className="text-sm text-white/90">
                  Fond vert BMS opaque
                </p>
                {backdropVariant === 'solid' && (
                  <div className="mt-2 px-2 py-1 bg-white text-[#0D9488] text-xs rounded-full inline-block">
                    ✓ Sélectionné
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Scénarios de test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testScenarios.map((testCase, index) => {
            const Icon = testCase.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#0D9488]/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#0D9488]" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{testCase.title}</h3>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Rôles requis:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {testCase.requiredRoles.map((role, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#0D9488] text-white text-xs rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Votre rôle:</span>
                    <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                      {testCase.currentRole}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ressource:</span>
                    <p className="text-gray-900 font-medium">{testCase.resourceName}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal(testCase)}
                  className="w-full px-4 py-2 bg-[#0D9488] hover:bg-[#0B7C74] text-white font-semibold rounded-lg transition-colors"
                >
                  Tester ce scénario
                </button>
              </div>
            );
          })}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            💡 À propos de ce composant
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Po le Panda</strong> - Animation SVG custom avec larmes animées,
                flottement et tremblement
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Responsive</strong> - Fonctionne sur mobile, tablette et desktop
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Réutilisable</strong> - Peut être intégré partout dans
                l'application
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Personnalisable</strong> - Props pour rôles, ressources et actions
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Accessible</strong> - Support clavier et lecteurs d'écran
              </span>
            </li>
          </ul>
        </div>

        {/* Code d'exemple */}
        <div className="bg-gray-900 rounded-xl p-6 text-white overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-emerald-400">
            📝 Exemple d'utilisation
          </h3>
          <pre className="text-sm">
            <code>{`import UnauthorizedAccess from "@/components/UnauthorizedAccess";

function MyComponent() {
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  return (
    <>
      <button onClick={() => setShowUnauthorized(true)}>
        Accéder à une ressource protégée
      </button>

      <UnauthorizedAccess
        isOpen={showUnauthorized}
        onClose={() => setShowUnauthorized(false)}
        requiredRoles={["Admin", "Manager"]}
        currentRole="Employé"
        resourceName="cette fonctionnalité"
        onContactAdmin={() => {
          // Action personnalisée
          console.log("Contacter l'admin");
        }}
      />
    </>
  );
}`}</code>
          </pre>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-[#0D9488]">100%</div>
            <div className="text-sm text-gray-600">Custom SVG</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-[#0D9488]">5+</div>
            <div className="text-sm text-gray-600">Animations</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-[#0D9488]">0</div>
            <div className="text-sm text-gray-600">Images externes</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-[#0D9488]">200+</div>
            <div className="text-sm text-gray-600">Lignes de code</div>
          </div>
        </div>
      </div>

      {/* Composant UnauthorizedAccess */}
      <UnauthorizedAccess
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        requiredRoles={scenario.requiredRoles}
        currentRole={scenario.currentRole}
        resourceName={scenario.resourceName}
        backdropVariant={backdropVariant}
        onContactAdmin={() => {
          alert("Demande d'accès envoyée à l'administrateur !");
          setIsOpen(false);
        }}
      />
    </div>
  );
}
