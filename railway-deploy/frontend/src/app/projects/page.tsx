"use client";
import { useEffect, useState } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { ProfessionalExporter } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Calendar, Clock, TrendingUp, Users, DollarSign, CheckCircle, Plus, Download, Eye, Edit, Trash2 } from "lucide-react";

interface ProjectData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  upcomingDeadlines: number;
  teamMembers: number;
  completionRate: number;
}

interface Project {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  manager: string;
  team: string[];
  description: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    console.log(`Toast ${type}: ${message}`); // Debug log
    if (type === "error") {
      alert(`❌ Erreur: ${message}`);
    } else if (type === "success") {
      alert(`✅ Succès: ${message}`);
    } else {
      alert(`ℹ️ Info: ${message}`);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyId = getCompanyId();
        
        // Charger les KPIs depuis l'API
        const dashboardResponse = await apiGet('/api/v1/projects/dashboard', { companyId });
        setData(dashboardResponse);

        // Charger les projets depuis l'API
        const projectsResponse = await apiGet('/api/v1/projects', { companyId });
        setProjects(projectsResponse);
      } catch (error) {
        console.error("Erreur chargement données:", error);
        // Fallback vers données mock si API indisponible
        const mockProjects: Project[] = [
          {
            id: '1',
            name: 'Site E-commerce BMS',
            status: 'active',
            progress: 75,
            budget: 15000000,
            spent: 11250000,
            startDate: '2025-01-15',
            endDate: '2025-06-30',
            manager: 'Jean Dupont',
            team: ['Alice', 'Bob', 'Charlie'],
            description: 'Développement plateforme e-commerce complète'
          },
          {
            id: '2',
            name: 'Application Mobile CRM',
            status: 'planning',
            progress: 25,
            budget: 8000000,
            spent: 2000000,
            startDate: '2025-02-01',
            endDate: '2025-08-15',
            manager: 'Marie Martin',
            team: ['David', 'Emma'],
            description: 'Application mobile pour gestion CRM'
          },
          {
            id: '3',
            name: 'Migration Cloud Infrastructure',
            status: 'completed',
            progress: 100,
            budget: 5000000,
            spent: 4800000,
            startDate: '2024-11-01',
            endDate: '2025-01-31',
            manager: 'Pierre Durand',
            team: ['Frank', 'Grace'],
            description: 'Migration complète vers AWS'
          }
        ];
        setProjects(mockProjects);
        
        const mockData: ProjectData = {
          totalProjects: mockProjects.length,
          activeProjects: mockProjects.filter(p => p.status === 'active').length,
          completedProjects: mockProjects.filter(p => p.status === 'completed').length,
          totalBudget: mockProjects.reduce((sum, p) => sum + p.budget, 0),
          upcomingDeadlines: mockProjects.filter(p => {
            const deadline = new Date(p.endDate);
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return deadline <= weekFromNow && p.status !== 'completed';
          }).length,
          teamMembers: 25,
          completionRate: Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length)
        };
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateProject = () => {
    console.log('handleCreateProject called'); // Debug log
    try {
      const newProject: Project = {
        id: Date.now().toString(),
        name: `Nouveau Projet ${projects.length + 1}`,
        status: 'planning',
        progress: 0,
        budget: 5000000,
        spent: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        manager: 'À assigner',
        team: [],
        description: 'Description du nouveau projet'
      };

      setProjects([...projects, newProject]);
      setShowCreateModal(false);
      triggerToast("success", `Projet "${newProject.name}" créé avec succès !`);
    } catch (error) {
      console.error("Erreur création projet:", error);
      triggerToast("error", "Erreur lors de la création du projet");
    }
  };

  const handleViewProject = (project: Project) => {
    console.log('handleViewProject called with:', project.name); // Debug log
    try {
      setSelectedProject(project);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Erreur affichage projet:", error);
      triggerToast("error", "Erreur lors de l'affichage du projet");
    }
  };

  const handleExportProjects = () => {
    console.log('handleExportProjects called'); // Debug log
    if (!projects || projects.length === 0) {
      triggerToast("error", "Aucun projet à exporter");
      return;
    }

    const exportData = {
      title: 'Rapport des Projets',
      headers: ['Nom', 'Statut', 'Progression', 'Budget', 'Dépensé', 'Responsable', 'Date Fin'],
      rows: projects.map(project => [
        project.name,
        project.status === 'completed' ? 'Terminé' : 
        project.status === 'active' ? 'Actif' : 
        project.status === 'planning' ? 'Planification' : 'En pause',
        `${project.progress}%`,
        (project.budget || 0).toLocaleString('fr-FR') + ' FCFA',
        (project.spent || 0).toLocaleString('fr-FR') + ' FCFA',
        project.manager,
        project.endDate
      ]),
      metadata: {
        date: new Date().toLocaleDateString('fr-FR'),
        company: 'BMS Business Management System',
        period: 'Tous les projets',
        author: 'Service Projets'
      }
    };

    try {
      // Export direct en Excel par défaut (plus user-friendly)
      ProfessionalExporter.exportExcel(exportData, 'projets');
      triggerToast("success", "Projets exportés en Excel avec succès !");
    } catch (error) {
      console.error("Erreur export:", error);
      triggerToast("error", "Erreur lors de l'export des projets");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'planning': return 'bg-amber-100 text-amber-700';
      case 'on-hold': return 'bg-slate-100 text-slate-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'active': return 'Actif';
      case 'planning': return 'Planification';
      case 'on-hold': return 'En pause';
      default: return status;
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projets</h1>
          <p className="text-gray-600">Gestion de projets et suivi des tâches</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportProjects}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Projet
          </Button>
        </div>
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
            <div className="text-2xl font-bold">{formatCurrency(data?.totalBudget)}</div>
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

      {/* Liste des projets */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewProject(project)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Progression</div>
                <div className="font-semibold">{project.progress}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="text-slate-600">Budget</div>
                <div className="font-semibold">{(project.budget || 0).toLocaleString('fr-FR')} FCFA</div>
              </div>
              <div>
                <div className="text-slate-600">Dépensé</div>
                <div className="font-semibold">{(project.spent || 0).toLocaleString('fr-FR')} FCFA</div>
              </div>
              <div>
                <div className="text-slate-600">Responsable</div>
                <div className="font-semibold">{project.manager}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal création projet */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nouveau Projet</h2>
            <p className="text-gray-600 mb-4">
              Créer un nouveau projet avec les paramètres par défaut. Vous pourrez le modifier ultérieurement.
            </p>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleCreateProject}>
                Créer le projet
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détails projet */}
      {showDetailsModal && selectedProject && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Statut</label>
                <div className={`px-3 py-1 rounded-full text-sm inline-block ${getStatusColor(selectedProject.status)}`}>
                  {getStatusText(selectedProject.status)}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Progression</label>
                <div className="font-semibold">{selectedProject.progress}%</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date de début</label>
                <div className="font-semibold">{selectedProject.startDate}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Date de fin</label>
                <div className="font-semibold">{selectedProject.endDate}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Budget</label>
                <div className="font-semibold">{(selectedProject.budget || 0).toLocaleString('fr-FR')} FCFA</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Dépensé</label>
                <div className="font-semibold">{(selectedProject.spent || 0).toLocaleString('fr-FR')} FCFA</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Responsable</label>
                <div className="font-semibold">{selectedProject.manager}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Équipe</label>
                <div className="font-semibold">{selectedProject.team.join(', ') || 'À définir'}</div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
