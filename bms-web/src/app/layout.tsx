import "../styles/globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export const metadata: Metadata = {
  title: "BMS Web",
  description: "Business Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-app-bg text-slate-900">
        <Sidebar />
        <div className="ml-sidebar">
          <Topbar />
          <main className="p-6 max-w-[1280px] mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
