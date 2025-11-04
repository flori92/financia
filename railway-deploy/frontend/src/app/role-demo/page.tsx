"use client";

import { useState } from "react";
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { Shield, User, Briefcase, Users, GraduationCap, Calculator, TrendingUp, Building, CreditCard, Crown } from "lucide-react";

interface RoleDemo {
  role: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  spaces: string[];
}

const roles: RoleDemo[] = [
  {
    role: "ROLE_EMPLOYEE",
    title: "Employé",
    description: "Accès aux fonctionnalités de base : congés, bulletins, CRA, notes de frais",
    icon: <User className="w-6 h-6" />,
    color: "bg-blue-500",
    spaces: ["/employee-space"]
  },
  {
    role: "ROLE_MANAGER",
    title: "Manager",
    description: "Gestion d'équipe + validation des congés, CRA, notes de frais",
    icon: <Briefcase className="w-6 h-6" />,
    color: "bg-green-500",
    spaces: ["/employee-space", "/manager-space"]
  },
  {
    role: "ROLE_HR",
    title: "RH",
    description: "Administration globale : paie, politiques, recrutement",
    icon: <Users className="w-6 h-6" />,
    color: "bg-purple-500",
    spaces: ["/employee-space", "/hr-space"]
  },
  {
    role: "ROLE_EXPERT_COMPTABLE",
    title: "Expert Comptable",
    description: "Comptabilité avancée + fiscalité (si interne)",
    icon: <Calculator className="w-6 h-6" />,
    color: "bg-emerald-500",
    spaces: ["/employee-space", "/expert-comptable", "/fiscal-admin"]
  },
  {
    role: "ROLE_ENTREPRENEUR",
    title: "Entrepreneur",
    description: "Vision stratégique + fiscalité (si interne)",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "bg-orange-500",
    spaces: ["/employee-space", "/entrepreneur", "/fiscal-admin"]
  },
  {
    role: "ROLE_FISCAL_ADMIN",
    title: "Administration Fiscale",
    description: "Déclarations d'impôts et conformité fiscale",
    icon: <Building className="w-6 h-6" />,
    color: "bg-red-500",
    spaces: ["/fiscal-admin"]
  },
  {
    role: "ROLE_BANKING_INSTITUTION",
    title: "Banque",
    description: "Services financiers et analyse de crédit",
    icon: <CreditCard className="w-6 h-6" />,
    color: "bg-cyan-500",
    spaces: ["/banking"]
  },
  {
    role: "ROLE_SUPER_ADMIN",
    title: "Super Admin",
    description: "Accès universel à tous les espaces et fonctionnalités",
    icon: <Crown className="w-6 h-6" />,
    color: "bg-amber-500",
    spaces: ["/employee-space", "/manager-space", "/hr-space", "/expert-comptable", "/entrepreneur", "/fiscal-admin", "/banking", "/admin"]
  }
];

function RoleDemoPage() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);

  const simulateRole = (role: string) => {
    setIsSimulating(true);
    
    // Simuler l'authentification avec le rôle sélectionné
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bms_token", "demo_token_" + Date.now());
      
      // Pour le Super Admin, simuler tous les rôles
      if (role === "ROLE_SUPER_ADMIN") {
        window.localStorage.setItem("bms_user_roles", JSON.stringify([
          "ROLE_SUPER_ADMIN",
          "ROLE_EMPLOYEE",
          "ROLE_MANAGER",
          "ROLE_HR",
          "ROLE_EXPERT_COMPTABLE",
          "ROLE_ENTREPRENEUR",
          "ROLE_FISCAL_ADMIN",
          "ROLE_BANKING_INSTITUTION"
        ]));
      } else {
        // Simuler les rôles cumulés selon l'architecture
        let simulatedRoles = [role];
        
        if (role === "ROLE_MANAGER") {
          simulatedRoles = ["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_FISCAL_ADMIN"];
        } else if (role === "ROLE_HR") {
          simulatedRoles = ["ROLE_EMPLOYEE", "ROLE_HR"];
        } else if (role === "ROLE_EXPERT_COMPTABLE") {
          simulatedRoles = ["ROLE_EMPLOYEE", "ROLE_EXPERT_COMPTABLE", "ROLE_FISCAL_ADMIN"];
        } else if (role === "ROLE_ENTREPRENEUR") {
          simulatedRoles = ["ROLE_EMPLOYEE", "ROLE_ENTREPRENEUR", "ROLE_FISCAL_ADMIN"];
        }
        
        window.localStorage.setItem("bms_user_roles", JSON.stringify(simulatedRoles));
      }
      
      window.localStorage.setItem("bms_user_role", role);
    }
    
    setSelectedRole(role);
    setTimeout(() => setIsSimulating(false), 1000);
  };

  const clearSimulation = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("bms_token");
      window.localStorage.removeItem("bms_user_roles");
      window.localStorage.removeItem("bms_user_role");
    }
    setSelectedRole("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Shield className="w-10 h-10 text-purple-600" />
            Démonstration des Rôles BMS
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explorez l'architecture complète des rôles utilisateurs avec cumul flexible. 
            Sélectionnez un rôle pour simuler l'authentification et tester les accès.
          </p>
        </div>

        {/* État actuel de la simulation */}
        {selectedRole && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-medium text-green-800">
                    Simulation active : {roles.find(r => r.role === selectedRole)?.title}
                  </h3>
                  <p className="text-sm text-green-700">
                    Vous pouvez maintenant naviguer vers les espaces accessibles
                  </p>
                </div>
              </div>
              <button
                onClick={clearSimulation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Arrêter la simulation
              </button>
            </div>
          </div>
        )}

        {/* Grille des rôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {roles.map((roleDemo) => (
            <div
              key={roleDemo.role}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 ${
                selectedRole === roleDemo.role
                  ? "border-purple-500 shadow-lg transform scale-105"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg text-white ${roleDemo.color}`}>
                    {roleDemo.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{roleDemo.title}</h3>
                    <p className="text-sm text-gray-500">{roleDemo.role}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {roleDemo.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Espaces accessibles :</h4>
                  <div className="flex flex-wrap gap-1">
                    {roleDemo.spaces.map((space, i) => (
                      <span
                        key={i}
                        className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      >
                        {space}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => simulateRole(roleDemo.role)}
                  disabled={isSimulating}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedRole === roleDemo.role
                      ? "bg-purple-600 text-white"
                      : roleDemo.role === "ROLE_SUPER_ADMIN"
                      ? "bg-amber-600 text-white hover:bg-amber-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } ${isSimulating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSimulating ? "Simulation..." : 
                   selectedRole === roleDemo.role ? "Simulation active" : 
                   "Simuler ce rôle"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">Comment utiliser cette démo :</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>1. Sélectionnez un rôle ci-dessus pour simuler l'authentification</li>
            <li>2. Le système stockera les rôles dans localStorage (comme JWT)</li>
            <li>3. Naviguez vers les espaces accessibles pour tester les permissions</li>
            <li>4. Les rôles cumulés sont automatiquement configurés (ex: Manager = Employee + Manager + Fiscal)</li>
            <li>5. Le Super Admin a accès à TOUS les espaces sans restriction</li>
            <li>6. Cliquez "Arrêter la simulation" pour réinitialiser</li>
          </ol>
        </div>

        {/* Liens rapides vers les espaces */}
        {selectedRole && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-4">Navigation rapide vers les espaces :</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {roles.find(r => r.role === selectedRole)?.spaces.map((space) => (
                <a
                  key={space}
                  href={space}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  {space}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RoleDemo() {
  return (
    <ProtectedPage>
      <RoleDemoPage />
    </ProtectedPage>
  );
}
