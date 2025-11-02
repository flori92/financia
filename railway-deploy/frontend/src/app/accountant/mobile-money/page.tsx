"use client";

import { useState, useEffect } from "react";
import { 
  Smartphone, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Download
} from "lucide-react";
import { apiGet, getCompanyId } from "@/lib/api";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";

type TransactionStatus = "pending" | "processing" | "success" | "failed" | "canceled";

interface MobileMoneyTransaction {
  id: string;
  invoiceId: string;
  provider: string;
  amount: number;
  currency: string;
  txRef: string;
  phoneNumber: string;
  customerEmail?: string;
  customerName?: string;
  status: TransactionStatus;
  statusMessage?: string;
  createdAt: string;
  completedAt?: string;
  providerResponse?: any;
  metadata?: any;
  invoice?: {
    id: string;
    invoiceNumber: string;
  };
}

interface TransactionStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  totalAmount: number;
  successfulAmount: number;
  byProvider: Array<{
    provider: string;
    count: number;
    total: number;
  }>;
}

export default function MobileMoneyPage() {
  const [transactions, setTransactions] = useState<MobileMoneyTransaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<MobileMoneyTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    provider: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const loadTransactions = async () => {
    try {
      const companyId = getCompanyId();
      if (!companyId) {
        setError("Aucune entreprise sélectionnée");
        return;
      }

      setLoading(true);
      
      // Charger les transactions
      const transactionsResponse = await apiGet("/api/v1/mobile-money/transactions", {
        companyId,
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      setTransactions(transactionsResponse.transactions || []);
      setPagination(transactionsResponse.pagination);

      // Charger les statistiques
      const statsResponse = await apiGet("/api/v1/mobile-money/stats", {
        companyId,
      });
      setStats(statsResponse);

    } catch (err: any) {
      setError(err?.message || "Impossible de charger les transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, filters]);

  // Écouter les changements de société
  useEffect(() => {
    const handleCompanyChange = () => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadTransactions();
    };

    window.addEventListener("bms-company-changed", handleCompanyChange);
    return () => window.removeEventListener("bms-company-changed", handleCompanyChange);
  }, [filters]);

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
      case "canceled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "processing":
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    const badges = {
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      canceled: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
      pending: "bg-amber-100 text-amber-800",
    };

    const labels = {
      success: "Succès",
      failed: "Échec",
      canceled: "Annulé",
      processing: "En cours",
      pending: "En attente",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      mtn: "🟠",
      moov: "🟦", 
      orange: "🟧",
      wave: "🟪",
      kkiapay: "💚",
      fedapay: "💙",
    };
    return icons[provider] || "📱";
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      provider: "",
      startDate: "",
      endDate: "",
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-900 font-medium">Erreur</p>
        </div>
        <p className="text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-blue-600" />
            Transactions Mobile Money
          </h1>
          <p className="text-gray-600">Suivi des paiements par mobile money</p>
        </div>
        <button
          onClick={loadTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Montant total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalAmount, 'XOF')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Succès</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filtres
              {Object.values(filters).some(Boolean) && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>

            {Object.values(filters).some(Boolean) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            {pagination.total} transaction{pagination.total > 1 ? 's' : ''}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="success">Succès</option>
              <option value="failed">Échec</option>
              <option value="pending">En attente</option>
              <option value="processing">En cours</option>
              <option value="canceled">Annulé</option>
            </select>

            <select
              value={filters.provider}
              onChange={(e) => handleFilterChange('provider', e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Tous les providers</option>
              <option value="mtn">MTN</option>
              <option value="moov">Moov</option>
              <option value="orange">Orange</option>
              <option value="wave">Wave</option>
              <option value="kkiapay">Kkiapay</option>
              <option value="fedapay">FedaPay</option>
            </select>

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="px-3 py-2 border rounded-lg"
              placeholder="Date début"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="px-3 py-2 border rounded-lg"
              placeholder="Date fin"
            />
          </div>
        )}
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Transaction</th>
                <th className="text-left p-4 font-medium">Client</th>
                <th className="text-left p-4 font-medium">Provider</th>
                <th className="text-left p-4 font-medium">Montant</th>
                <th className="text-left p-4 font-medium">Statut</th>
                <th className="text-left p-4 font-medium">Date</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.txRef}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.invoice?.invoiceNumber || `Facture #${transaction.invoiceId}`}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">
                        {transaction.customerName || transaction.phoneNumber}
                      </p>
                      {transaction.customerEmail && (
                        <p className="text-sm text-gray-600">{transaction.customerEmail}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span>{getProviderIcon(transaction.provider)}</span>
                      <span className="font-medium capitalize">{transaction.provider}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount, transaction.currency as CurrencyCode)}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      {getStatusBadge(transaction.status)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="text-sm">
                        {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.createdAt).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedTransaction(transaction)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium">Aucune transaction</p>
              <p className="text-gray-500 text-sm">
                Les transactions mobile money apparaîtront ici
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Page {pagination.page} sur {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal détails */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Détails de la transaction</h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Référence</p>
                  <p className="font-medium">{selectedTransaction.txRef}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Statut</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTransaction.status)}
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <div className="flex items-center gap-2">
                    <span>{getProviderIcon(selectedTransaction.provider)}</span>
                    <span className="capitalize">{selectedTransaction.provider}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Montant</p>
                  <p className="font-semibold">
                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency as CurrencyCode)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{selectedTransaction.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Client</p>
                  <p className="font-medium">
                    {selectedTransaction.customerName || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">
                    {selectedTransaction.customerEmail || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Facture</p>
                  <p className="font-medium">
                    {selectedTransaction.invoice?.invoiceNumber || `#${selectedTransaction.invoiceId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Créée le</p>
                  <p className="font-medium">
                    {new Date(selectedTransaction.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Complétée le</p>
                  <p className="font-medium">
                    {selectedTransaction.completedAt
                      ? new Date(selectedTransaction.completedAt).toLocaleString('fr-FR')
                      : 'Non complétée'}
                  </p>
                </div>
              </div>

              {selectedTransaction.statusMessage && (
                <div>
                  <p className="text-sm text-gray-600">Message de statut</p>
                  <p className="font-medium">{selectedTransaction.statusMessage}</p>
                </div>
              )}

              {selectedTransaction.providerResponse && (
                <div>
                  <p className="text-sm text-gray-600">Réponse provider</p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedTransaction.providerResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
