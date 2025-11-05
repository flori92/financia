"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  attemptedResource: string | null;
  recordAttempt: (resource: string) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [attemptedResource, setAttemptedResource] = useState<string | null>(null);

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      console.log("🎭 Mode Démo activé - Toutes les fonctionnalités sont bloquées");
    }
  };

  const recordAttempt = (resource: string) => {
    console.log(`🚫 Tentative d'accès bloquée : ${resource}`);
    setAttemptedResource(resource);
  };

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode,
        setDemoMode,
        attemptedResource,
        recordAttempt,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}
