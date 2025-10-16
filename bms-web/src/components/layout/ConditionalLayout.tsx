"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AuthGuard } from "../auth/AuthGuard";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <Sidebar />
      <div className="ml-sidebar">
        <Topbar />
        <main className="p-6 max-w-[1280px] mx-auto">{children}</main>
      </div>
    </AuthGuard>
  );
}
