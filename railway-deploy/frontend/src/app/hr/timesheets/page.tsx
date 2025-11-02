"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Plus, Search, Filter, CheckCircle, AlertCircle, Eye } from "lucide-react";

type TimesheetEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  projects: Array<{
    projectId: string;
    projectName: string;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
    total: number;
  }>;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  comments?: string;
};

export default function TimesheetPage() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ status: "", week: "" });
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetEntry | null>(null);

  useEffect(() => {
    loadTimesheets();
  }, [search, filter]);

  const loadTimesheets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(filter.status && { status: filter.status }),
        ...(filter.week && { weekStartDate: filter.week }),
      });

      const response = await fetch(`/api/hr/timesheets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTimesheets(data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des CRA:", error);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "submitted": return "bg-blue-100 text-blue-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <Clock className="w-4 h-4" />;
      case "submitted": return <AlertCircle className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "submitted": return "Soumis";
      case "approved": return "Approuvé";
      case "rejected": return "Rejeté";
      default: return status;
    }
  };

  const handleCreateTimesheet = () => {
    // Rediriger vers le formulaire de création ou ouvrir une modal
    window.location.href = "/hr/timesheets/new";
  };

  const handleViewTimesheet = (timesheet: TimesheetEntry) => {
    setSelectedTimesheet(timesheet);
  };

  const handleSubmitTimesheet = async (timesheetId: string) => {
    try {
      const response = await fetch(`/api/hr/timesheets/${timesheetId}/submit`, {
        method: "POST",
      });
      if (response.ok) {
        loadTimesheets();
        alert("CRA soumis avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Erreur lors de la soumission du CRA");
    }
  };

  const handleApproveTimesheet = async (timesheetId: string) => {
    try {
      const response = await fetch(`/api/hr/timesheets/${timesheetId}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        loadTimesheets();
        alert("CRA approuvé avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      alert("Erreur lors de l'approbation du CRA");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Comptes Rendus d'Activité (CRA)</h1>
          <p className="text-gray-600 mt-1">Gestion des feuilles de temps et suivi des activités</p>
        </div>
        <Button onClick={handleCreateTimesheet}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau CRA
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par employé..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="submitted">Soumis</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
              <input
                type="week"
                value={filter.week}
                onChange={(e) => setFilter({ ...filter, week: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des CRA */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Chargement des CRA...</p>
        </div>
      ) : timesheets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun CRA trouvé</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier compte rendu d'activité</p>
            <Button onClick={handleCreateTimesheet}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un CRA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {timesheets.map((timesheet) => (
            <Card key={timesheet.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{timesheet.employeeName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(timesheet.status)}`}>
                        {getStatusIcon(timesheet.status)}
                        {getStatusLabel(timesheet.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-4">
                        <span>Semaine : {new Date(timesheet.weekStartDate).toLocaleDateString("fr-FR")} - {new Date(timesheet.weekEndDate).toLocaleDateString("fr-FR")}</span>
                        <span>Total heures : {timesheet.totalHours}h</span>
                        <span>Projets : {timesheet.projects.length}</span>
                      </div>
                      {timesheet.submittedAt && (
                        <div>Soumis le : {new Date(timesheet.submittedAt).toLocaleDateString("fr-FR")} à {new Date(timesheet.submittedAt).toLocaleTimeString("fr-FR")}</div>
                      )}
                      {timesheet.approvedAt && (
                        <div>Approuvé le : {new Date(timesheet.approvedAt).toLocaleDateString("fr-FR")} par {timesheet.approvedBy}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTimesheet(timesheet)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                    {timesheet.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => handleSubmitTimesheet(timesheet.id)}
                      >
                        Soumettre
                      </Button>
                    )}
                    {timesheet.status === "submitted" && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveTimesheet(timesheet.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approuver
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
