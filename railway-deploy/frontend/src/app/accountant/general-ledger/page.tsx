"use client";
// Grand livre - MODE DYNAMIQUE avec API backend
import { getBaseUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Calendar, RefreshCw, AlertTriangle } from "lucide-react";

interface LedgerEntry {
  date: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  entryNumber: string;
}

interface GeneralLedgerData {
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  period: string;
  isBalanced: boolean;
}

export default function GeneralLedgerPage() {
  const [data, setData] = useState<GeneralLedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [toast, setToast] = useState<{ type: "success" | "info"; message: string } | null>(null);

  const triggerToast = (type: "success" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2600);
  };

  // Charger les données du grand livre depuis l'API
  const loadGeneralLedger = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companyId = "1805bc61-7cfd-44e9-8a63-17187bf05dc7";
      const response = await fetch(
        `${getBaseUrl()}/api/v1/accounting/general-ledger?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`,
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
      const transformedData: GeneralLedgerData = {
        entries: apiData.entries || [],
        totalDebit: apiData.totalDebit || 0,
        totalCredit: apiData.totalCredit || 0,
        period: apiData.period || `Du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`,
        isBalanced: apiData.isBalanced || false
      };
      
      setData(transformedData);
    } catch (err) {
      console.error('Erreur chargement grand livre:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      
      // En cas d'erreur, afficher des données de démonstration
      const mockEntries = [
        { date: "2025-01-15", account: "411000", description: "Vente client ABC", debit: 120000, credit: 0, balance: 120000, entryNumber: "EC001" },
        { date: "2025-01-16", account: "411000", description: "Paiement client ABC", debit: 0, credit: 120000, balance: 0, entryNumber: "EC002" },
        { date: "2025-01-17", account: "411000", description: "Vente client XYZ", debit: 85000, credit: 0, balance: 85000, entryNumber: "EC003" },
        { date: "2025-01-18", account: "401000", description: "Achat fournisseur DEF", debit: 0, credit: 45000, balance: -45000, entryNumber: "EC004" },
        { date: "2025-01-19", account: "512000", description: "Dépôt banque", debit: 200000, credit: 0, balance: 200000, entryNumber: "EC005" },
        { date: "2025-01-20", account: "531000", description: "Retrait caisse", debit: 50000, credit: 0, balance: 50000, entryNumber: "EC006" }
      ];
      
      const totalDebit = mockEntries.reduce((sum, entry) => sum + entry.debit, 0);
      const totalCredit = mockEntries.reduce((sum, entry) => sum + entry.credit, 0);
      
      setData({
        entries: mockEntries,
        totalDebit,
        totalCredit,
        period: 'Données de démonstration',
        isBalanced: totalDebit === totalCredit
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    loadGeneralLedger();
  }, [startDate, endDate]);

  // Filtrer les entrées par recherche
  const filteredEntries = data?.entries.filter(entry => 
    entry.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // État de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Grand livre</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488] mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du grand livre...</p>
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
          <h1 className="text-2xl font-semibold">Grand livre</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-rose-800 font-medium">Erreur de chargement</h3>
              <p className="text-rose-700 text-sm">{error}</p>
              <button
                onClick={loadGeneralLedger}
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
          <h1 className="text-2xl font-semibold">Grand livre</h1>
          <p className="text-gray-600 text-sm">{data.period}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadGeneralLedger}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={() => triggerToast("success", "Export PDF/Excel disponible prochainement.")}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* KPIs du grand livre */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total des débits</div>
          <div className="text-xl font-bold text-green-600">
            {new Intl.NumberFormat('fr-FR').format(data.totalDebit)} FCFA
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total des crédits</div>
          <div className="text-xl font-bold text-red-600">
            {new Intl.NumberFormat('fr-FR').format(data.totalCredit)} FCFA
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Équilibre</div>
          <div className={`text-xl font-bold ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
            {data.isBalanced ? '✓ Équilibré' : '✗ Déséquilibré'}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Écritures</div>
          <div className="text-xl font-bold text-gray-900">
            {filteredEntries.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un compte, description ou N° écriture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2" 
            />
            <span className="text-gray-500">à</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2" 
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Aucune écriture trouvée pour les critères sélectionnés</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">N° Écriture</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Compte</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Débit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Crédit</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Solde</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm text-gray-600">{entry.entryNumber}</td>
                    <td className="py-3 px-4 text-sm">{new Date(entry.date).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-4 font-mono text-sm">{entry.account}</td>
                    <td className="py-3 px-4">{entry.description}</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      {entry.debit > 0 ? new Intl.NumberFormat('fr-FR').format(entry.debit) + ' FCFA' : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-red-600">
                      {entry.credit > 0 ? new Intl.NumberFormat('fr-FR').format(entry.credit) + ' FCFA' : '-'}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold ${entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {new Intl.NumberFormat('fr-FR').format(entry.balance)} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                  <td colSpan={4} className="py-3 px-4">TOTAUX</td>
                  <td className="py-3 px-4 text-right font-bold text-green-600">
                    {new Intl.NumberFormat('fr-FR').format(data.totalDebit)} FCFA
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-red-600">
                    {new Intl.NumberFormat('fr-FR').format(data.totalCredit)} FCFA
                  </td>
                  <td className={`py-3 px-4 text-right font-bold ${data.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {data.isBalanced ? '0' : new Intl.NumberFormat('fr-FR').format(data.totalDebit - data.totalCredit)} FCFA
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
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

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-slate-800 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}