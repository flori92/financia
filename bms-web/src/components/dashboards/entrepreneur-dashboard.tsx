'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, BarChart } from "@/components/ui/charts";
import { 
    Activity,
    TrendingUp,
    DollarSign,
    AlertCircle 
} from "lucide-react";

interface DashboardMetric {
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
}

const metrics: DashboardMetric[] = [
    {
        label: "Chiffre d'affaires",
        value: "75 420 €",
        change: 12.5,
        icon: <DollarSign className="w-4 h-4" />
    },
    {
        label: "Documents en attente",
        value: "23",
        change: -5,
        icon: <Activity className="w-4 h-4" />
    },
    {
        label: "Trésorerie",
        value: "28 350 €",
        change: 8.2,
        icon: <TrendingUp className="w-4 h-4" />
    },
    {
        label: "Échéances",
        value: "5",
        change: 0,
        icon: <AlertCircle className="w-4 h-4" />
    }
];

export function EntrepreneurDashboard() {
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
                                {metric.change > 0 ? '+' : ''}{metric.change}% par rapport au mois dernier
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Vue d'ensemble</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LineChart
                            data={[
                                { month: 'Jan', revenue: 2400 },
                                { month: 'Fév', revenue: 1398 },
                                { month: 'Mar', revenue: 9800 },
                                { month: 'Avr', revenue: 3908 },
                                { month: 'Mai', revenue: 4800 },
                                { month: 'Jui', revenue: 3800 },
                                { month: 'Jui', revenue: 4300 }
                            ]}
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Répartition des dépenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={[
                                { category: 'Marketing', amount: 4000 },
                                { category: 'Opérations', amount: 3000 },
                                { category: 'Personnel', amount: 2000 },
                                { category: 'Autres', amount: 2780 }
                            ]}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button className="w-full justify-start">
                            Ajouter une facture
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            Saisir une dépense
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            Rapprocher un compte
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Documents à traiter</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Facture client #1234</p>
                                    <p className="text-sm text-gray-500">En attente de validation</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Note de frais Mars</p>
                                    <p className="text-sm text-gray-500">À compléter</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Échéances à venir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">TVA Trimestre 1</p>
                                    <p className="text-sm text-red-500">Dans 5 jours</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium">Cotisations sociales</p>
                                    <p className="text-sm text-yellow-500">Dans 15 jours</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}