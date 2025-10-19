"use client";
import { usePathname } from "next/navigation";
import { ModernSidebar } from "./ModernSidebar";
import { ModernTopbar } from "./ModernTopbar";
import { AuthGuard } from "../auth/AuthGuard";

export function ModernLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutPages = ['/', '/login', '/register', '/reset-password'];

  if (pathname && noLayoutPages.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#FAFBFC]">
        <ModernSidebar />
        <div className="flex-1 ml-[72px] transition-all duration-300">
          <ModernTopbar />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
