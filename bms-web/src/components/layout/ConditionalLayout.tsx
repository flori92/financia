"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AuthGuard } from "../auth/AuthGuard";
import { UserProfileProvider } from '@/components/user-profile/user-profile-provider';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutPages = ['/', '/login', '/register', '/reset-password'];

  if (noLayoutPages.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <UserProfileProvider>
        <Sidebar />
        <div className="ml-20 transition-all duration-300">
          <Topbar />
          <main className="p-6 max-w-[1280px] mx-auto">{children}</main>
        </div>
      </UserProfileProvider>
    </AuthGuard>
  );
}
