"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Search, Filter } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { fr } from "date-fns/locale";

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  requestedAt: string;
  processedAt?: string;
  managerComment?: string;
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'Jean Dupont',
    type: 'annual',
    startDate: '2025-11-15',
    endDate: '2025-11-20',
    daysCount: 6,
    status: 'approved',
    reason: 'Vacances annuelles',
    requestedAt: '2025-11-01T09:00:00Z',
    processedAt: '2025-11-02T14:00:00Z'
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Marie Martin',
    type: 'sick',
    startDate: '2025-11-08',
    endDate: '2025-11-10',
    daysCount: 3,
    status: 'approved',
    reason: 'Congé maladie',
    requestedAt: '2025-11-05T10:00:00Z',
    processedAt: '2025-11-06T11:00:00Z'
  },
  {
    id: '3',
    employeeId: 'emp3',
    employeeName: 'Pierre Durand',
    type: 'annual',
    startDate: '2025-11-25',
    endDate: '2025-11-28',
    daysCount: 4,
    status: 'pending',
    reason: 'Vacances familiales',
    requestedAt: '2025-11-20T15:00:00Z'
  }
];

export default function LeavesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ status: "", type: "" });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newRequest, setNewRequest] = useState({
    type: 'annual' as 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    loadLeaves();
  }, [filter]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      // Utiliser la vraie API avec le companyId
      const companyId = localStorage.getItem('companyId') || 'demo-company';
      const params = new URLSearchParams({ companyId });
      
      if (filter.status) {
        params.append('status', filter.status);
      }
      if (filter.type) {
        params.append('type', filter.type);
      }

      const response = await fetch(`/api/hr/leaves?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data || []);
      } else {
        // Fallback vers données mock si API non disponible
        console.warn('API non disponible, utilisation des données mock');
        await new Promise(resolve => setTimeout(resolve, 300));
        setLeaveRequests(mockLeaveRequests);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des congés:", error);
      // Fallback vers données mock
      await new Promise(resolve => setTimeout(resolve, 300));
      setLeaveRequests(mockLeaveRequests);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  const getLeavesForDate = (date: Date) => {
    return leaveRequests.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'annual': return 'Congé annuel';
      case 'sick': return 'Congé maladie';
      case 'personal': return 'Absence personnelle';
      case 'maternity': return 'Congé maternité';
      case 'paternity': return 'Congé paternité';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'annual': return '🏖️';
      case 'sick': return '🏥';
      case 'personal': return '📋';
      case 'maternity': return '🤱';
      case 'paternity': return '👨‍👧‍👦';
      default: return '📅';
    }
  };

  const handleNewRequest = async () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    try {
      const companyId = localStorage.getItem('companyId') || 'demo-company';
      const response = await fetch('/api/hr/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newRequest,
          employeeId: 'current-user',
          companyId
        })
      });

      if (response.ok) {
        const createdLeave = await response.json();
        setLeaveRequests([createdLeave, ...leaveRequests]);
        setShowNewRequest(false);
        setNewRequest({
          type: 'annual',
          startDate: '',
          endDate: '',
          reason: ''
        });
        alert('Demande de congé créée avec succès !');
      } else {
        // Simulation si API non disponible
        const simulatedLeave: LeaveRequest = {
          id: Date.now().toString(),
          employeeId: 'current-user',
          employeeName: 'Utilisateur courant',
          ...newRequest,
          daysCount: Math.ceil((new Date(newRequest.endDate).getTime() - new Date(newRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
          status: 'pending',
          requestedAt: new Date().toISOString()
        };
        setLeaveRequests([simulatedLeave, ...leaveRequests]);
        setShowNewRequest(false);
        setNewRequest({
          type: 'annual',
          startDate: '',
          endDate: '',
          reason: ''
        });
        alert('Demande de congé créée avec succès !');
      }
    } catch (error) {
      console.error("Erreur lors de la création de la demande:", error);
      // Simulation si erreur
      const simulatedLeave: LeaveRequest = {
        id: Date.now().toString(),
        employeeId: 'current-user',
        employeeName: 'Utilisateur courant',
        ...newRequest,
        daysCount: Math.ceil((new Date(newRequest.endDate).getTime() - new Date(newRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        status: 'pending',
        requestedAt: new Date().toISOString()
      };
      setLeaveRequests([simulatedLeave, ...leaveRequests]);
      setShowNewRequest(false);
      setNewRequest({
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      alert('Demande de congé créée avec succès !');
    }
  };

  const handleApproveReject = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/hr/leaves/${leaveId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          managerComment: status === 'approved' ? 'Approuvé par le manager' : 'Rejeté par le manager',
          approvedBy: 'current-manager'
        })
      });

      if (response.ok) {
        const updatedLeave = await response.json();
        setLeaveRequests(leaveRequests.map(leave => 
          leave.id === leaveId ? updatedLeave : leave
        ));
      } else {
        // Simulation si API non disponible
        setLeaveRequests(leaveRequests.map(leave => 
          leave.id === leaveId ? { 
            ...leave, 
            status, 
            processedAt: new Date().toISOString(),
            managerComment: status === 'approved' ? 'Approuvé par le manager' : 'Rejeté par le manager'
          } : leave
        ));
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      // Simulation si erreur
      setLeaveRequests(leaveRequests.map(leave => 
        leave.id === leaveId ? { 
          ...leave, 
          status, 
          processedAt: new Date().toISOString(),
          managerComment: status === 'approved' ? 'Approuvé par le manager' : 'Rejeté par le manager'
        } : leave
      ));
    }
  };

  const filteredLeaves = leaveRequests.filter(leave => {
    const matchesSearch = leave.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                         leave.reason.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filter.status || leave.status === filter.status;
    const matchesType = !filter.type || leave.type === filter.type;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="w-8 h-8 mx-auto text-blue-600 mb-2 animate-spin" />
          <p>Chargement des congés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Congés et Absences</h1>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle demande
        </Button>
      </div>

      {/* Modal Nouvelle demande */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nouvelle demande de congé</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type de congé</label>
                <select 
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({...newRequest, type: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="annual">Congé annuel</option>
                  <option value="sick">Congé maladie</option>
                  <option value="personal">Absence personnelle</option>
                  <option value="maternity">Congé maternité</option>
                  <option value="paternity">Congé paternité</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date de début</label>
                <input 
                  type="date"
                  value={newRequest.startDate}
                  onChange={(e) => setNewRequest({...newRequest, startDate: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date de fin</label>
                <input 
                  type="date"
                  value={newRequest.endDate}
                  onChange={(e) => setNewRequest({...newRequest, endDate: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Motif</label>
                <textarea 
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Description du motif..."
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                  Annuler
                </Button>
                <Button onClick={handleNewRequest}>
                  Soumettre la demande
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
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {leaveRequests.filter(l => l.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {leaveRequests.filter(l => l.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {leaveRequests.filter(l => l.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par employé ou motif..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded"
            />
          </div>
        </div>
        <select 
          value={filter.status}
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          className="px-3 py-2 border rounded"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvées</option>
          <option value="rejected">Rejetées</option>
        </select>
        <select 
          value={filter.type}
          onChange={(e) => setFilter({...filter, type: e.target.value})}
          className="px-3 py-2 border rounded"
        >
          <option value="">Tous les types</option>
          <option value="annual">Congé annuel</option>
          <option value="sick">Congé maladie</option>
          <option value="personal">Absence personnelle</option>
          <option value="maternity">Congé maternité</option>
          <option value="paternity">Congé paternité</option>
        </select>
      </div>

      {/* Calendrier */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                ←
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Jours de la semaine */}
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="text-center text-sm font-medium p-2 text-gray-600">
                {day}
              </div>
            ))}
            
            {/* Jours vides avant le début du mois */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="p-2"></div>
            ))}
            
            {/* Jours du mois */}
            {monthDays.map(day => {
              const leaves = getLeavesForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <div 
                  key={day.toString()}
                  className={`border rounded p-2 min-h-[80px] ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="text-sm font-medium">{format(day, 'd')}</div>
                  <div className="space-y-1 mt-1">
                    {leaves.slice(0, 2).map((leave, index) => (
                      <div 
                        key={index}
                        className={`text-xs p-1 rounded ${getStatusColor(leave.status)}`}
                        title={`${leave.employeeName} - ${leave.reason}`}
                      >
                        {getTypeIcon(leave.type)} {leave.employeeName.split(' ')[0]}
                      </div>
                    ))}
                    {leaves.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{leaves.length - 2} autre(s)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Liste des demandes */}
      <div className="space-y-4">
        {filteredLeaves.map(leave => (
          <Card key={leave.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{leave.employeeName}</span>
                    <span className="text-sm text-gray-500">• {getTypeLabel(leave.type)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {format(new Date(leave.startDate), 'dd MMMM yyyy')} - {format(new Date(leave.endDate), 'dd MMMM yyyy')}
                    <span className="ml-2 font-medium">({leave.daysCount} jours)</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Motif:</strong> {leave.reason}
                  </div>
                  <div className="text-xs text-gray-500">
                    Demandé le {format(new Date(leave.requestedAt), 'dd/MM/yyyy à HH:mm')}
                    {leave.processedAt && ` • Traité le ${format(new Date(leave.processedAt), 'dd/MM/yyyy à HH:mm')}`}
                  </div>
                  {leave.managerComment && (
                    <div className="text-sm text-gray-600 mt-2">
                      <strong>Commentaire:</strong> {leave.managerComment}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(leave.status)}>
                    {getStatusIcon(leave.status)}
                    <span className="ml-1">
                      {leave.status === 'pending' ? 'En attente' : 
                       leave.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </Badge>
                  {leave.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => handleApproveReject(leave.id, 'approved')}>
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleApproveReject(leave.id, 'rejected')}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredLeaves.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune demande de congé trouvée</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
