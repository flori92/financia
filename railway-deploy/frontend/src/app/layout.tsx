import "../styles/globals.css";
import type { Metadata } from "next";
import { ModernLayout } from "@/components/layout/ModernLayout";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

export const metadata: Metadata = {
  title: "BMS Web",
  description: "Business Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>BMS Web</title>
        <meta name="description" content="Business Management System" />
        <meta name="build-version" content="v3.0-critical-fix" />
        <meta name="build-timestamp" content={Date.now().toString()} />
      </head>
      <body className="min-h-screen bg-[#FAFBFC] text-slate-900">
        <SessionProvider>
          <ToastProvider>
            <ModernLayout>{children}</ModernLayout>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
