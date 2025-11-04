"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  Shield, 
  Users, 
  Settings, 
  Activity,
  Lock,
  Eye,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Key,
  Monitor,
  RefreshCw,
  Download,
  Upload,
  UserPlus,
  UserMinus,
  Edit,
  Trash2,
  Search,
  Filter
} from "lucide-react";

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  activeCompanies: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastBackup: string;
}

interface UserAccount {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  company: string;
}

interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

function SuperAdmin() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'system' | 'logs' | 'security'>('dashboard');
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSuperAdminData();
  }, []);

  const loadSuperAdminData = async () => {
    setLoading(true);
    try {
      // Simulation des données Super Admin
      const statsData: SystemStats = {
        totalUsers: 156,
        activeUsers: 142,
        totalCompanies: 12,
        activeCompanies: 11,
        systemHealth: 'healthy',
        uptime: 99.9,
        lastBackup: '2025-11-04T02:30:00Z'
      };

      const usersData: UserAccount[] = [
        {
          id: "USER-001",
          email: "alice.martin@company.com",
          name: "Alice Martin",
          roles: ["ROLE_EMPLOYEE"],
          status: "active",
          lastLogin: "2025-11-04T09:15:00Z",
          company: "Tech Corp"
        },
        {
          id: "USER-002",
          email: "bob.bernard@company.com",
          name: "Bob Bernard",
          roles: ["ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_FISCAL_ADMIN"],
          status: "active",
          lastLogin: "2025-11-04T08:45:00Z",
          company: "Tech Corp"
        },
        {
          id: "USER-003",
          email: "carol.dubois@company.com",
          name: "Carol Dubois",
          roles: ["ROLE_EMPLOYEE", "ROLE_HR"],
          status: "active",
          lastLogin: "2025-11-04T10:30:00Z",
          company: "Tech Corp"
        },
        {
          id: "USER-004",
          email: "david.expert@company.com",
          name: "David Expert",
          roles: ["ROLE_EMPLOYEE", "ROLE_EXPERT_COMPTABLE", "ROLE_FISCAL_ADMIN"],
          status: "active",
          lastLogin: "2025-11-04T07:20:00Z",
          company: "Tech Corp"
        },
        {
          id: "USER-005",
          email: "eva.entrepreneur@company.com",
          name: "Eva Entrepreneur",
          roles: ["ROLE_EMPLOYEE", "ROLE_ENTREPRENEUR", "ROLE_FISCAL_ADMIN"],
          status: "active",
          lastLogin: "2025-11-04T11:00:00Z",
          company: "Tech Corp"
        }
      ];

      const logsData: SystemLog[] = [
        {
          id: "LOG-001",
          timestamp: "2025-11-04T11:30:00Z",
          user: "Bob Bernard",
          action: "LOGIN",
          resource: "Manager Space",
          status: "success",
          details: "Accès autorisé avec rôles Manager + Fiscal"
        },
        {
          id: "LOG-002",
          timestamp: "2025-11-04T11:25:00Z",
          user: "David Expert",
          action: "ROLE_CHANGE",
          resource: "User Management",
          status: "success",
          details: "Ajout rôle Fiscal Admin pour USER-004"
        },
        {
          id: "LOG-003",
          timestamp: "2025-11-04T11:20:00Z",
          user: "System",
          action: "BACKUP",
          resource: "Database",
          status: "success",
          details: "Backup automatique complété"
        },
        {
          id: "LOG-004",
          timestamp: "2025-11-04T11:15:00Z",
          user: "Unknown",
          action: "LOGIN_FAILED",
          resource: "Authentication",
          status: "error",
          details: "Tentative d'accès invalide depuis IP 192.168.1.100"
        }
      ];

      setSystemStats(statsData);
      setUsers(usersData);
      setLogs(logsData);
    } catch (error) {
      console.error('Erreur chargement données Super Admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (userId: string, action: 'edit' | 'suspend' | 'delete') => {
    console.log(`Action ${action} sur utilisateur:`, userId);
  };

  const handleSystemAction = (action: string) => {
    console.log(`Action système:`, action);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panneau d'administration...</p>
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
            <Shield className="w-8 h-8 text-purple-600" />
            Panneau Super Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Administration complète du système BMS
          </p>
        </div>

        {/* Alert de sécurité */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-medium text-amber-800">Accès Super Admin</h3>
              <p className="text-sm text-amber-700">
                Vous avez accès à toutes les fonctionnalités du système. Utilisez ces privilèges avec responsabilité.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
                { id: 'users', name: 'Utilisateurs', icon: Users },
                { id: 'system', name: 'Système', icon: Settings },
                { id: 'logs', name: 'Logs', icon: Activity },
                { id: 'security', name: 'Sécurité', icon: Lock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Onglet Dashboard */}
          {activeTab === 'dashboard' && systemStats && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vue d'ensemble du système</h2>
              
              {/* KPI System */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Utilisateurs totaux</p>
                      <p className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {systemStats.activeUsers} actifs ({Math.round(systemStats.activeUsers/systemStats.totalUsers*100)}%)
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Entreprises</p>
                      <p className="text-2xl font-bold text-green-600">{systemStats.totalCompanies}</p>
                    </div>
                    <Globe className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {systemStats.activeCompanies} actives
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="text-2xl font-bold text-purple-600">{systemStats.uptime}%</p>
                    </div>
                    <Monitor className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Disponibilité système</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Santé système</p>
                      <p className="text-2xl font-bold text-green-600">
                        {systemStats.systemHealth === 'healthy' ? '✓ Bon' : 
                         systemStats.systemHealth === 'warning' ? '⚠ Attention' : '✗ Critique'}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-amber-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Dernier backup: {new Date(systemStats.lastBackup).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Actions Rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                  <span>Redémarrer services</span>
                </button>
                
                <button className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Backup manuel</span>
                </button>
                
                <button className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Eye className="w-5 h-5" />
                  <span>Monitoring avancé</span>
                </button>
              </div>
            </div>
          )}

          {/* Onglet Utilisateurs */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Gestion des utilisateurs</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Nouvel utilisateur
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernière connexion
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, i) => (
                              <span key={i} className="inline-flex px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                {role.replace('ROLE_', '')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' :
                            user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'active' ? 'Actif' :
                             user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.lastLogin).toLocaleDateString('fr-FR')} {new Date(user.lastLogin).toLocaleTimeString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUserAction(user.id, 'edit')}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              className="text-amber-600 hover:text-amber-900"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Système */}
          {activeTab === 'system' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Administration système</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    Base de données
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      Optimiser la base
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Exporter les données
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Edit className="w-4 h-4" />
                      Modifier paramètres globaux
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Importer configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Logs */}
          {activeTab === 'logs' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Logs d'activité</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Exporter les logs
                </button>
              </div>

              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'success' ? 'bg-green-100 text-green-800' :
                            log.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {log.status === 'success' ? '✓ Succès' :
                             log.status === 'warning' ? '⚠ Attention' : '✗ Erreur'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{log.action}</span>
                          <span className="text-sm text-gray-500">{log.resource}</span>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {log.user} • {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sécurité du système</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-red-600" />
                    Authentification
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Authentification multi-facteurs</span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Activé
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Session timeout</span>
                      <span className="text-sm font-medium">30 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Restrictions IP</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Configurer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Audit de sécurité
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      Voir les tentatives d'accès
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <Lock className="w-4 h-4" />
                      Bloquer une adresse IP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <ProtectedPage requiredRole="ROLE_SUPER_ADMIN">
      <SuperAdmin />
    </ProtectedPage>
  );
}
