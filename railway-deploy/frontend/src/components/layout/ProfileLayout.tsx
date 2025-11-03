// Layout principal avec sidebar dynamique selon profil
"use client";

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ExpertSidebar } from '@/components/navigation/ExpertSidebar';
import { EntrepreneurSidebar } from '@/components/navigation/EntrepreneurSidebar';
import { BankSidebar } from '@/components/navigation/BankSidebar';
import { FiscalSidebar } from '@/components/navigation/FiscalSidebar';

interface ProfileLayoutProps {
  children: ReactNode;
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const { userRole } = usePermissions();

  const renderSidebar = () => {
    switch (userRole) {
      case 'expert-comptable':
        return <ExpertSidebar />;
      case 'entrepreneur':
        return <EntrepreneurSidebar />;
      case 'bank':
        return <BankSidebar />;
      case 'fiscal':
        return <FiscalSidebar />;
      default:
        return <ExpertSidebar />; // Fallback
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar dynamique */}
      <div className="w-64 border-r border-app-border bg-white">
        {renderSidebar()}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
