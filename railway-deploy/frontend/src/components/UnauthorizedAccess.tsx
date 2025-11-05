"use client";

import { useState, useEffect } from "react";
import { X, Lock, AlertCircle, Mail, ArrowLeft } from "lucide-react";

interface UnauthorizedAccessProps {
  isOpen: boolean;
  onClose: () => void;
  requiredRoles?: string[];
  currentRole?: string;
  resourceName?: string;
  onContactAdmin?: () => void;
}

export default function UnauthorizedAccess({
  isOpen,
  onClose,
  requiredRoles = ["Admin", "Manager"],
  currentRole = "Employé",
  resourceName = "cette page ou cette fonctionnalité",
  onContactAdmin,
}: UnauthorizedAccessProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Bloquer le scroll du body
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Overlay avec dégradé vert BMS */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0D9488]/20 via-[#0D9488]/10 to-emerald-500/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
        {/* Po le Panda qui pleure */}
        <div className="relative animate-float">
          <SadPandaPo />
        </div>

        {/* Carte d'accès refusé */}
        <div
          className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full transform transition-all duration-500 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          {/* Icône cadenas */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Accès non autorisé
              </h2>
              <p className="text-gray-600">Permissions insuffisantes</p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Désolé, vous n'avez pas les permissions nécessaires pour accéder à{" "}
              <span className="font-semibold text-[#0D9488]">{resourceName}</span>.
            </p>

            {/* Rôles */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">
                    Rôles requis pour cette action :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {requiredRoles.map((role, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#0D9488] text-white text-sm rounded-full font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Votre rôle actuel :</span>
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                  {currentRole}
                </span>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Besoin d'accès ?</span>
                  <br />
                  Contactez votre manager ou l'administrateur système pour demander
                  les permissions nécessaires.
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            <button
              onClick={() => {
                if (onContactAdmin) {
                  onContactAdmin();
                } else {
                  // Ouvrir le client email par défaut
                  window.location.href = "mailto:admin@bms-erp.com?subject=Demande d'accès";
                }
              }}
              className="flex-1 px-6 py-3 bg-[#0D9488] hover:bg-[#0B7C74] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Contacter l'admin
            </button>
          </div>
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

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite, shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Composant Po le Panda qui pleure
function SadPandaPo() {
  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-2xl"
    >
      {/* Larmes animées */}
      <defs>
        <linearGradient id="tearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Larme gauche */}
      <ellipse cx="65" cy="90" rx="4" ry="6" fill="url(#tearGradient)">
        <animate
          attributeName="cy"
          values="90;140;90"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Larme droite */}
      <ellipse cx="135" cy="95" rx="4" ry="6" fill="url(#tearGradient)">
        <animate
          attributeName="cy"
          values="95;145;95"
          dur="2.3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0;1"
          dur="2.3s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Corps du panda - blanc */}
      <ellipse cx="100" cy="120" rx="60" ry="70" fill="#FFFFFF" />

      {/* Tête du panda - blanc */}
      <circle cx="100" cy="80" r="50" fill="#FFFFFF" />

      {/* Oreilles - noires */}
      <ellipse cx="65" cy="50" rx="18" ry="20" fill="#2D3748" />
      <ellipse cx="135" cy="50" rx="18" ry="20" fill="#2D3748" />

      {/* Yeux - patches noirs */}
      <ellipse cx="75" cy="75" rx="15" ry="18" fill="#2D3748" />
      <ellipse cx="125" cy="75" rx="15" ry="18" fill="#2D3748" />

      {/* Yeux - blancs (tristes et fermés) */}
      <ellipse cx="75" cy="78" rx="8" ry="4" fill="#FFFFFF">
        <animate
          attributeName="ry"
          values="4;6;4"
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>
      <ellipse cx="125" cy="78" rx="8" ry="4" fill="#FFFFFF">
        <animate
          attributeName="ry"
          values="4;6;4"
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Sourcils tristes */}
      <path
        d="M 60 68 Q 75 62 85 68"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 115 68 Q 125 62 140 68"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nez - noir */}
      <ellipse cx="100" cy="95" rx="8" ry="6" fill="#2D3748" />

      {/* Bouche triste qui pulse */}
      <path
        d="M 85 110 Q 100 105 115 110"
        stroke="#2D3748"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      >
        <animate
          attributeName="d"
          values="M 85 110 Q 100 105 115 110;M 85 110 Q 100 107 115 110;M 85 110 Q 100 105 115 110"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>

      {/* Ventre - patch blanc avec cercle */}
      <ellipse cx="100" cy="140" rx="35" ry="40" fill="#F7FAFC" />

      {/* Bras gauche */}
      <ellipse
        cx="60"
        cy="130"
        rx="12"
        ry="35"
        fill="#FFFFFF"
        transform="rotate(-20 60 130)"
      />

      {/* Bras droit */}
      <ellipse
        cx="140"
        cy="130"
        rx="12"
        ry="35"
        fill="#FFFFFF"
        transform="rotate(20 140 130)"
      />

      {/* Pattes - noires */}
      <ellipse cx="80" cy="175" rx="15" ry="12" fill="#2D3748" />
      <ellipse cx="120" cy="175" rx="15" ry="12" fill="#2D3748" />
    </svg>
  );
}
