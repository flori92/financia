'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PieChart } from "@/components/ui/charts";
import { 
    Users,
    FileCheck,
    AlertTriangle,
    Clock
} from "lucide-react";

interface ExpertMetric {
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
}

const metrics: ExpertMetric[] = [
    {
        label: "Clients actifs",
        value: "45",
        change: 2,
        icon: <Users className="w-4 h-4" />
    },
    {
        label: "Dossiers à valider",
        value: "12",
        change: -3,
        icon: <FileCheck className="w-4 h-4" />
    },
    {
        label: "Anomalies détectées",
        value: "8",
        change: -15,
        icon: <AlertTriangle className="w-4 h-4" />
    },
    {
        label: "Échéances clients",
        value: "15",
        change: 5,
        icon: <Clock className="w-4 h-4" />
    }
];

const clientsData = [
    { 
        id: 1,
        name: "SARL TechInno",
        status: "À valider",
        deadline: "2025-10-25",
        progress: 85
    },
    { 
        id: 2,
        name: "EI Martin",
        status: "En cours",
        deadline: "2025-10-30",
        progress: 45
    },
    { 
        id: 3,
        name: "SAS BuildPro",
        status: "Anomalie",
        deadline: "2025-10-20",
        progress: 92
    }
];

const columns = [
    { accessor: 'name', header: 'Client' },
    { accessor: 'status', header: 'Statut' },
    { accessor: 'deadline', header: 'Échéance' },
    { accessor: 'progress', header: 'Avancement' }
];

export function ExpertDashboard() {
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
                                {metric.change > 0 ? '+' : ''}{metric.change}% cette semaine
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Dossiers clients en cours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            data={clientsData}
                            columns={columns}
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Répartition des tâches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PieChart
                            data={[
                                { name: 'Validation', value: 35 },
                                { name: 'Saisie', value: 25 },
                                { name: 'Révision', value: 20 },
                                { name: 'Conseil', value: 20 }
                            ]}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Actions prioritaires</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full justify-start text-red-600">
                            Valider bilan SARL TechInno
                        </Button>
                        <Button className="w-full justify-start text-yellow-600" variant="outline">
                            Vérifier TVA EI Martin
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            Réviser comptes SAS BuildPro
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Anomalies détectées</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">SARL TechInno</p>
                                    <p className="text-sm text-gray-500">Écart de TVA significatif</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">EI Martin</p>
                                    <p className="text-sm text-gray-500">Rapprochement bancaire incomplet</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Échéances légales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 text-red-600" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Déclaration TVA</p>
                                    <p className="text-sm text-red-600">J-5 : 3 clients</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Bilan annuel</p>
                                    <p className="text-sm text-yellow-600">J-15 : 5 clients</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}