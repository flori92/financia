"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { fr } from "date-fns/locale";

interface LeaveRequest {
  id: string;
  employee: string;
  type: 'conge' | 'maladie' | 'absence';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  days: number;
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employee: 'Jean Dupont',
    type: 'conge',
    startDate: new Date(2025, 10, 15), // 15 Nov 2025
    endDate: new Date(2025, 10, 20),   // 20 Nov 2025
    status: 'approved',
    reason: 'Vacances annuelles',
    days: 6
  },
  {
    id: '2',
    employee: 'Marie Martin',
    type: 'maladie',
    startDate: new Date(2025, 10, 8),  // 8 Nov 2025
    endDate: new Date(2025, 10, 10),  // 10 Nov 2025
    status: 'approved',
    reason: 'Congé maladie',
    days: 3
  },
  {
    id: '3',
    employee: 'Pierre Durand',
    type: 'conge',
    startDate: new Date(2025, 10, 25), // 25 Nov 2025
    endDate: new Date(2025, 10, 28),  // 28 Nov 2025
    status: 'pending',
    reason: 'Vacances familiales',
    days: 4
  }
];

export default function LeavesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newRequest, setNewRequest] = useState({
    type: 'conge' as 'conge' | 'maladie' | 'absence',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const emptyDays = Array(startDayOfWeek).fill(null);

  const getLeavesForDate = (date: Date) => {
    return leaveRequests.filter(leave => 
      date >= leave.startDate && date <= leave.endDate
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'conge': return '🏖️';
      case 'maladie': return '🏥';
      case 'absence': return '📋';
      default: return '📅';
    }
  };

  const handleNewRequest = () => {
    if (!newRequest.startDate || !newRequest.endDate || !newRequest.reason) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const startDate = new Date(newRequest.startDate);
    const endDate = new Date(newRequest.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const request: LeaveRequest = {
      id: Date.now().toString(),
      employee: 'Utilisateur courant',
      type: newRequest.type,
      startDate,
      endDate,
      status: 'pending',
      reason: newRequest.reason,
      days
    };

    setLeaveRequests([...leaveRequests, request]);
    setNewRequest({ type: 'conge', startDate: '', endDate: '', reason: '' });
    setShowNewRequest(false);
    alert('Demande de congé soumise avec succès !');
  };

  const handleApprove = (id: string) => {
    setLeaveRequests(leaveRequests.map(req => 
      req.id === id ? { ...req, status: 'approved' } : req
    ));
  };

  const handleReject = (id: string) => {
    setLeaveRequests(leaveRequests.map(req => 
      req.id === id ? { ...req, status: 'rejected' } : req
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Congés & Absences</h1>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouvelle demande
        </Button>
      </div>

      {/* Modal Nouvelle Demande */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nouvelle demande de congé</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({...newRequest, type: e.target.value as any})}
                  className="w-full p-2 border rounded"
                >
                  <option value="conge">Congé payé</option>
                  <option value="maladie">Congé maladie</option>
                  <option value="absence">Absence</option>
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
                  placeholder="Motif de la demande..."
                />
              </div>
              <div className="flex gap-2 justify-end">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
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
              
              {/* Jours vides du début */}
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="p-2"></div>
              ))}
              
              {/* Jours du mois */}
              {monthDays.map(day => {
                const leaves = getLeavesForDate(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div 
                    key={day.toISOString()}
                    className={`border rounded p-2 min-h-[80px] cursor-pointer transition-colors ${
                      isToday ? 'bg-blue-50 border-blue-300' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-sm font-medium">{format(day, 'd')}</div>
                    <div className="space-y-1 mt-1">
                      {leaves.slice(0, 2).map((leave, index) => (
                        <div 
                          key={index}
                          className={`text-xs p-1 rounded ${getStatusColor(leave.status)}`}
                          title={`${leave.employee} - ${leave.reason}`}
                        >
                          {getTypeIcon(leave.type)} {leave.employee.split(' ')[0]}
                        </div>
                      ))}
                      {leaves.length > 2 && (
                        <div className="text-xs text-gray-500">+{leaves.length - 2} plus</div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Demandes en attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaveRequests.filter(req => req.status === 'pending').map(request => (
                  <div key={request.id} className="border rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{request.employee}</div>
                        <div className="text-sm text-gray-600">{request.reason}</div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        En attente
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {getTypeIcon(request.type)} {format(request.startDate, 'dd/MM')} - {format(request.endDate, 'dd/MM/yyyy')}
                      <span className="ml-2">({request.days} jours)</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApprove(request.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />Approuver
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                        <XCircle className="w-4 h-4 mr-1" />Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
                {leaveRequests.filter(req => req.status === 'pending').length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucune demande en attente</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Mon solde de congés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Congés payés</span>
                  <span className="font-medium">18 / 25 jours</span>
                </div>
                <div className="flex justify-between">
                  <span>Congés maladie</span>
                  <span className="font-medium">5 / 10 jours</span>
                </div>
                <div className="flex justify-between">
                  <span>RTT</span>
                  <span className="font-medium">8 / 12 jours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
