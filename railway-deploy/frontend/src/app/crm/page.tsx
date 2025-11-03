'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

export default function CRMDashboard() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeOpportunities: 0,
    totalValue: 0,
    recentActivity: 0,
    byType: {},
    byStatus: {},
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/crm/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord CRM</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Contacts</p>
              <p className="text-3xl font-bold">{stats.totalContacts}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Opportunités</p>
              <p className="text-3xl font-bold">{stats.activeOpportunities}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valeur pipeline</p>
              <p className="text-2xl font-bold">{safeToLocaleString(stats.totalValue)} FCFA</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Activités (7j)</p>
              <p className="text-3xl font-bold">{stats.recentActivity}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="space-y-2">
            <Link href="/crm/contacts/new" className="block p-3 border rounded hover:bg-gray-50 transition">
              + Nouveau contact
            </Link>
            <Link href="/crm/opportunities/new" className="block p-3 border rounded hover:bg-gray-50 transition">
              + Nouvelle opportunité
            </Link>
            <Link href="/crm/contacts" className="block p-3 border rounded hover:bg-gray-50 transition">
               Voir tous les contacts
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Répartition des contacts</h2>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="capitalize">{type}</span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
