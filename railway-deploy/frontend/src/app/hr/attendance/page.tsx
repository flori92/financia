"use client";
import { useState, useEffect } from "react";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { ProtectedPage } from "@/components/auth/ProtectedPage";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "early_leave";
  hoursWorked: number;
  notes?: string;
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  averageHours: number;
}

function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      // Simulation de données de présence
      const mockData: AttendanceRecord[] = [
        {
          id: "ATT-001",
          employeeId: "EMP-001",
          employeeName: "Jean Dupont",
          date: selectedDate,
          checkIn: "08:30",
          checkOut: "17:45",
          status: "present",
          hoursWorked: 8.25,
          notes: ""
        },
        {
          id: "ATT-002",
          employeeId: "EMP-002",
          employeeName: "Marie Martin",
          date: selectedDate,
          checkIn: "09:15",
          checkOut: "18:00",
          status: "late",
          hoursWorked: 8.0,
          notes: "Retard dû au transport"
        },
        {
          id: "ATT-003",
          employeeId: "EMP-003",
          employeeName: "Pierre Bernard",
          date: selectedDate,
          checkIn: "08:00",
          checkOut: "17:30",
          status: "present",
          hoursWorked: 8.5,
          notes: ""
        },
        {
          id: "ATT-004",
          employeeId: "EMP-004",
          employeeName: "Sophie Leroy",
          date: selectedDate,
          checkIn: "",
          checkOut: "",
          status: "absent",
          hoursWorked: 0,
          notes: "Congé maladie"
        },
        {
          id: "ATT-005",
          employeeId: "EMP-005",
          employeeName: "Thomas Moreau",
          date: selectedDate,
          checkIn: "08:15",
          checkOut: "16:30",
          status: "early_leave",
          hoursWorked: 7.25,
          notes: "Départ anticipé - rendez-vous médical"
        }
      ];

      const mockStats: AttendanceStats = {
        totalEmployees: 5,
        presentToday: 3,
        absentToday: 1,
        lateToday: 1,
        averageHours: 7.5
      };

      setAttendanceData(mockData);
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des données de présence:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "early_leave":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4" />;
      case "absent":
        return <AlertCircle className="w-4 h-4" />;
      case "late":
        return <Clock className="w-4 h-4" />;
      case "early_leave":
        return <TrendingUp className="w-4 h-4 rotate-90" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "Présent";
      case "absent":
        return "Absent";
      case "late":
        return "En retard";
      case "early_leave":
        return "Départ anticipé";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données de présence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            Gestion des Présences
          </h1>
          <p className="text-gray-600 mt-2">
            Suivi et gestion des présences du personnel
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Date de présence :
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Présents</p>
                  <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absents</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absentToday}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Retards</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.lateToday}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Heures moyennes</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.averageHours}h</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Liste des présences du {new Date(selectedDate).toLocaleDateString('fr-FR')}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrivée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Départ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heures travaillées
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.employeeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkIn || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOut || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hoursWorked > 0 ? `${record.hoursWorked}h` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AttendancePageWrapper() {
  return (
    <ProtectedPage requiredRole="ROLE_HR">
      <AttendancePage />
    </ProtectedPage>
  );
}