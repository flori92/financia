"use client";
import { getBaseUrl } from "@/lib/api";
import { ProfessionalExporter } from "@/lib/export-utils";
import { formatCurrency } from "@/lib/format-utils";
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
        fetch(`${getBaseUrl()}/api/v1/invoices`).then(r => {
          if (!r.ok) return [];
          return r.json();
        }).catch(() => []),
        fetch(`${getBaseUrl()}/api/v1/crm/contacts`).then(r => {
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

  const handleSendInvoice = async (invoiceId: string, method: 'email' | 'whatsapp' | 'sms') => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });
      
      if (response.ok) {
        alert(`Facture envoyée par ${method} avec succès!`);
        loadData();
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (err) {
      alert('Erreur lors de l\'envoi de la facture');
      console.error(err);
    }
  };

  const handleEmailDialogSend = async (data: { to: string; subject: string; message: string }) => {
    if (selectedInvoice) {
      await handleSendInvoice(selectedInvoice.id, 'email');
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
      await fetch(`${getBaseUrl()}/api/v1/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert('Erreur lors de l\'ajout de la facture');
    }
  };

  const handleExport = () => {
    if (!invoices || invoices.length === 0) {
      triggerToast("error", "Aucune facture à exporter");
      return;
    }

    // Données structurées pour l'export professionnel
    const exportData = {
      title: 'Liste des Factures',
      headers: ['Numéro', 'Client', 'Date', 'Échéance', 'Montant', 'Statut'],
      rows: invoices.map(inv => [
        inv.number,
        getClientName(inv.clientId),
        inv.date,
        inv.dueDate,
        inv.amount.toLocaleString('fr-FR') + ' FCFA',
        inv.status === 'paid' ? 'Payée' : inv.status === 'pending' ? 'En attente' : 'En retard'
      ]),
      metadata: {
        date: new Date().toLocaleDateString('fr-FR'),
        company: 'BMS Business Management System',
        period: 'Toutes les factures',
        author: 'Service Facturation'
      }
    };

    // Choix du format d'export
    const formatChoice = confirm('Choisir le format d\'export:\n\nOK = Excel (formaté avec styles)\nAnnuler = PDF (professionnel imprimable)');
    
    if (formatChoice) {
      // Export Excel avec styles professionnels
      ProfessionalExporter.exportExcel(exportData, 'factures');
      triggerToast("success", "Factures exportées en Excel avec styles professionnels !");
    } else {
      // Export PDF pour impression
      ProfessionalExporter.exportPDF(exportData, 'factures');
      triggerToast("success", "Factures exportées en PDF pour impression !");
    }
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
          <div className="text-2xl font-semibold text-[#0D9488]">{safeToLocaleString(totalRevenue)} FCFA</div>
          <div className="text-xs text-green-600">+12% vs mois dernier</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Factures impayées</div>
          <div className="text-2xl font-semibold text-orange-600">{safeToLocaleString(unpaidAmount)} FCFA</div>
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
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1 text-gray-600 hover:text-[#0D9488]" title="Voir">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-[#0D9488]" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendInvoice(invoice.id, 'email')}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Envoyer par Email"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSendInvoice(invoice.id, 'whatsapp')}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Envoyer par WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSendInvoice(invoice.id, 'sms')}
                        className="p-1 text-purple-600 hover:text-purple-800"
                        title="Envoyer par SMS"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
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
        onSend={handleEmailDialogSend}
        defaultTo={selectedInvoice ? getClientName(selectedInvoice.clientId) : ""}
        defaultSubject={selectedInvoice ? `Facture ${selectedInvoice.number}` : ""}
      />
    </div>
  );
}
