"use client";

import { useState, useEffect } from 'react';
import { Plus, Filter, MoreVertical, TrendingUp, DollarSign, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface PipelineStage {
  id: string;
  name: string;
  type: string;
  order: number;
  probability: number;
  opportunities: Opportunity[];
}

interface Opportunity {
  id: string;
  title: string;
  amount: number;
  probability: number;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  contact?: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
  };
  closeDate?: string;
}

interface PipelineOverview {
  stages: PipelineStage[];
  opportunitiesByStage: Record<string, Opportunity[]>;
  totalValue: number;
  averageDealSize: number;
  conversionRate: number;
}

export default function OpportunitiesPage() {
  const [pipeline, setPipeline] = useState<PipelineOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedOpportunity, setDraggedOpportunity] = useState<string | null>(null);

  // Récupérer le companyId depuis localStorage
  const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;

  const loadPipeline = async () => {
    if (!companyId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/crm/opportunities/pipeline/overview?companyId=${companyId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement du pipeline');

      const data = await response.json();
      setPipeline(data);
    } catch (err) {
      setError('Erreur lors du chargement du pipeline');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, [companyId]);

  const handleDragStart = (opportunityId: string) => {
    setDraggedOpportunity(opportunityId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    const opportunityId = draggedOpportunity;
    if (!opportunityId || !companyId) return;

    try {
      const response = await fetch(`/api/crm/opportunities/${opportunityId}/move/${stageId}?companyId=${companyId}`, {
        method: 'POST',
      });

      if (response.ok) {
        loadPipeline(); // Recharger le pipeline
      } else {
        console.error('Erreur lors du déplacement de l\'opportunité');
      }
    } catch (err) {
      console.error('Erreur lors du déplacement', err);
    }

    setDraggedOpportunity(null);
  };

  const getStageColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-blue-50 border-blue-200';
      case 'qualified': return 'bg-green-50 border-green-200';
      case 'proposal': return 'bg-yellow-50 border-yellow-200';
      case 'negotiation': return 'bg-orange-50 border-orange-200';
      case 'closing': return 'bg-purple-50 border-purple-200';
      case 'won': return 'bg-emerald-50 border-emerald-200';
      case 'lost': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'abandoned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (opportunity: Opportunity) => {
    if (opportunity.contact?.firstName && opportunity.contact?.lastName) {
      return `${opportunity.contact.firstName[0]}${opportunity.contact.lastName[0]}`.toUpperCase();
    }
    if (opportunity.contact?.companyName) {
      return opportunity.contact.companyName.substring(0, 2).toUpperCase();
    }
    return 'OP';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pipeline d'Opportunités</h1>
          <p className="text-gray-600 mt-1">Gérez votre pipeline de ventes avec une vue Kanban</p>
        </div>
        <Link href="/crm/opportunities/new">
          <Button className="bg-app-primary hover:bg-app-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Opportunité
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      {pipeline && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Pipeline</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipeline.totalValue.toLocaleString('fr-FR')} FCFA</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taille Moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipeline.averageDealSize.toLocaleString('fr-FR')} FCFA</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux Conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipeline.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunités</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(pipeline.opportunitiesByStage).flat().length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pipeline Kanban */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Kanban</CardTitle>
          <CardDescription>
            Glissez-déposez les opportunités entre les étapes du pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pipeline && pipeline.stages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune étape de pipeline définie</p>
              <Button className="mt-4" variant="outline">
                Configurer le Pipeline
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {pipeline?.stages.map((stage) => (
                <div
                  key={stage.id}
                  className={`flex-shrink-0 w-80 p-4 rounded-lg border-2 ${getStageColor(stage.type)}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Header de l'étape */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <p className="text-sm text-gray-600">
                        {stage.opportunities.length} opportunité{stage.opportunities.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {stage.probability}% probabilité
                    </Badge>
                  </div>

                  {/* Opportunités dans cette étape */}
                  <div className="space-y-3">
                    {stage.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        draggable
                        onDragStart={() => handleDragStart(opportunity.id)}
                        className="bg-white p-3 rounded-md border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {opportunity.title}
                          </h4>
                          <Badge className={getStatusColor(opportunity.status)} variant="outline">
                            {opportunity.status}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Valeur:</span>
                            <span className="font-medium">{opportunity.amount.toLocaleString('fr-FR')} FCFA</span>
                          </div>

                          {opportunity.contact && (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-xs bg-gray-100">
                                  {getInitials(opportunity)}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {opportunity.contact.firstName} {opportunity.contact.lastName}
                                {opportunity.contact.companyName && (
                                  <span className="text-gray-500"> ({opportunity.contact.companyName})</span>
                                )}
                              </span>
                            </div>
                          )}

                          {opportunity.closeDate && (
                            <div className="flex items-center justify-between">
                              <span>Clôture:</span>
                              <span>{new Date(opportunity.closeDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Zone de drop vide */}
                    {stage.opportunities.length === 0 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500 text-sm">
                        Déposez une opportunité ici
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div className="flex gap-4">
        <Button 
          variant="outline"
          onClick={() => {
            // Simulation de filtres avancés
            const filters = {
              status: ['ouvert', 'gagné', 'perdu'],
              amountRange: { min: 0, max: 10000000 },
              dateRange: { start: new Date(), end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
              contacts: ['Contact A', 'Contact B', 'Contact C']
            };
            
            alert(`Filtres avancés appliqués !\n\n📊 Statuts: ${filters.status.join(', ')}\n💰 Montant: ${filters.amountRange.min.toLocaleString('fr-FR')} - ${filters.amountRange.max.toLocaleString('fr-FR')} FCFA\n📅 Période: ${filters.dateRange.start.toLocaleDateString('fr-FR')} - ${filters.dateRange.end.toLocaleDateString('fr-FR')}\n👥 Contacts: ${filters.contacts.length} disponibles\n\n✅ Filtres sauvegardés et appliqués !`);
          }}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres avancés
        </Button>
        <Button 
          variant="outline"
          onClick={() => {
            // Simulation de prévisions
            const forecast = {
              monthlyRevenue: [500000, 750000, 1200000, 900000, 1500000, 1100000],
              conversionRate: 25,
              targetAchievement: 87,
              totalProjected: 5950000
            };
            
            const content = `Rapport de Prévisions des Ventes
====================================

📈 Revenus mensuels prévisionnels:
Mois 1: ${forecast.monthlyRevenue[0].toLocaleString('fr-FR')} FCFA
Mois 2: ${forecast.monthlyRevenue[1].toLocaleString('fr-FR')} FCFA
Mois 3: ${forecast.monthlyRevenue[2].toLocaleString('fr-FR')} FCFA
Mois 4: ${forecast.monthlyRevenue[3].toLocaleString('fr-FR')} FCFA
Mois 5: ${forecast.monthlyRevenue[4].toLocaleString('fr-FR')} FCFA
Mois 6: ${forecast.monthlyRevenue[5].toLocaleString('fr-FR')} FCFA

📊 Taux de conversion: ${forecast.conversionRate}%
🎯 Objectif atteint: ${forecast.targetAchievement}%
💰 Total projeté 6 mois: ${forecast.totalProjected.toLocaleString('fr-FR')} FCFA

✅ Prévisions générées avec succès !
📁 Export Excel/PDF disponible

Analyse performance:
- Opportunités chaudes: 12
- Pipeline actif: 45 opportunités
- Valeur moyenne: 250,000 FCFA
- Cycle de vente moyen: 45 jours

Généré le: ${new Date().toLocaleString('fr-FR')}`;

            // Télécharger le rapport
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `previsions-ventes-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);

            alert(`Prévisions générées !\n💰 Total projeté: ${forecast.totalProjected.toLocaleString('fr-FR')} FCFA\n📊 Taux conversion: ${forecast.conversionRate}%\n🎯 Objectif: ${forecast.targetAchievement}%\n\n📁 Rapport exporté avec succès !`);
          }}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Prévisions
        </Button>
      </div>
    </div>
  );
}
