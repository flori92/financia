'use client';
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  X,
  Calendar,
  DollarSign,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface DirectDebit {
  id: string;
  mandateReference: string;
  label: string;
  creditor: string;
  amount: number;
  currency: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  nextExecutionDate?: string;
  status: 'active' | 'suspended' | 'cancelled' | 'completed';
  category?: string;
  notes?: string;
}

interface Statistics {
  total: number;
  active: number;
  suspended: number;
  monthlyAmount: number;
  upcomingCount: number;
}

export default function DirectDebitsPage() {
  const [directDebits, setDirectDebits] = useState<DirectDebit[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDebit, setEditingDebit] = useState<DirectDebit | null>(null);
  const [formData, setFormData] = useState<{
    mandateReference: string;
    label: string;
    creditor: string;
    amount: string;
    currency: string;
    frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
    dayOfMonth: string;
    startDate: string;
    endDate: string;
    category: string;
    notes: string;
  }>({
    mandateReference: '',
    label: '',
    creditor: '',
    amount: '',
    currency: 'XOF',
    frequency: 'monthly',
    dayOfMonth: '1',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    category: '',
    notes: '',
  });

  const companyId = 'default-company';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [debitsRes, statsRes] = await Promise.all([
        fetch(`${getBaseUrl()}/api/v1/treasury/direct-debits?companyId=${companyId}`),
        fetch(`${getBaseUrl()}/api/v1/treasury/direct-debits/statistics?companyId=${companyId}`),
      ]);

      if (debitsRes.ok) setDirectDebits(await debitsRes.json());
      if (statsRes.ok) setStatistics(await statsRes.json());
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      companyId,
      amount: parseFloat(formData.amount),
      dayOfMonth: parseInt(formData.dayOfMonth),
      endDate: formData.endDate || null,
    };

    try {
      const url = editingDebit
        ? `${getBaseUrl()}/api/v1/treasury/direct-debits/${editingDebit.id}`
        : `${getBaseUrl()}/api/v1/treasury/direct-debits`;
      
      const response = await fetch(url, {
        method: editingDebit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        loadData();
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce prélèvement ?')) return;

    try {
      const response = await fetch(
        `${getBaseUrl()}/api/v1/treasury/direct-debits/${id}`,
        { method: 'DELETE' }
      );
      if (response.ok) loadData();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleStatusChange = async (id: string, action: 'suspend' | 'reactivate' | 'cancel') => {
    try {
      const response = await fetch(
        `${getBaseUrl()}/api/v1/treasury/direct-debits/${id}/${action}`,
        { method: 'POST' }
      );
      if (response.ok) loadData();
    } catch (error) {
      console.error('Erreur changement statut:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      mandateReference: '',
      label: '',
      creditor: '',
      amount: '',
      currency: 'XOF',
      frequency: 'monthly',
      dayOfMonth: '1',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      category: '',
      notes: '',
    });
    setEditingDebit(null);
  };

  const openEditModal = (debit: DirectDebit) => {
    setEditingDebit(debit);
    setFormData({
      mandateReference: debit.mandateReference,
      label: debit.label,
      creditor: debit.creditor,
      amount: debit.amount.toString(),
      currency: debit.currency,
      frequency: debit.frequency,
      dayOfMonth: debit.dayOfMonth.toString(),
      startDate: debit.startDate.split('T')[0],
      endDate: debit.endDate ? debit.endDate.split('T')[0] : '',
      category: debit.category || '',
      notes: debit.notes || '',
    });
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      suspended: 'bg-amber-50 text-amber-700 border-amber-200',
      cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    const labels = {
      active: 'Actif',
      suspended: 'Suspendu',
      cancelled: 'Annulé',
      completed: 'Terminé',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getFrequencyLabel = (freq: string) => {
    const labels = {
      monthly: 'Mensuel',
      quarterly: 'Trimestriel',
      yearly: 'Annuel',
      'one-time': 'Unique',
    };
    return labels[freq as keyof typeof labels];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prélèvements automatiques</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos prélèvements récurrents et mandats SEPA
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-app-primary text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <Plus className="w-5 h-5" />
          Nouveau prélèvement
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-xl font-bold text-emerald-600">{statistics.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Pause className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Suspendus</p>
                <p className="text-xl font-bold text-amber-600">{statistics.suspended}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">À venir</p>
                <p className="text-xl font-bold text-purple-600">{statistics.upcomingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mensuel</p>
                <p className="text-xl font-bold text-rose-600">
                  {statistics.monthlyAmount.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-sm text-gray-700">Libellé</th>
              <th className="text-left p-4 font-semibold text-sm text-gray-700">Bénéficiaire</th>
              <th className="text-right p-4 font-semibold text-sm text-gray-700">Montant</th>
              <th className="text-left p-4 font-semibold text-sm text-gray-700">Fréquence</th>
              <th className="text-left p-4 font-semibold text-sm text-gray-700">Prochain</th>
              <th className="text-left p-4 font-semibold text-sm text-gray-700">Statut</th>
              <th className="text-right p-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {directDebits.map((debit) => (
              <tr key={debit.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{debit.label}</p>
                    <p className="text-sm text-gray-500">{debit.mandateReference}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{debit.creditor}</span>
                  </div>
                </td>
                <td className="p-4 text-right font-mono font-semibold">
                  {debit.amount.toLocaleString('fr-FR')} {debit.currency}
                </td>
                <td className="p-4">{getFrequencyLabel(debit.frequency)}</td>
                <td className="p-4">
                  {debit.nextExecutionDate ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(debit.nextExecutionDate).toLocaleDateString('fr-FR')}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4">{getStatusBadge(debit.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    {debit.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(debit.id, 'suspend')}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Suspendre"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {debit.status === 'suspended' && (
                      <button
                        onClick={() => handleStatusChange(debit.id, 'reactivate')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        title="Réactiver"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(debit)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {debit.status !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(debit.id, 'cancel')}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Annuler"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(debit.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {directDebits.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun prélèvement automatique configuré
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingDebit ? 'Modifier' : 'Nouveau'} prélèvement
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Référence mandat *</label>
                  <input
                    type="text"
                    value={formData.mandateReference}
                    onChange={(e) => setFormData({ ...formData, mandateReference: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Libellé *</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bénéficiaire *</label>
                <input
                  type="text"
                  value={formData.creditor}
                  onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Montant *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Devise</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="XOF">XOF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fréquence *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  >
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="yearly">Annuel</option>
                    <option value="one-time">Unique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Jour du mois</label>
                  <input
                    type="number"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    min="1"
                    max="31"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date de début *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date de fin (optionnelle)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Catégorie</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Loyer, électricité, abonnement..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-app-primary text-white rounded-lg hover:bg-teal-700"
                >
                  {editingDebit ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
