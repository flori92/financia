"use client";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Calendar, Download, Filter, Search } from "lucide-react";

interface Transaction {
  id: string;
  type: 'bank' | 'mobile' | 'cash';
  reference: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  description: string;
  partyName: string;
  method: string;
  category: string;
  metadata: any;
}

interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtres
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7"; // Default company ID

  const loadTransactions = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        companyId,
        page: page.toString(),
        limit: '20',
        type: typeFilter,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiGet(`/payments/all-transactions?${params}`) as TransactionsResponse;
      
      let filteredTransactions = response.transactions || [];
      
      // Filtrage par terme de recherche
      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(transaction =>
          transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setTransactions(filteredTransactions);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      console.error('Erreur chargement transactions:', err);
      setError('Impossible de charger les transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [typeFilter, startDate, endDate]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return '🏦';
      case 'mobile':
        return '📱';
      case 'cash':
        return '💵';
      default:
        return '💳';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      completed: 'Terminé',
      pending: 'En attente',
      failed: 'Échoué',
      cancelled: 'Annulé',
    };

    return (
      <Badge className={variants[status] || variants.pending}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank':
        return 'Bancaire';
      case 'mobile':
        return 'Mobile Money';
      case 'cash':
        return 'Espèces';
      default:
        return 'Autre';
    }
  };

  const exportTransactions = () => {
    // Créer un CSV simple
    const headers = ['Date', 'Type', 'Référence', 'Tiers', 'Méthode', 'Montant', 'Statut', 'Description'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString('fr-FR'),
        getTypeLabel(t.type),
        t.reference,
        t.partyName,
        t.method,
        t.amount,
        t.status,
        `"${t.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-gray-600">Historique complet de toutes les transactions</p>
        </div>
        <Button onClick={exportTransactions} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Référence, tiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="bank">Bancaire</SelectItem>
                  <SelectItem value="mobile">Mobile Money</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Date début</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Date fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => loadTransactions(1)}
                className="w-full"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                🏦
              </div>
              <div>
                <div className="text-sm text-gray-600">Bancaires</div>
                <div className="text-xl font-semibold">
                  {transactions.filter(t => t.type === 'bank').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                📱
              </div>
              <div>
                <div className="text-sm text-gray-600">Mobile Money</div>
                <div className="text-xl font-semibold">
                  {transactions.filter(t => t.type === 'mobile').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">
                💵
              </div>
              <div>
                <div className="text-sm text-gray-600">Espèces</div>
                <div className="text-xl font-semibold">
                  {transactions.filter(t => t.type === 'cash').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <div className="text-sm text-gray-600">Total transactions</div>
                <div className="text-xl font-semibold">{total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Liste des transactions</span>
            <span className="text-sm font-normal text-gray-500">
              {total} transaction{total > 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>{error}</p>
              <Button onClick={() => loadTransactions()} className="mt-4">
                Réessayer
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune transaction trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {getTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.reference}</div>
                      <div className="text-sm text-gray-600">{transaction.partyName}</div>
                      <div className="text-sm text-gray-500">{transaction.description}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {new Intl.NumberFormat('fr-FR').format(transaction.amount)} {transaction.currency}
                    </div>
                    <div className="text-sm text-gray-600">{transaction.method}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(transaction.status)}
                    <Badge variant="outline">
                      {getTypeLabel(transaction.type)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => loadTransactions(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadTransactions(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
