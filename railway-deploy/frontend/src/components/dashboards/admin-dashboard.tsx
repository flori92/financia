'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { LineChart, BarChart } from "@/components/ui/charts";
import { 
    Building,
    FilePlus,
    AlertOctagon,
    TrendingUp
} from "lucide-react";

interface AdminMetric {
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
}

const metrics: AdminMetric[] = [
    {
        label: "Entreprises supervisées",
        value: "324",
        change: 5.2,
        icon: <Building className="w-4 h-4" />
    },
    {
        label: "Nouvelles déclarations",
        value: "45",
        change: 12,
        icon: <FilePlus className="w-4 h-4" />
    },
    {
        label: "Alertes de conformité",
        value: "18",
        change: -8,
        icon: <AlertOctagon className="w-4 h-4" />
    },
    {
        label: "Taux de conformité",
        value: "92%",
        change: 2.5,
        icon: <TrendingUp className="w-4 h-4" />
    }
];

const declarationsData = [
    { 
        id: 1,
        company: "SARL TechInno",
        type: "TVA",
        period: "T3 2025",
        status: "En cours"
    },
    { 
        id: 2,
        company: "SAS BuildPro",
        type: "IS",
        period: "2025",
        status: "À valider"
    },
    { 
        id: 3,
        company: "EURL ComSys",
        type: "CVAE",
        period: "2025",
        status: "Validé"
    }
];

const columns = [
    { accessor: 'company', header: 'Entreprise' },
    { accessor: 'type', header: 'Type' },
    { accessor: 'period', header: 'Période' },
    { accessor: 'status', header: 'Statut' }
];

export function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {metric.label}
                            </CardTitle>
                            {metric.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <p className={`text-xs ${
                                metric.change > 0 
                                    ? 'text-green-600' 
                                    : metric.change < 0 
                                        ? 'text-red-600' 
                                        : 'text-gray-600'
                            }`}>
                                {metric.change > 0 ? '+' : ''}{metric.change}% ce mois
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Évolution des déclarations fiscales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LineChart
                            data={[
                                { month: 'Jan', count: 180 },
                                { month: 'Fév', count: 220 },
                                { month: 'Mar', count: 310 },
                                { month: 'Avr', count: 250 },
                                { month: 'Mai', count: 285 },
                                { month: 'Jui', count: 330 },
                                { month: 'Jui', count: 345 }
                            ]}
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Répartition par type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={[
                                { type: 'TVA', count: 150 },
                                { type: 'IS', count: 80 },
                                { type: 'CVAE', count: 45 },
                                { type: 'Autres', count: 49 }
                            ]}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Actions requises</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full justify-start text-red-600">
                            Valider déclarations TVA (8)
                        </Button>
                        <Button className="w-full justify-start text-yellow-600" variant="outline">
                            Examiner anomalies IS (5)
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            Mettre à jour référentiel
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dernières déclarations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            data={declarationsData}
                            columns={columns}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Alertes de conformité</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <AlertOctagon className="w-4 h-4 text-red-600" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Retard déclaratif</p>
                                    <p className="text-sm text-red-600">12 entreprises concernées</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <AlertOctagon className="w-4 h-4 text-yellow-600" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Incohérences TVA</p>
                                    <p className="text-sm text-yellow-600">6 dossiers à vérifier</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}