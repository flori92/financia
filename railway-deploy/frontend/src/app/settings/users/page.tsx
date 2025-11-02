"use client";

import { useState } from "react";
import { UserCog, Plus, Mail, Shield, Edit, Trash2 } from "lucide-react";

const ROLES = [
  { value: "admin", label: "Administrateur", color: "bg-red-100 text-red-700" },
  { value: "accountant", label: "Comptable", color: "bg-blue-100 text-blue-700" },
  { value: "manager", label: "Manager", color: "bg-green-100 text-green-700" },
  { value: "user", label: "Utilisateur", color: "bg-gray-100 text-gray-700" },
];

const MOCK_USERS = [
  { id: 1, name: "Admin BMS", email: "admin@bms.bj", role: "admin", status: "active" },
  { id: 2, name: "Comptable Cabinet", email: "comptable@cabinet.bj", role: "accountant", status: "active" },
  { id: 3, name: "Entrepreneur Test", email: "entrepreneur@test.bj", role: "manager", status: "active" },
  { id: 4, name: "Admin Fiscal", email: "taxadmin@dgi.bj", role: "user", status: "active" },
];

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role: "user" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: users.length + 1,
      ...formData,
      status: "active"
    };
    setUsers([...users, newUser]);
    setFormData({ name: "", email: "", role: "user" });
    setShowForm(false);
  };

  const getRoleColor = (role: string) => {
    return ROLES.find(r => r.value === role)?.color || "bg-gray-100 text-gray-700";
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find(r => r.value === role)?.label || role;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs & droits</h1>
          <p className="text-gray-600 mt-1">Gestion des accès et permissions</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </button>
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
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
                Créer
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      <Shield className="w-3 h-3" />
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Actif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
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
    </div>
  );
}
