'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Client {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastActivity: string;
  industry: string;
}

interface ExpertContextType {
  selectedClient: Client | null;
  clients: Client[];
  isExpertMode: boolean;
  selectClient: (client: Client | null) => void;
  addClient: (client: Client) => void;
  removeClient: (clientId: string) => void;
  switchToExpertMode: () => void;
  switchToClientMode: () => void;
}

const ExpertContext = createContext<ExpertContextType | undefined>(undefined);

export function ExpertProvider({ children }: { children: ReactNode }) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isExpertMode, setIsExpertMode] = useState(true);
  
  // Mock data pour les clients de l'expert
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
      name: 'SARL Tech Solutions',
      email: 'contact@techsolutions.bj',
      status: 'active',
      lastActivity: '2025-01-15',
      industry: 'Technologies'
    },
    {
      id: '2a8f9d42-8bfe-45a7-9b12-283476bf09a8',
      name: 'EURL Commerce Plus',
      email: 'info@commerceplus.bj',
      status: 'active',
      lastActivity: '2025-01-14',
      industry: 'Commerce'
    },
    {
      id: '3c9a0e53-9cdf-56b8-ac23-394587cg10b9',
      name: 'SA Industries Modernes',
      email: 'contact@industries.bj',
      status: 'active',
      lastActivity: '2025-01-13',
      industry: 'Industrie'
    }
  ]);

  const selectClient = (client: Client | null) => {
    setSelectedClient(client);
    if (client) {
      // Stocker le client sélectionné pour l'utiliser dans les APIs
      localStorage.setItem('expert_selected_client_id', client.id);
      localStorage.setItem('expert_selected_client_name', client.name);
    } else {
      localStorage.removeItem('expert_selected_client_id');
      localStorage.removeItem('expert_selected_client_name');
    }
  };

  const addClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };

  const removeClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    if (selectedClient?.id === clientId) {
      selectClient(null);
    }
  };

  const switchToExpertMode = () => {
    setIsExpertMode(true);
    selectClient(null);
  };

  const switchToClientMode = () => {
    setIsExpertMode(false);
  };

  return (
    <ExpertContext.Provider value={{
      selectedClient,
      clients,
      isExpertMode,
      selectClient,
      addClient,
      removeClient,
      switchToExpertMode,
      switchToClientMode
    }}>
      {children}
    </ExpertContext.Provider>
  );
}

export function useExpert() {
  const context = useContext(ExpertContext);
  if (context === undefined) {
    throw new Error('useExpert must be used within an ExpertProvider');
  }
  return context;
}
