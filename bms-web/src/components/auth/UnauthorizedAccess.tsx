"use client";
import { X, Lock, AlertCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface UnauthorizedAccessProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRoles?: string[];
  resource?: string;
}

export function UnauthorizedAccess({ 
  isOpen, 
  onClose, 
  requiredRoles = ["Admin", "Manager"], 
  resource = "cette page ou cette fonctionnalité" 
}: UnauthorizedAccessProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleContactAdmin = () => {
    // Rediriger vers une page de contact ou ouvrir un email
    window.location.href = "mailto:admin@bms.bj?subject=Demande d'accès";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panda Po qui pleure - Arrière-plan */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="relative animate-float">
          {/* Panda SVG */}
          <svg
            width="300"
            height="300"
            viewBox="0 0 200 200"
            className="animate-shake"
          >
            {/* Corps du panda */}
            <ellipse cx="100" cy="120" rx="50" ry="60" fill="#2D3748" opacity="0.3" />
            
            {/* Tête */}
            <circle cx="100" cy="80" r="45" fill="#F7FAFC" />
            <circle cx="100" cy="80" r="45" fill="url(#pandaGradient)" />
            
            {/* Oreilles */}
            <circle cx="70" cy="55" r="18" fill="#2D3748" />
            <circle cx="130" cy="55" r="18" fill="#2D3748" />
            
            {/* Yeux fermés (tristes) */}
            <ellipse cx="85" cy="75" rx="12" ry="8" fill="#2D3748" />
            <ellipse cx="115" cy="75" rx="12" ry="8" fill="#2D3748" />
            
            {/* Larmes qui tombent */}
            <g className="animate-tears">
              <ellipse cx="85" cy="85" rx="3" ry="6" fill="#60A5FA" opacity="0.7" />
              <ellipse cx="115" cy="85" rx="3" ry="6" fill="#60A5FA" opacity="0.7" />
              <ellipse cx="85" cy="95" rx="2.5" ry="5" fill="#60A5FA" opacity="0.5" />
              <ellipse cx="115" cy="95" rx="2.5" ry="5" fill="#60A5FA" opacity="0.5" />
            </g>
            
            {/* Nez */}
            <ellipse cx="100" cy="88" rx="6" ry="5" fill="#2D3748" />
            
            {/* Bouche triste qui pulse */}
            <path
              d="M 85 100 Q 100 95 115 100"
              stroke="#2D3748"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className="animate-pulse"
            />
            
            {/* Taches noires autour des yeux */}
            <ellipse cx="85" cy="75" rx="15" ry="18" fill="#2D3748" opacity="0.3" />
            <ellipse cx="115" cy="75" rx="15" ry="18" fill="#2D3748" opacity="0.3" />
            
            {/* Dégradé */}
            <defs>
              <linearGradient id="pandaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F7FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Carte de message */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Accès non autorisé
              </h2>
              <p className="text-sm text-slate-600">
                Permissions insuffisantes
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-slate-700">
            Vous n'avez pas les permissions nécessaires pour accéder à{" "}
            <span className="font-semibold text-slate-900">{resource}</span>.
          </p>

          {requiredRoles && requiredRoles.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700 mb-2">
                Rôles requis pour cette action :
              </p>
              <div className="flex flex-wrap gap-2">
                {requiredRoles.map((role, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Besoin d'accès ?</p>
              <p>
                Contactez votre manager ou l'administrateur système pour demander
                les permissions nécessaires.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={handleContactAdmin}
            className="flex-1 px-4 py-2.5 bg-[#0D9488] text-white font-medium rounded-lg hover:bg-[#0B7C74] transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contacter l'admin
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
        }

        @keyframes tears {
          0% {
            opacity: 0;
            transform: translateY(-5px);
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0;
            transform: translateY(15px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }

        .animate-tears {
          animation: tears 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
