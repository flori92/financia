import "../styles/globals.css";
import type { Metadata } from "next";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "BMS Web",
  description: "Business Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#FAFBFC] text-slate-900">
        <SessionProvider>
          <ModernLayout>{children}</ModernLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
