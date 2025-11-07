"use client";

import { useState, useEffect } from 'react';
import { apiGet, apiPost, getCompanyId } from '@/lib/api';
import { 
  Plus, 
  Filter, 
  MoreVertical, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react';
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
  stageId?: string;
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
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const companyId = getCompanyId();

  const loadPipeline = async () => {
    if (!companyId) {
      setError("Aucune société sélectionnée");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/crm/opportunities/pipeline/overview?companyId=${companyId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement du pipeline');

      const data = await response.json();
      setPipeline(data);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du chargement du pipeline');
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
        loadPipeline();
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
      case 'qualified': return 'bg-emerald-50 border-emerald-200';
      case 'proposal': return 'bg-amber-50 border-amber-200';
      case 'negotiation': return 'bg-orange-50 border-orange-200';
      case 'closing': return 'bg-purple-50 border-purple-200';
      case 'won': return 'bg-emerald-50 border-emerald-200';
      case 'lost': return 'bg-rose-50 border-rose-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getStageGradient = (type: string) => {
    switch (type) {
      case 'lead': return 'from-blue-500 to-blue-600';
      case 'qualified': return 'from-emerald-500 to-emerald-600';
      case 'proposal': return 'from-amber-500 to-amber-600';
      case 'negotiation': return 'from-orange-500 to-orange-600';
      case 'closing': return 'from-purple-500 to-purple-600';
      case 'won': return 'from-emerald-500 to-emerald-600';
      case 'lost': return 'from-rose-500 to-rose-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'won': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'lost': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'abandoned': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du pipeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Erreur</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadPipeline}
            className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-lg hover:from-[#0B7C74] hover:to-[#0A6B66] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header moderne */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D9488] via-[#0B7C74] to-[#0A6B66] p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Pipeline d'Opportunités</h1>
              <p className="text-white/90 text-lg">Gérez votre pipeline de ventes avec une vue Kanban interactive</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadPipeline}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
              <Link href="/crm/opportunities/new">
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold">
                  <Plus className="w-5 h-5" />
                  Nouvelle Opportunité
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {pipeline && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Valeur Pipeline</div>
              <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
                {(pipeline.totalValue / 1000000).toFixed(1)}M
              </div>
              <div className="text-white/70 text-xs">FCFA</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Taille Moyenne</div>
              <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
                {(pipeline.averageDealSize / 1000000).toFixed(1)}M
              </div>
              <div className="text-white/70 text-xs">FCFA</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Taux Conversion</div>
              <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
                {pipeline.conversionRate.toFixed(1)}%
              </div>
              <div className="text-white/70 text-xs">Taux de réussite</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">Opportunités</div>
              <div className="text-4xl font-bold text-white tracking-tight tabular-nums mb-1">
                {Object.values(pipeline.opportunitiesByStage).flat().length}
              </div>
              <div className="text-white/70 text-xs">En cours</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Kanban */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-1">Pipeline Kanban</h3>
          <p className="text-slate-600 text-sm">Glissez-déposez les opportunités entre les étapes du pipeline</p>
        </div>
        {pipeline && pipeline.stages.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Activity className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium mb-2">Aucune étape de pipeline définie</p>
            <p className="text-sm mb-6">Configurez votre pipeline pour commencer</p>
            <button className="px-6 py-3 bg-gradient-to-r from-[#0D9488] to-[#0B7C74] text-white rounded-lg hover:from-[#0B7C74] hover:to-[#0A6B66] shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
              Configurer le Pipeline
            </button>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {pipeline?.stages.map((stage) => {
              const stageValue = stage.opportunities.reduce((sum, opp) => sum + opp.amount, 0);
              
              return (
                <div
                  key={stage.id}
                  className={`flex-shrink-0 w-80 p-4 rounded-xl border-2 transition-all duration-300 ${
                    getStageColor(stage.type)
                  } ${hoveredStage === stage.id ? 'shadow-xl scale-105' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  onMouseEnter={() => setHoveredStage(stage.id)}
                  onMouseLeave={() => setHoveredStage(null)}
                >
                  {/* Header de l'étape */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStageGradient(stage.type)}`}></div>
                        <h3 className="font-bold text-slate-900">{stage.name}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="font-medium">{stage.opportunities.length} opportunité{stage.opportunities.length > 1 ? 's' : ''}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">{(stageValue / 1000000).toFixed(1)}M FCFA</span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">{stage.probability}%</span>
                    </div>
                  </div>

                  {/* Opportunités dans cette étape */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
                    {stage.opportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        draggable
                        onDragStart={() => handleDragStart(opportunity.id)}
                        className="group bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-move hover:shadow-lg transition-all duration-200 hover:border-[#0D9488]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-slate-900 text-sm flex-1">
                            {opportunity.title}
                          </h4>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(opportunity.status)}`}>
                            {opportunity.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Valeur:</span>
                            <span className="font-bold text-slate-900">{(opportunity.amount / 1000).toFixed(0)}K FCFA</span>
                          </div>

                          {opportunity.contact && (
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                              <div className="w-6 h-6 bg-gradient-to-br from-[#0D9488] to-[#0B7C74] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(opportunity)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 truncate">
                                  {opportunity.contact.firstName} {opportunity.contact.lastName}
                                </div>
                                {opportunity.contact.companyName && (
                                  <div className="text-slate-500 truncate text-xs">
                                    {opportunity.contact.companyName}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {opportunity.closeDate && (
                            <div className="flex items-center gap-2 text-slate-600 pt-2 border-t border-slate-100">
                              <Calendar className="w-3 h-3" />
                              <span>Clôture: {new Date(opportunity.closeDate).toLocaleDateString('fr-FR')}</span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Probabilité:</span>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#0D9488] to-[#0B7C74] rounded-full transition-all duration-300"
                                    style={{ width: `${opportunity.probability}%` }}
                                  />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 w-8 text-right">{opportunity.probability}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Zone de drop vide */}
                    {stage.opportunities.length === 0 && (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500 bg-slate-50">
                        <ArrowRight className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm font-medium">Déposez une opportunité ici</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
