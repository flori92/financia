"use client";
import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { UnauthorizedAccess } from "./UnauthorizedAccess";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  requireAll?: boolean; // Si true, toutes les permissions sont requises. Si false, au moins une suffit
  resource?: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  requireAll = false,
  resource = "cette page",
  fallback,
}: PermissionGuardProps) {
  const { hasAnyPermission, hasAllPermissions, userRole } = usePermissions();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermissions = () => {
      const access = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);

      setHasAccess(access);
      
      if (!access) {
        setShowUnauthorized(true);
      }
    };

    // Attendre que le rôle soit chargé
    if (userRole !== null) {
      checkPermissions();
    }
  }, [userRole, requiredPermissions, requireAll, hasAnyPermission, hasAllPermissions]);

  // Pendant le chargement
  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Vérification des permissions...</div>
      </div>
    );
  }

  // Si pas d'accès
  if (!hasAccess) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-slate-600 mb-4">
                Vous n'avez pas accès à {resource}
              </p>
              <button
                onClick={() => setShowUnauthorized(true)}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
              >
                En savoir plus
              </button>
            </div>
          </div>
        )}
        <UnauthorizedAccess
          isOpen={showUnauthorized}
          onClose={() => setShowUnauthorized(false)}
          requiredRoles={getRequiredRoles(requiredPermissions)}
          resource={resource}
        />
      </>
    );
  }

  // Si accès autorisé
  return <>{children}</>;
}

// Helper pour convertir les permissions en rôles lisibles
function getRequiredRoles(permissions: string[]): string[] {
  const roles = new Set<string>();

  permissions.forEach((perm) => {
    if (perm.startsWith("users:")) {
      roles.add("Administrateur");
      roles.add("Manager");
    } else if (perm.startsWith("accounting:")) {
      roles.add("Administrateur");
      roles.add("Manager");
      roles.add("Comptable");
    } else if (perm.startsWith("settings:write")) {
      roles.add("Administrateur");
    } else if (perm.startsWith("companies:write")) {
      roles.add("Administrateur");
    }
  });

  return Array.from(roles);
}
