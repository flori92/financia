"use client";

import { useState, useEffect, useRef } from "react";
import { UserCog, Plus, Mail, Shield, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete, getCompanyId } from "@/lib/api";

const ROLES = [
  { value: "admin", label: "Administrateur", color: "bg-red-100 text-red-700" },
  { value: "accountant", label: "Comptable", color: "bg-blue-100 text-blue-700" },
  { value: "manager", label: "Manager", color: "bg-green-100 text-green-700" },
  { value: "user", label: "Utilisateur", color: "bg-gray-100 text-gray-700" },
];

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form refs
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune société sélectionnée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }

      const data = await apiGet("/api/v1/users", { companyId });
      setUsers(data);
    } catch (err: any) {
      console.error("Erreur chargement utilisateurs:", err);
      setError(err.message || "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const companyId = getCompanyId();
      if (!companyId) {
        triggerToast("error", "Aucune société sélectionnée");
        return;
      }

      const formData = {
        email: emailRef.current?.value || "",
        firstName: firstNameRef.current?.value || "",
        lastName: lastNameRef.current?.value || "",
        password: passwordRef.current?.value || "",
        role: roleRef.current?.value || "user",
        companyId,
      };

      // Validation
      if (!formData.email) {
        triggerToast("error", "L'email est requis");
        return;
      }

      if (!editingUser && !formData.password) {
        triggerToast("error", "Le mot de passe est requis pour un nouvel utilisateur");
        return;
      }

      if (editingUser) {
        // Update
        await apiPut(`/api/v1/users/${editingUser.id}`, {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
        });
        triggerToast("success", "Utilisateur modifié avec succès !");
      } else {
        // Create
        await apiPost("/api/v1/users", formData);
        triggerToast("success", "Utilisateur créé avec succès !");
      }

      await loadUsers();
      closeForm();
    } catch (err: any) {
      console.error("Erreur enregistrement utilisateur:", err);
      triggerToast("error", err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver cet utilisateur ?")) {
      return;
    }

    try {
      await apiDelete(`/api/v1/users/${userId}`);
      triggerToast("success", "Utilisateur désactivé");
      await loadUsers();
    } catch (err: any) {
      triggerToast("error", "Erreur lors de la suppression");
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const endpoint = user.isActive
        ? `/api/v1/users/${user.id}/deactivate`
        : `/api/v1/users/${user.id}/activate`;

      await apiPut(endpoint, {});
      triggerToast("success", user.isActive ? "Utilisateur désactivé" : "Utilisateur activé");
      await loadUsers();
    } catch (err: any) {
      triggerToast("error", "Erreur lors du changement de statut");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const getRoleColor = (role: string) => {
    return ROLES.find(r => r.value === role)?.color || "bg-gray-100 text-gray-700";
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find(r => r.value === role)?.label || role;
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0D9488]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Erreur</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs & droits</h1>
          <p className="text-gray-600 mt-1">Gestion des accès et permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input
                  ref={firstNameRef}
                  type="text"
                  defaultValue={editingUser?.firstName || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input
                  ref={lastNameRef}
                  type="text"
                  defaultValue={editingUser?.lastName || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  disabled={saving}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                ref={emailRef}
                type="email"
                defaultValue={editingUser?.email || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                required
                disabled={saving}
              />
            </div>
            {!editingUser && (
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe *</label>
                <input
                  ref={passwordRef}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  required
                  disabled={saving}
                  minLength={6}
                  placeholder="Au moins 6 caractères"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Rôle</label>
              <select
                ref={roleRef}
                defaultValue={editingUser?.role || "user"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                disabled={saving}
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? "Enregistrement..." : editingUser ? "Modifier" : "Créer"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun utilisateur trouvé. Créez votre premier utilisateur.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-semibold">
                          {getUserDisplayName(user).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{getUserDisplayName(user)}</span>
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
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
