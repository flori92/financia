import "../styles/globals.css";
import type { Metadata } from "next";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "BMS Web",
  description: "Business Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-app-bg text-slate-900">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
