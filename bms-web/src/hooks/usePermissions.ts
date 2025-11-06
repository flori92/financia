"use client";
import { useEffect, useState } from "react";

// Définition des permissions fallback par rôle (legacy)
const LEGACY_ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    "users:read",
    "users:write",
    "users:delete",
    "companies:read",
    "companies:write",
    "settings:read",
    "settings:write",
    "accounting:read",
    "accounting:write",
    "treasury:read",
    "treasury:write",
    "invoices:read",
    "invoices:write",
    "crm:read",
    "crm:write",
  ],
  manager: [
    "users:read",
    "companies:read",
    "settings:read",
    "accounting:read",
    "accounting:write",
    "treasury:read",
    "treasury:write",
    "invoices:read",
    "invoices:write",
    "crm:read",
    "crm:write",
  ],
  accountant: [
    "accounting:read",
    "accounting:write",
    "treasury:read",
    "invoices:read",
    "invoices:write",
  ],
  user: [
    "invoices:read",
    "crm:read",
  ],
};

export function usePermissions() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionSet, setPermissionSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const fallbackRole = window.localStorage.getItem("user_role") || "user";
    let resolvedRole = fallbackRole;
    const detectedRoles: string[] = [];
    const permissionAccumulator = new Set<string>();

    const rawUserData = window.localStorage.getItem("user_data");

    if (rawUserData) {
      try {
        const parsed = JSON.parse(rawUserData);

        if (parsed?.role && typeof parsed.role === "string") {
          resolvedRole = parsed.role;
        }

        if (Array.isArray(parsed?.profiles)) {
          parsed.profiles.forEach((profile: string) => {
            if (typeof profile === "string") {
              detectedRoles.push(profile);
            }
          });
        }

        if (Array.isArray(parsed?.roles)) {
          parsed.roles.forEach((rbacRole: any) => {
            if (rbacRole?.name) {
              detectedRoles.push(String(rbacRole.name));
            }

            if (Array.isArray(rbacRole?.permissions)) {
              rbacRole.permissions.forEach((permission: any) => {
                const resource = permission?.resource;
                const action = permission?.action;
                if (resource && action) {
                  permissionAccumulator.add(`${resource}:${action}`);
                }
              });
            }
          });
        }

        if (Array.isArray(parsed?.permissions)) {
          parsed.permissions.forEach((permission: any) => {
            if (typeof permission === "string") {
              permissionAccumulator.add(permission);
            } else if (permission?.resource && permission?.action) {
              permissionAccumulator.add(`${permission.resource}:${permission.action}`);
            }
          });
        }
      } catch (error) {
        console.warn("usePermissions: impossible de parser user_data", error);
      }
    }

    if (permissionAccumulator.size === 0) {
      const legacyPermissions = LEGACY_ROLE_PERMISSIONS[resolvedRole] || LEGACY_ROLE_PERMISSIONS[fallbackRole] || LEGACY_ROLE_PERMISSIONS.user;
      legacyPermissions.forEach((perm) => permissionAccumulator.add(perm));
    }

    if (detectedRoles.length === 0) {
      detectedRoles.push(resolvedRole);
    }

    setUserRole(resolvedRole);
    const uniqueRoles = Array.from(new Set(detectedRoles));
    setRoles(uniqueRoles);
    const permissionList = Array.from(permissionAccumulator);
    setPermissions(permissionList);
    setPermissionSet(new Set(permissionList));
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissionSet.has(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((perm) => permissionSet.has(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((perm) => permissionSet.has(perm));
  };

  const isAdmin = (): boolean => {
    return userRole === "admin";
  };

  const isManager = (): boolean => {
    return userRole === "manager";
  };

  const isAccountant = (): boolean => {
    return userRole === "accountant";
  };

  return {
    userRole,
    roles,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    isAccountant,
  };
}
