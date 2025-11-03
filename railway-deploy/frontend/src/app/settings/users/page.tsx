"use client";
// Utilisateurs - MODE DYNAMIQUE avec API backend
import { getBaseUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { UserCog, Plus, Mail, Shield, Edit, Trash2, RefreshCw, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "accountant" | "manager" | "user";
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

interface UsersData {
  users: User[];
  totalUsers: number;
  activeUsers: number;
  period: string;
}

const ROLES = [
  { value: "admin", label: "Administrateur", color: "bg-red-100 text-red-700" },
  { value: "accountant", label: "Comptable", color: "bg-blue-100 text-blue-700" },
  { value: "manager", label: "Manager", color: "bg-green-100 text-green-700" },
  { value: "user", label: "Utilisateur", color: "bg-gray-100 text-gray-700" },
];

export default function UsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "user" as const });
  const [creatingUser, setCreatingUser] = useState(false);

  // Charger les utilisateurs depuis l'API
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7";
      const response = await fetch(
        `${getBaseUrl()}/api/v1/settings/users?companyId=${companyId}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const apiData = await response.json();
      
      // Transformer les données API au format attendu
      const transformedData: UsersData = {
        users: apiData.users || [],
        totalUsers: apiData.totalUsers || 0,
        activeUsers: apiData.activeUsers || 0,
        period: apiData.period || 'Utilisateurs actuels'
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // En cas d'erreur, afficher des données de démonstration
      const mockUsers: User[] = [
        { id: "1", name: "Admin BMS", email: "admin@bms.bj", role: "admin", status: "active", createdAt: "2025-01-01", lastLogin: "2025-01-19" },
        { id: "2", name: "Comptable Cabinet", email: "comptable@cabinet.bj", role: "accountant", status: "active", createdAt: "2025-01-05", lastLogin: "2025-01-18" },
        { id: "3", name: "Entrepreneur Test", email: "entrepreneur@test.bj", role: "manager", status: "active", createdAt: "2025-01-10", lastLogin: "2025-01-17" },
        { id: "4", name: "Admin Fiscal", email: "taxadmin@dgi.bj", role: "user", status: "active", createdAt: "2025-01-12", lastLogin: "2025-01-16" }
      ];
      
      setData({
        users: mockUsers,
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.status === 'active').length,
        period: 'Données de démonstration'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage du composant
  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    
    try {
      // Simuler la création (remplacer par appel API réel)
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      if (data) {
        const updatedUsers = [...data.users, newUser];
        setData({
          ...data,
          users: updatedUsers,
          totalUsers: updatedUsers.length,
          activeUsers: updatedUsers.filter(u => u.status === 'active').length
        });
      }
      
      setFormData({ name: "", email: "", role: "user" });
      setShowForm(false);
    } catch (error) {
      console.error("Erreur création utilisateur:", error);
      alert("Erreur lors de la création de l'utilisateur");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }
    
    try {
      // Simuler la suppression (remplacer par appel API réel)
      if (data) {
        const updatedUsers = data.users.filter(u => u.id !== userId);
        setData({
          ...data,
          users: updatedUsers,
          totalUsers: updatedUsers.length,
          activeUsers: updatedUsers.filter(u => u.status === 'active').length
        });
      }
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const getRoleColor = (role: string) => {
    return ROLES.find(r => r.value === role)?.color || "bg-gray-100 text-gray-700";
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find(r => r.value === role)?.label || role;
  };

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Utilisateurs & droits</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des utilisateurs...</p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur sans données
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Utilisateurs & droits</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadUsers}
                className="mt-2 text-sm text-rose-600 hover:text-rose-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs & droits</h1>
          <p className="text-gray-600 text-sm">{data.period}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadUsers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* KPIs Utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCog className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total utilisateurs</div>
              <div className="text-xl font-bold text-gray-900">{data.totalUsers}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Utilisateurs actifs</div>
              <div className="text-xl font-bold text-green-600">{data.activeUsers}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Taux d'activation</div>
              <div className="text-xl font-bold text-purple-600">
                {data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Ajouter un utilisateur</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom complet</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rôle</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={creatingUser}
                className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:opacity-50"
              >
                {creatingUser ? 'Création...' : 'Créer'}
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Liste des utilisateurs</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Nom</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Rôle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Dernière connexion</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicateur mode démo si erreur */}
      {error && data && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <p className="text-amber-800 text-sm">
              Mode démonstration: {data.period}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
