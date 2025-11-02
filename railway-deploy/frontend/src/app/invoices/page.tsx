"use client";
import { getBaseUrl } from "@/lib/api";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Send, Eye, Edit, X } from "lucide-react";
import { EmailDialog } from "@/components/shared/EmailDialog";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        fetch('${getBaseUrl()}/api/v1/invoices').then(r => {
          if (!r.ok) return [];
          return r.json();
        }).catch(() => []),
        fetch('${getBaseUrl()}/api/v1/crm/contacts').then(r => {
          if (!r.ok) return [];
          return r.json();
        }).catch(() => [])
      ]);
      setInvoices(Array.isArray(invoicesRes) ? invoicesRes : []);
      setClients(Array.isArray(clientsRes) ? clientsRes : []);
    } catch (err) {
      console.error(err);
      setInvoices([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const invoice = {
      clientId: formData.get('clientId'),
      dueDate: formData.get('dueDate'),
      amount: Number(formData.get('amount')),
      items: [{ description: formData.get('description'), quantity: 1, unitPrice: Number(formData.get('amount')) }]
    };
    
    try {
      await fetch('${getBaseUrl()}/api/v1/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert('Erreur lors de la création');
    }
  };

  const handleSendInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      await fetch(`${getBaseUrl()}/api/v1/invoices/${selectedInvoice.id}/send`, { method: 'POST' });
      alert(`Facture ${selectedInvoice.number} envoyée par email`);
    } catch (err) {
      alert("Erreur lors de l'envoi");
    }
  };

  const handleExport = () => {
    const csv = [
      ['Numéro', 'Client', 'Date', 'Échéance', 'Montant', 'Statut'].join(','),
      ...invoices.map(inv => [inv.number, getClientName(inv.clientId), inv.date, inv.dueDate, inv.amount, inv.status].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'factures.csv';
    a.click();
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Client inconnu';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Facturation & Ventes</h1>
          <p className="text-gray-600">Gestion complète du cycle de vente</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Download className="w-4 h-4" />
            Export Factur-X
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">CA du mois</div>
          <div className="text-2xl font-semibold text-[#0D9488]">{totalRevenue.toLocaleString()} FCFA</div>
          <div className="text-xs text-green-600">+12% vs mois dernier</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Factures impayées</div>
          <div className="text-2xl font-semibold text-orange-600">{unpaidAmount.toLocaleString()} FCFA</div>
          <div className="text-xs text-gray-600">{invoices.filter(inv => inv.status === 'pending').length} facture(s)</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">DSO moyen</div>
          <div className="text-2xl font-semibold text-blue-600">28 jours</div>
          <div className="text-xs text-green-600">-2j vs objectif</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Taux transformation</div>
          <div className="text-2xl font-semibold text-purple-600">75%</div>
          <div className="text-xs text-gray-600">Devis → Factures</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une facture..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">N° Document</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Échéance</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Aucune facture</td></tr>
              ) : invoices.map((invoice, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{invoice.number}</td>
                  <td className="py-3 px-4">{getClientName(invoice.clientId)}</td>
                  <td className="py-3 px-4 text-sm">{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-sm">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {new Intl.NumberFormat('fr-FR').format(invoice.amount)} FCFA
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-gray-600 hover:text-[#0D9488]" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-[#0D9488]" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowEmailDialog(true);
                        }}
                        className="p-1 text-gray-600 hover:text-[#0D9488]"
                        title="Envoyer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Nouvelle facture</h2>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client</label>
                <select name="clientId" required className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input name="description" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Échéance</label>
                  <input name="dueDate" type="date" required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Montant (FCFA)</label>
                <input name="amount" type="number" required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EmailDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSend={handleSendInvoice}
        defaultTo={selectedInvoice ? getClientName(selectedInvoice.clientId) : ""}
        defaultSubject={selectedInvoice ? `Facture ${selectedInvoice.number}` : ""}
      />
    </div>
  );
}
