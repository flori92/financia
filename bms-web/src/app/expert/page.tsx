'use client';

import { useState, useEffect } from 'react';
import { apiGet, getCompanyId } from '@/lib/api';
import { 
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer 
} from 'recharts';
import {
    CircleSlash2,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    Building,
    FileSpreadsheet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    Activity,
    ArrowRight,
    Settings,
  Eye,
  Edit
} from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { ExpertProvider, useExpert } from '@/contexts/expert-context';
import { ClientSelector } from '@/components/expert/ClientSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExpertMetrics {
    cabinet: {
        totalClients: number;
        activeClients: number;
        totalRevenue: number;
        pendingTasks: number;
    };
    clientsMetrics: Array<{
        id: string;
        name: string;
        revenue: number;
        netIncome: number;
        margin: number;
        lastActivity: string;
        alerts: number;
    }>;
    performanceData: Array<{
        month: string;
        revenue: number;
        expenses: number;
        clients: number;
    }>;
    topClients: Array<{
        name: string;
        revenue: number;
        completionRate: number;
    }>;
    alerts: Array<{
        type: "danger" | "warning" | "info";
        title: string;
        message: string;
        clientName?: string;
    }>;
    recentActivity: Array<{
        date: string;
        clientName: string;
        description: string;
        type: string;
    }>;
    revenueByMonth: Array<{
        month: string;
        revenue: number;
    }>;
    upcomingDeadlines: Array<{
        dueDate: string;
        type: string;
        company: string;
        status: string;
    }>;
}

function ExpertDashboardContent() {
    const { selectedClient, isExpertMode, clients } = useExpert();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ExpertMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function loadDashboard() {
        // Utiliser le client sélectionné ou l'ID par défaut
        const effectiveCompanyId = selectedClient?.id || getCompanyId();
        if (!effectiveCompanyId) {
            setError("Aucune société sélectionnée");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            
            // Si un client est sélectionné, charger les données de ce client spécifique
            if (selectedClient) {
                // Charger les données entrepreneur pour le client sélectionné
                const [metrics, treasuryAlerts] = await Promise.allSettled([
                    apiGet("/api/v1/accounting/dashboard/metrics", { companyId: effectiveCompanyId }),
                    apiGet("/api/v1/treasury/alerts", { companyId: effectiveCompanyId })
                ]);

                const clientData: ExpertMetrics = {
                    cabinet: {
                        totalClients: 1,
                        activeClients: 1,
                        totalRevenue: metrics.status === "fulfilled" ? metrics.value.kpiMonth?.revenue || 0 : 0,
                        pendingTasks: metrics.status === "fulfilled" ? metrics.value.alerts?.length || 0 : 0
                    },
                    clientsMetrics: [{
                        id: selectedClient.id,
                        name: selectedClient.name,
                        revenue: metrics.status === "fulfilled" ? metrics.value.kpiMonth?.revenue || 0 : 0,
                        netIncome: metrics.status === "fulfilled" ? metrics.value.kpiMonth?.netIncome || 0 : 0,
                        margin: metrics.status === "fulfilled" ? metrics.value.kpiMonth?.margin || 0 : 0,
                        lastActivity: selectedClient.lastActivity,
                        alerts: metrics.status === "fulfilled" ? metrics.value.alerts?.length || 0 : 0
                    }],
                    performanceData: metrics.status === "fulfilled" ? metrics.value.evolutionChart || [] : [],
                    topClients: metrics.status === "fulfilled" ? metrics.value.topClients || [] : [],
                    alerts: metrics.status === "fulfilled" ? metrics.value.alerts || [] : [],
                    recentActivity: metrics.status === "fulfilled" ? metrics.value.recentActivity?.entries || [] : [],
                    revenueByMonth: metrics.status === "fulfilled" ? metrics.value.evolutionChart?.map((item: any) => ({ month: item.month.split(' ')[0], revenue: item.revenue })) || [] : [],
                    upcomingDeadlines: []
                };

                setData(clientData);
            } else {
                // Vue cabinet : données agrégées de tous les clients
                const mockData: ExpertMetrics = {
                    cabinet: {
                        totalClients: clients.length,
                        activeClients: clients.filter(c => c.status === 'active').length,
                        totalRevenue: 45000000,
                        pendingTasks: 5
                    },
                    clientsMetrics: [
                    {
                        id: '1',
                        name: 'SARL Tech Solutions',
                        revenue: 8500000,
                        netIncome: 1200000,
                        margin: 14.1,
                        lastActivity: '2025-01-15',
                        alerts: 1
                    },
                    {
                        id: '2',
                        name: 'EURL Commerce Plus',
                        revenue: 6200000,
                        netIncome: 930000,
                        margin: 15.0,
                        lastActivity: '2025-01-14',
                        alerts: 0
                    },
                    {
                        id: '3',
                        name: 'SA Industries Modernes',
                        revenue: 12300000,
                        netIncome: -450000,
                        margin: -3.7,
                        lastActivity: '2025-01-13',
                        alerts: 3
                    }
                ],
                performanceData: [
                    { month: 'Août 2024', revenue: 3200000, expenses: 2800000, clients: 8 },
                    { month: 'Sept 2024', revenue: 3500000, expenses: 2900000, clients: 9 },
                    { month: 'Oct 2024', revenue: 3800000, expenses: 3100000, clients: 10 },
                    { month: 'Nov 2024', revenue: 4100000, expenses: 3200000, clients: 10 },
                    { month: 'Déc 2024', revenue: 4500000, expenses: 3400000, clients: 11 },
                    { month: 'Jan 2025', revenue: 4200000, expenses: 3300000, clients: 11 }
                ],
                topClients: [
                    { name: 'SA Industries Modernes', revenue: 12300000, completionRate: 85 },
                    { name: 'SARL Tech Solutions', revenue: 8500000, completionRate: 92 },
                    { name: 'EURL Commerce Plus', revenue: 6200000, completionRate: 88 }
                ],
                alerts: [
                    {
                        type: 'danger',
                        title: 'Perte détectée',
                        message: 'SA Industries Modernes présente une perte de 450 000 FCFA',
                        clientName: 'SA Industries Modernes'
                    },
                    {
                        type: 'warning',
                        title: 'Déclarations en attente',
                        message: '3 clients ont des déclarations TVA en retard',
                        clientName: 'Multiple'
                    }
                ],
                recentActivity: [
                    { date: '2025-01-15', clientName: 'SARL Tech Solutions', description: 'Validation des écritures', type: 'validation' },
                    { date: '2025-01-14', clientName: 'EURL Commerce Plus', description: 'Génération rapport', type: 'rapport' },
                    { date: '2025-01-13', clientName: 'SA Industries Modernes', description: 'Alerte trésorerie', type: 'alerte' }
                ],
                revenueByMonth: [
                    { month: 'Août', revenue: 3200000 },
                    { month: 'Sept', revenue: 3500000 },
                    { month: 'Oct', revenue: 3800000 },
                    { month: 'Nov', revenue: 4100000 },
                    { month: 'Déc', revenue: 4500000 },
                    { month: 'Jan', revenue: 4200000 }
                ],
                upcomingDeadlines: [
                    { dueDate: '2025-01-20', type: 'TVA', company: 'SARL Tech Solutions', status: 'pending' },
                    { dueDate: '2025-01-25', type: 'Déclaration Sociale', company: 'EURL Commerce Plus', status: 'pending' }
                ]
            };

                setData(mockData);
                setError(null);
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, [selectedClient]); // Recharger quand le client change

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Chargement du dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-rose-600">{error}</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-slate-500">Aucune donnée disponible</div>;
    }

    return (
        <div className="space-y-6 p-6">
            {/* Sélecteur de clients */}
            <ClientSelector />
            
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {selectedClient ? `Gestion Client: ${selectedClient.name}` : 'Dashboard Expert-Comptable'}
                    </h1>
                    <p className="text-sm text-slate-600">
                        {selectedClient 
                            ? 'Vous naviguez dans l\'espace du client sélectionné' 
                            : 'Vue d\'ensemble de votre cabinet et de tous vos clients'
                        }
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedClient && (
                        <Badge className="bg-blue-100 text-blue-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Mode Client
                        </Badge>
                    )}
                    <button 
                        onClick={loadDashboard}
                        className="text-sm text-app-primary hover:underline"
                    >
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Actions rapides pour le client sélectionné */}
            {selectedClient && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Actions pour {selectedClient.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button 
                                variant="outline" 
                                className="justify-start"
                                onClick={() => window.open(`/entrepreneur?clientId=${selectedClient.id}`, '_blank')}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Vue Entrepreneur
                            </Button>
                            <Button 
                                variant="outline" 
                                className="justify-start"
                                onClick={() => window.open(`/accountant?companyId=${selectedClient.id}`, '_blank')}
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Comptabilité
                            </Button>
                            <Button 
                                variant="outline" 
                                className="justify-start"
                                onClick={() => window.open(`/treasury?companyId=${selectedClient.id}`, '_blank')}
                            >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Trésorerie
                            </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-3">
                            Accédez à toutes les fonctionnalités du client comme si vous étiez l'entrepreneur
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-app-primary" />
                        <div>
                            <div className="text-sm text-slate-600">Clients Totaux</div>
                            <div className="text-2xl font-semibold">{data.cabinet.totalClients}</div>
                            <div className="text-sm text-slate-500">
                                {data.cabinet.clientsActifs} actifs
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <Building className="w-8 h-8 text-app-primary" />
                        <div>
                            <div className="text-sm text-slate-600">Taux Moyen Complétion</div>
                            <div className="text-2xl font-semibold">
                                {Math.round(
                                    data.clientsMetrics.reduce((acc, c) => acc + c.completionRate, 0) / 
                                    data.clientsMetrics.length
                                )}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-app-primary" />
                        <div>
                            <div className="text-sm text-slate-600">Déclarations en Attente</div>
                            <div className="text-2xl font-semibold">{data.cabinet.declarationsEnAttente}</div>
                            <div className="text-sm text-rose-500">
                                {data.cabinet.declarationsProches} urgentes
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-app-primary" />
                        <div>
                            <div className="text-sm text-slate-600">CA Mensuel Moyen</div>
                            <div className="text-2xl font-semibold">
                                {formatNumber(
                                    data.revenueByMonth.reduce((acc, m) => acc + m.revenue, 0) / 
                                    data.revenueByMonth.length
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphique CA */}
            <div className="card p-4">
                <h2 className="text-lg font-semibold mb-4">Évolution CA Cabinet</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.revenueByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="month" 
                                tickFormatter={(v) => v.split('-')[1]}
                            />
                            <YAxis 
                                tickFormatter={(v) => `${Math.round(v/1000000)}M`}
                            />
                            <Tooltip 
                                formatter={(v: any) => formatNumber(v)}
                                labelFormatter={(v) => `Mois: ${v}`}
                            />
                            <Bar dataKey="revenue" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Clients nécessitant attention et échéances */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-4">
                    <h2 className="text-lg font-semibold mb-4">
                        Clients Nécessitant Attention
                    </h2>
                    <div className="space-y-4">
                        {data.clientsNeedingAttention.map(client => (
                            <div 
                                key={client.id}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded"
                            >
                                <div>
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-sm text-slate-500">
                                        Complétion: {client.completionRate}%
                                    </div>
                                </div>
                                <div className="text-sm">
                                    {client.declarationsPending > 0 && (
                                        <span className="text-rose-600">
                                            {client.declarationsPending} déclaration(s) en attente
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-4">
                    <h2 className="text-lg font-semibold mb-4">
                        Prochaines Échéances
                    </h2>
                    <div className="space-y-4">
                        {data.upcomingDeadlines.map((deadline, idx) => (
                            <div 
                                key={idx}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded"
                            >
                                <div>
                                    <div className="font-medium">
                                        {deadline.company} - {deadline.type}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        Échéance: {new Date(deadline.dueDate).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                                <div 
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        deadline.status === 'pending' 
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                    {deadline.status === 'pending' ? 'En attente' : 'Complété'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top clients actifs */}
            <div className="card p-4">
                <h2 className="text-lg font-semibold mb-4">
                    Top Clients Actifs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.topActiveClients.map(client => (
                        <div 
                            key={client.id}
                            className="p-4 bg-slate-50 rounded"
                        >
                            <div className="font-medium">{client.name}</div>
                            <div className="mt-2 h-2 bg-slate-200 rounded overflow-hidden">
                                <div 
                                    className="h-full bg-app-primary rounded"
                                    style={{ width: `${client.completionRate}%` }}
                                />
                            </div>
                            <div className="mt-1 text-sm text-slate-600 text-right">
                                {client.completionRate}% complet
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Wrapper principal avec le contexte
export default function ExpertDashboardPage() {
    return (
        <ExpertProvider>
            <ExpertDashboardContent />
        </ExpertProvider>
    );
}