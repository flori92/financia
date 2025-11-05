"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Building2, 
  Calculator, 
  Briefcase, 
  Crown, 
  Users, 
  UserCheck, 
  Receipt,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function ProfileSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [primaryProfile, setPrimaryProfile] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);

  const profiles = [
    {
      id: "expert_comptable",
      name: "Expert Comptable",
      description: "Gestion comptable avancée, audit, conseil fiscal",
      icon: Calculator,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      borderColor: "border-blue-600"
    },
    {
      id: "entrepreneur",
      name: "Entrepreneur",
      description: "Pilotage stratégique et KPIs",
      icon: Briefcase,
      color: "bg-emerald-600",
      hoverColor: "hover:bg-emerald-700",
      borderColor: "border-emerald-600"
    },
    {
      id: "administration_fiscal",
      name: "Administration Fiscale",
      description: "Déclarations fiscales et contrôles",
      icon: Receipt,
      color: "bg-amber-600",
      hoverColor: "hover:bg-amber-700",
      borderColor: "border-amber-600"
    },
    {
      id: "admin",
      name: "Administrateur",
      description: "Gestion système et utilisateurs",
      icon: Crown,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      borderColor: "border-purple-600"
    },
    {
      id: "hr_manager",
      name: "RH Manager",
      description: "Gestion du personnel et paie",
      icon: Users,
      color: "bg-rose-600",
      hoverColor: "hover:bg-rose-700",
      borderColor: "border-rose-600"
    },
    {
      id: "manager",
      name: "Manager",
      description: "Management d'équipe et projets",
      icon: UserCheck,
      color: "bg-indigo-600",
      hoverColor: "hover:bg-indigo-700",
      borderColor: "border-indigo-600"
    }
  ];

  useEffect(() => {
    // Récupérer les données utilisateur depuis localStorage
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("user_data");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
        
        // Pré-sélectionner les profils existants
        if (user.profiles && user.profiles.length > 0) {
          setSelectedProfiles(user.profiles);
          setPrimaryProfile(user.primaryProfile || user.profiles[0]);
        }
      }
    }
  }, []);

  const toggleProfile = (profileId: string) => {
    setSelectedProfiles(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      } else {
        return [...prev, profileId];
      }
    });
  };

  const setAsPrimary = (profileId: string) => {
    if (selectedProfiles.includes(profileId)) {
      setPrimaryProfile(profileId);
    }
  };

  const saveProfiles = () => {
    if (selectedProfiles.length === 0) {
      alert("Veuillez sélectionner au moins un profil");
      return;
    }

    if (!primaryProfile) {
      alert("Veuillez sélectionner un profil principal");
      return;
    }

    // Mettre à jour localStorage
    if (typeof window !== "undefined" && userData) {
      const updatedUser = {
        ...userData,
        profiles: selectedProfiles,
        primaryProfile: primaryProfile
      };
      window.localStorage.setItem("user_data", JSON.stringify(updatedUser));
    }

    // Rediriger vers le profil principal
    let redirectTo = '/dashboard';
    switch (primaryProfile) {
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
    }

    router.push(redirectTo);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-800/10"></div>
      
      <div className="relative w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#0D9488] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">BMS ERP</h1>
              <p className="text-blue-400 text-sm">Multi-Profil Selection</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Sélectionnez vos <span className="text-transparent bg-clip-text bg-gradient-to-r text-[#0D9488]">profils</span>
          </h2>
          <p className="text-slate-400">
            Choisissez un ou plusieurs profils adaptés à vos responsabilités
          </p>
        </div>

        {/* Grille des profils */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            const isSelected = selectedProfiles.includes(profile.id);
            const isPrimary = primaryProfile === profile.id;

            return (
              <div
                key={profile.id}
                onClick={() => toggleProfile(profile.id)}
                className={`
                  relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? `${profile.borderColor} bg-slate-800/50` 
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${isSelected ? profile.color : 'bg-slate-700'}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{profile.name}</h3>
                    <p className="text-sm text-slate-400">{profile.description}</p>
                  </div>
                </div>

                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAsPrimary(profile.id);
                    }}
                    className={`
                      w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
                      ${isPrimary 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }
                    `}
                  >
                    {isPrimary ? '✓ Profil Principal' : 'Définir comme principal'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-400">
            {selectedProfiles.length > 0 && (
              <span>{selectedProfiles.length} profil(s) sélectionné(s)</span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              Retour
            </button>
            
            <button
              onClick={saveProfiles}
              disabled={selectedProfiles.length === 0}
              className="px-6 py-3 bg-[#0D9488] text-white rounded-lg font-medium hover:bg-[#0B7C74] transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
