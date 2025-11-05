"use client";
import { useEffect, useState } from "react";

// Définition des permissions par rôle
const ROLE_PERMISSIONS: Record<string, string[]> = {
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
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = window.localStorage.getItem("user_role") || "user";
      setUserRole(role);
      setPermissions(ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user);
    }
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((perm) => permissions.includes(perm));
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
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    isAccountant,
  };
}
