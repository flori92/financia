'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, FileText, Award, Bell } from 'lucide-react';

interface EntrepreneurData {
  sales: number;
  salesGrowth: number;
  expenses: number;
  expensesGrowth: number;
  customers: number;
  newCustomers: number;
  creditScore: number;
  nif: string;
  rccm: string;
  taxRegime: string;
  legalStatus: string;
  recentTransactions: Array<{id: string; type: string; description: string; amount: number; date: string}>;
  notifications: Array<{id: string; type: string; title: string; message: string}>;
}

export default function EntrepreneurDashboard() {
  const [data, setData] = useState<EntrepreneurData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/entrepreneur/dashboard')
      .then(r => r.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Entrepreneur</h1>
          <p className="text-gray-600">Vue d'ensemble de votre activité</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <FileText className="w-4 h-4 mr-2" />
          Nouvelle Transaction
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ventes du Mois</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.sales?.toLocaleString()} FCFA</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +{data?.salesGrowth}% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <ShoppingCart className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.expenses?.toLocaleString()} FCFA</div>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" />
              {data?.expensesGrowth}% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.customers}</div>
            <p className="text-xs text-gray-600 mt-1">+{data?.newCustomers} ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score Crédit</CardTitle>
            <Award className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.creditScore}/100</div>
            <p className="text-xs text-purple-600 mt-1">Excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Statut Formalisation */}
      <Card>
        <CardHeader>
          <CardTitle>Statut de Formalisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium">NIF Obtenu</p>
                  <p className="text-sm text-gray-600">Numéro: {data?.nif}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">Actif</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">RCCM</p>
                <p className="font-medium">{data?.rccm || 'En cours'}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Régime Fiscal</p>
                <p className="font-medium">{data?.taxRegime}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Statut Juridique</p>
                <p className="font-medium">{data?.legalStatus}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.recentTransactions?.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'sale' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'sale' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className={`font-bold ${transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'sale' ? '+' : '-'}{transaction.amount.toLocaleString()} FCFA
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertes et Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.notifications?.map((notif) => (
              <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${
                notif.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                notif.type === 'info' ? 'bg-blue-50 border-blue-500' :
                'bg-green-50 border-green-500'
              }`}>
                <p className="font-medium text-sm">{notif.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
