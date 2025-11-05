"use client";

import { DemoModeProvider } from "@/contexts/DemoModeContext";

export default function DemoPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoModeProvider>
      {children}
    </DemoModeProvider>
  );
}
