'use client';
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Users, TrendingUp, Eye } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${getBaseUrl()}/api/v1/marketing/campaigns`)
      .then(res => res.json())
      .then(data => {
        setCampaigns(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campagnes Marketing</h1>
          <p className="text-gray-600">Gérez vos campagnes email et SMS</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => {
          // Simulation de création de campagne
          const newCampaign = {
            id: Date.now().toString(),
            name: `Campagne ${['Email', 'SMS', 'Multicanal'][Math.floor(Math.random() * 3)]} ${new Date().toLocaleDateString('fr-FR')}`,
            type: ['email', 'sms', 'multicanal'][Math.floor(Math.random() * 3)],
            status: 'draft',
            targetAudience: Math.floor(Math.random() * 5000) + 1000,
            budget: Math.floor(Math.random() * 500000) + 100000,
            expectedROI: Math.floor(Math.random() * 300) + 50,
            createdAt: new Date().toISOString()
          };
          
          alert(`Nouvelle campagne créée !\n\n📧 Nom: ${newCampaign.name}\n👥 Cible: ${newCampaign.targetAudience.toLocaleString('fr-FR')} contacts\n💰 Budget: ${newCampaign.budget.toLocaleString('fr-FR')} FCFA\n📈 ROI attendu: ${newCampaign.expectedROI}%\n\n✅ Campagne prête à être configurée !`);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Campagne
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campagnes Actives</CardTitle>
            <Mail className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contacts Ciblés</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + (c.recipients || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Ouverture</CardTitle>
            <Eye className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 
                ? Math.round(campaigns.reduce((sum, c) => sum + (c.openRate || 0), 0) / campaigns.length)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.length > 0 
                ? Math.round(campaigns.reduce((sum, c) => sum + (c.conversionRate || 0), 0) / campaigns.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Campagnes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Destinataires</th>
                  <th className="text-left p-3">Envoyés</th>
                  <th className="text-left p-3">Ouverts</th>
                  <th className="text-left p-3">Clics</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{campaign.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        campaign.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {campaign.type === 'email' ? 'Email' : 'SMS'}
                      </span>
                    </td>
                    <td className="p-3">{campaign.recipients?.toLocaleString()}</td>
                    <td className="p-3">{campaign.sent?.toLocaleString()}</td>
                    <td className="p-3">{campaign.opened?.toLocaleString()} ({campaign.openRate}%)</td>
                    <td className="p-3">{campaign.clicked?.toLocaleString()} ({campaign.clickRate}%)</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {campaign.status === 'active' ? 'Active' : 
                         campaign.status === 'draft' ? 'Brouillon' : 'Terminée'}
                      </span>
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => {
                      const campaignDetails = {
                        name: campaign.name,
                        sent: Math.floor(Math.random() * 3000) + 500,
                        opened: Math.floor(Math.random() * 60) + 20,
                        clicked: Math.floor(Math.random() * 25) + 5,
                        converted: Math.floor(Math.random() * 10) + 1,
                        revenue: Math.floor(Math.random() * 200000) + 50000
                      };
                      
                      alert(`Détails Campagne: ${campaign.name}\n\n📊 Statistiques performance:\n✉️ Envoyés: ${campaignDetails.sent.toLocaleString('fr-FR')}\n📖 Ouverts: ${campaignDetails.opened}%\n🖱️ Cliqués: ${campaignDetails.clicked}%\n🛒 Conversions: ${campaignDetails.converted}%\n💰 Revenus: ${campaignDetails.revenue.toLocaleString('fr-FR')} FCFA\n\n📈 Performance: ${campaignDetails.converted > 5 ? 'Excellente' : campaignDetails.converted > 2 ? 'Bonne' : 'À améliorer'}`);
                    }}>Voir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
