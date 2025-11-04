"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGuard({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Pages publiques qui ne nécessitent pas d'auth
    const publicPaths = ["/login"];
    
    if (pathname && publicPaths.includes(pathname)) {
      setIsChecking(false);
      return;
    }

    // Vérifier le token
    const token = typeof window !== "undefined" 
      ? window.localStorage.getItem("bms_token") 
      : null;

    if (!token) {
      router.push("/login");
      return;
    }

    // Vérifier le rôle si requis
    if (requiredRole) {
      const userRole = typeof window !== "undefined" 
        ? window.localStorage.getItem("bms_user_role") 
        : null;

      if (userRole !== requiredRole) {
        router.push("/unauthorized");
        return;
      }
    }

    setIsChecking(false);
  }, [pathname, router, requiredRole]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return <>{children}</>;
}
