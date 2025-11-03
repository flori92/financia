"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Calendar, Clock, TrendingUp, Users, DollarSign, CheckCircle, Plus } from "lucide-react";

interface ProjectData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  upcomingDeadlines: number;
  teamMembers: number;
  completionRate: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les projets
        apiGet("/api/v1/projects")
          .then(setProjects)
          .catch(() => setProjects([]));
        
        // Simuler les données KPIs
        const mockData: ProjectData = {
          totalProjects: 12,
          activeProjects: 8,
          completedProjects: 4,
          totalBudget: 45000000,
          upcomingDeadlines: 3,
          teamMembers: 25,
          completionRate: 75.5
        };
        setData(mockData);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-gray-600">Gestion de projets et suivi des tâches</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalProjects}</div>
            <p className="text-xs text-blue-600">{data?.activeProjects} actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalBudget?.toLocaleString()} FCFA</div>
            <p className="text-xs text-green-600">Alloué</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Échéances</CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.upcomingDeadlines}</div>
            <p className="text-xs text-orange-600">Cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taux Complétion</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.completionRate}%</div>
            <p className="text-xs text-purple-600">Moyenne</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.map((project: any) => (
          <div key={project.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">{project.name}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {project.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Progression</div>
                <div className="font-semibold">{project.progress}%</div>
              </div>
              <div>
                <div className="text-slate-600">Budget</div>
                <div className="font-semibold">{project.budget.toLocaleString()} FCFA</div>
              </div>
              <div>
                <div className="text-slate-600">Dépensé</div>
                <div className="font-semibold">{project.spent.toLocaleString()} FCFA</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
