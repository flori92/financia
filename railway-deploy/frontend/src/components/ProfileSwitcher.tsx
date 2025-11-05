"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Calculator, 
  Briefcase, 
  Crown, 
  Users, 
  UserCheck, 
  Receipt,
  ChevronDown,
  CheckCircle
} from "lucide-react";

interface ProfileSwitcherProps {
  currentProfile?: string;
  profiles?: string[];
  primaryProfile?: string;
}

export default function ProfileSwitcher({ 
  currentProfile = 'entrepreneur',
  profiles = ['entrepreneur'],
  primaryProfile = 'entrepreneur'
}: ProfileSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const profileConfig = {
    expert_comptable: { name: 'Expert Comptable', icon: Calculator, color: 'text-blue-400' },
    entrepreneur: { name: 'Entrepreneur', icon: Briefcase, color: 'text-emerald-400' },
    administration_fiscal: { name: 'Administration Fiscale', icon: Receipt, color: 'text-amber-400' },
    admin: { name: 'Administrateur', icon: Crown, color: 'text-purple-400' },
    hr_manager: { name: 'RH Manager', icon: Users, color: 'text-rose-400' },
    manager: { name: 'Manager', icon: UserCheck, color: 'text-indigo-400' }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = window.localStorage.getItem("user_data");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
      }
    }
  }, []);

  const switchProfile = (profileId: string) => {
    if (!userData) return;

    // Mettre à jour le profil principal
    const updatedUser = {
      ...userData,
      primaryProfile: profileId
    };
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem("user_data", JSON.stringify(updatedUser));
    }

    // Rediriger vers le nouveau profil
    let redirectTo = '/dashboard';
    switch (profileId) {
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
    setIsOpen(false);
  };

  const currentConfig = profileConfig[currentProfile as keyof typeof profileConfig] || profileConfig.entrepreneur;
  const CurrentIcon = currentConfig.icon;

  // Si l'utilisateur n'a qu'un seul profil, ne pas afficher le switcher
  if (profiles.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg">
        <CurrentIcon className={`w-4 h-4 ${currentConfig.color}`} />
        <span className="text-sm text-white">{currentConfig.name}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
      >
        <CurrentIcon className={`w-4 h-4 ${currentConfig.color}`} />
        <span className="text-sm text-white">{currentConfig.name}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs text-slate-400 px-3 py-2 mb-2">
              Vos profils disponibles
            </div>
            
            {profiles.map((profileId) => {
              const config = profileConfig[profileId as keyof typeof profileConfig] || profileConfig.entrepreneur;
              const Icon = config.icon;
              const isActive = profileId === currentProfile;
              const isPrimary = profileId === primaryProfile;

              return (
                <button
                  key={profileId}
                  onClick={() => switchProfile(profileId)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{config.name}</span>
                      {isPrimary && (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                    {isPrimary && (
                      <div className="text-xs text-slate-400">Profil principal</div>
                    )}
                  </div>
                </button>
              );
            })}
            
            <div className="border-t border-slate-700 mt-2 pt-2">
              <button
                onClick={() => router.push('/profile-selection')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Gérer mes profils
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
