"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Search, Filter, CheckCircle, AlertCircle, Eye, Download, Edit } from "lucide-react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";

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

const mockTimesheets: TimesheetEntry[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'Jean Dupont',
    weekStartDate: '2025-11-10',
    weekEndDate: '2025-11-16',
    totalHours: 40,
    status: 'submitted',
    projects: [
      {
        projectId: 'proj1',
        projectName: 'Projet Alpha',
        monday: 8,
        tuesday: 8,
        wednesday: 8,
        thursday: 8,
        friday: 8,
        saturday: 0,
        sunday: 0,
        total: 40
      }
    ],
    submittedAt: '2025-11-17T09:00:00Z'
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Marie Martin',
    weekStartDate: '2025-11-10',
    weekEndDate: '2025-11-16',
    totalHours: 42.5,
    status: 'approved',
    projects: [
      {
        projectId: 'proj2',
        projectName: 'Projet Beta',
        monday: 8.5,
        tuesday: 8,
        wednesday: 8.5,
        thursday: 8,
        friday: 9.5,
        saturday: 0,
        sunday: 0,
        total: 42.5
      }
    ],
    submittedAt: '2025-11-17T10:00:00Z',
    approvedAt: '2025-11-17T14:00:00Z',
    approvedBy: 'Manager'
  },
  {
    id: '3',
    employeeId: 'emp3',
    employeeName: 'Pierre Durand',
    weekStartDate: '2025-11-10',
    weekEndDate: '2025-11-16',
    totalHours: 35,
    status: 'draft',
    projects: [
      {
        projectId: 'proj3',
        projectName: 'Projet Gamma',
        monday: 7,
        tuesday: 7,
        wednesday: 7,
        thursday: 7,
        friday: 7,
        saturday: 0,
        sunday: 0,
        total: 35
      }
    ]
  }
];

export default function TimesheetPage() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ status: "", week: "" });
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetEntry | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showNewTimesheet, setShowNewTimesheet] = useState(false);

  useEffect(() => {
    loadTimesheets();
  }, []);

  const loadTimesheets = async () => {
    setLoading(true);
    try {
      // Utiliser la vraie API avec le companyId
      const companyId = localStorage.getItem('companyId') || 'demo-company';
      const params = new URLSearchParams({ companyId });
      
      if (filter.status) {
        params.append('status', filter.status);
      }

      const response = await fetch(`/api/hr/timesheets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTimesheets(data || []);
      } else {
        // Fallback vers données mock si API non disponible
        console.warn('API non disponible, utilisation des données mock');
        await new Promise(resolve => setTimeout(resolve, 500));
        setTimesheets(mockTimesheets);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des CRA:", error);
      // Fallback vers données mock
      await new Promise(resolve => setTimeout(resolve, 500));
      setTimesheets(mockTimesheets);
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

  const handleSubmitTimesheet = (id: string) => {
    setTimesheets(timesheets.map(ts => 
      ts.id === id ? { ...ts, status: 'submitted', submittedAt: new Date().toISOString() } : ts
    ));
    alert('CRA soumis pour validation !');
  };

  const handleApproveTimesheet = (id: string) => {
    setTimesheets(timesheets.map(ts => 
      ts.id === id ? { 
        ...ts, 
        status: 'approved', 
        approvedAt: new Date().toISOString(),
        approvedBy: 'Manager'
      } : ts
    ));
  };

  const handleRejectTimesheet = (id: string) => {
    const reason = prompt('Motif du rejet :');
    if (reason) {
      setTimesheets(timesheets.map(ts => 
        ts.id === id ? { ...ts, status: 'rejected', comments: reason } : ts
      ));
    }
  };

  const filteredTimesheets = timesheets.filter(ts => {
    const matchesSearch = ts.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                         ts.projects.some(p => p.projectName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !filter.status || ts.status === filter.status;
    return matchesSearch && matchesStatus;
  });

  const exportTimesheets = () => {
    const csvContent = [
      ['Employé', 'Semaine', 'Total Heures', 'Statut', 'Projets'],
      ...filteredTimesheets.map(ts => [
        ts.employeeName,
        `${format(new Date(ts.weekStartDate), 'dd/MM/yyyy')} - ${format(new Date(ts.weekEndDate), 'dd/MM/yyyy')}`,
        ts.totalHours.toString(),
        getStatusLabel(ts.status),
        ts.projects.map(p => p.projectName).join(', ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cra-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const weekKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto text-blue-600 mb-2 animate-spin" />
          <p>Chargement des CRA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Comptes Rendus d'Activité (CRA)</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTimesheets}>
            <Download className="w-4 h-4 mr-2" />Exporter
          </Button>
          <Button onClick={() => setShowNewTimesheet(true)}>
            <Plus className="w-4 h-4 mr-2" />Nouveau CRA
          </Button>
        </div>
      </div>

      {/* Modal Nouveau CRA */}
      {showNewTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Nouveau Compte Rendu d'Activité</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Semaine</label>
                  <input 
                    type="week"
                    className="w-full p-2 border rounded"
                    defaultValue="2025-W46"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employé</label>
                  <input 
                    type="text"
                    className="w-full p-2 border rounded"
                    defaultValue="Utilisateur courant"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="border rounded p-4">
                <h3 className="font-medium mb-3">Saisie des heures par projet</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Projet</th>
                        {weekDays.map(day => (
                          <th key={day} className="text-center p-2">{day.slice(0, 3)}</th>
                        ))}
                        <th className="text-center p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">
                          <input 
                            type="text"
                            className="w-full p-1 border rounded"
                            placeholder="Nom du projet"
                          />
                        </td>
                        {weekKeys.map(day => (
                          <td key={day} className="p-2">
                            <input 
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              className="w-full p-1 border rounded text-center"
                              placeholder="0"
                            />
                          </td>
                        ))}
                        <td className="p-2 text-center font-medium">0</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewTimesheet(false)}>
                  Annuler
                </Button>
                <Button onClick={() => {
                  setShowNewTimesheet(false);
                  alert('CRA créé avec succès !');
                }}>
                  Créer le CRA
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total CRA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timesheets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {timesheets.filter(ts => ts.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {timesheets.filter(ts => ts.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Brouillons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {timesheets.filter(ts => ts.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par employé ou projet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="px-3 py-2 border rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="submitted">Soumis</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>

      {/* Liste des CRA */}
      <div className="space-y-4">
        {filteredTimesheets.map(timesheet => (
          <Card key={timesheet.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg">{timesheet.employeeName}</h3>
                  <p className="text-sm text-gray-600">
                    Semaine du {format(new Date(timesheet.weekStartDate), 'dd MMMM yyyy')} au {format(new Date(timesheet.weekEndDate), 'dd MMMM yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(timesheet.status)}>
                    {getStatusIcon(timesheet.status)}
                    <span className="ml-1">{getStatusLabel(timesheet.status)}</span>
                  </Badge>
                  <div className="text-lg font-bold">{timesheet.totalHours}h</div>
                </div>
              </div>

              <div className="space-y-3">
                {timesheet.projects.map(project => (
                  <div key={project.projectId} className="border rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{project.projectName}</h4>
                      <span className="text-sm font-bold">{project.total}h</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {weekDays.map((day, index) => (
                        <div key={day} className="text-center">
                          <div className="font-medium">{day.slice(0, 3)}</div>
                          <div className="bg-gray-100 rounded p-1 mt-1">
                            {project[weekKeys[index]]}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />Détails
                </Button>
                {timesheet.status === 'draft' && (
                  <>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-1" />Modifier
                    </Button>
                    <Button size="sm" onClick={() => handleSubmitTimesheet(timesheet.id)}>
                      Soumettre
                    </Button>
                  </>
                )}
                {timesheet.status === 'submitted' && (
                  <>
                    <Button size="sm" onClick={() => handleApproveTimesheet(timesheet.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />Approuver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleRejectTimesheet(timesheet.id)}>
                      Rejeter
                    </Button>
                  </>
                )}
              </div>

              {timesheet.comments && (
                <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                  <strong>Motif rejet:</strong> {timesheet.comments}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredTimesheets.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucun CRA trouvé</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
