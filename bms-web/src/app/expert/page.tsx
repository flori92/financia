import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
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
    TrendingUp
} from 'lucide-react';
import { formatNumber } from '@/lib/format';

interface AdvancedMetrics {
    cabinet: {
        totalClients: number;
        clientsActifs: number;
        declarationsEnAttente: number;
        declarationsProches: number;
    };
    clientsMetrics: Array<{
        id: string;
        name: string;
        status: 'green' | 'orange' | 'red';
        lastActivity: string | null;
        completionRate: number;
        declarations: number;
        declarationsPending: number;
    }>;
    topActiveClients: Array<{
        id: string;
        name: string;
        completionRate: number;
    }>;
    clientsNeedingAttention: Array<{
        id: string;
        name: string;
        completionRate: number;
        declarationsPending: number;
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

export default function ExpertDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AdvancedMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function loadDashboard() {
        try {
            setLoading(true);
            const response = await apiGet('/accounting/expert/metrics');
            setData(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

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
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Expert-Comptable</h1>
                <button 
                    onClick={loadDashboard}
                    className="text-sm text-app-primary hover:underline"
                >
                    Actualiser
                </button>
            </div>

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