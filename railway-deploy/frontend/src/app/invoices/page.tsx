"use client";
import { getBaseUrl, apiGet } from "@/lib/api";
import { fetchPostWithAuth, fetchPutWithAuth } from "@/lib/fetch-with-auth";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProfessionalExporter } from "@/lib/export-utils";
import { formatCurrency } from "@/lib/format-utils";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Send, Eye, Edit, X } from "lucide-react";
import { ProfessionalEmailDialog } from "@/components/shared/ProfessionalEmailDialog";
import { ExportPreviewDialog } from "@/components/shared/ExportPreviewDialog";

export default function InvoicesPage() {
  const companyId = useCompanyId();
  const triggerToast = (type: "success" | "info" | "error", message: string) => {
    // Simuler un toast avec alert pour l'instant
    if (type === "error") {
      alert(`❌ Erreur: ${message}`);
    } else if (type === "success") {
      alert(`✅ Succès: ${message}`);
    } else {
      alert(`ℹ️ Info: ${message}`);
    }
  };

  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        apiGet('/api/v1/invoices', { companyId }).catch(() => []),
        apiGet('/api/v1/crm/contacts', { companyId }).catch(() => [])
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
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      alert('Facture introuvable');
      return;
    }

    const clientEmail = getClientEmail(invoice.clientId);
    const clientPhone = getClientPhone(invoice.clientId);
    const clientName = getClientName(invoice.clientId);

    try {
      // Validation des données client selon la méthode
      if (method === 'email' && !clientEmail) {
        alert('Ce client n\'a pas d\'adresse email enregistrée. Veuillez d\'abord ajouter l\'email du client.');
        return;
      }
      
      if (method === 'whatsapp' && !clientPhone) {
        alert('Ce client n\'a pas de numéro de téléphone enregistré. Veuillez d\'abord ajouter le téléphone du client.');
        return;
      }
      
      if (method === 'sms' && !clientPhone) {
        alert('Ce client n\'a pas de numéro de téléphone enregistré. Veuillez d\'abord ajouter le téléphone du client.');
        return;
      }

      // Préparation des données d'envoi avec informations client
      const sendPayload = {
        method,
        clientData: {
          email: clientEmail,
          phone: clientPhone,
          name: clientName
        },
        invoiceData: {
          number: invoice.number,
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          date: invoice.date
        }
      };

      const response = await fetchPostWithAuth(`${getBaseUrl()}/api/v1/invoices/${invoiceId}/send`, sendPayload);
      
      if (response.ok) {
        const result = await response.json();
        
        // Actions spécifiques selon méthode
        if (method === 'email') {
          alert(`✅ Facture ${invoice.number} envoyée par email à ${clientEmail}`);
        } else if (method === 'whatsapp') {
          // Ouvre WhatsApp Web avec message pré-rempli
          const message = encodeURIComponent(`Bonjour ${clientName},\n\nVeuillez trouver ci-joint votre facture ${invoice.number} d'un montant de ${invoice.amount.toLocaleString('fr-FR')} FCFA.\n\nÉchéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}\n\nCordialement,\nBMS Business Management System`);
          window.open(`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
          alert(`📱 WhatsApp ouvert pour envoyer la facture à ${clientName}`);
        } else if (method === 'sms') {
          // Ouvre interface SMS par défaut
          const message = encodeURIComponent(`Facture ${invoice.number} - ${invoice.amount.toLocaleString('fr-FR')} FCFA - Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')} - BMS`);
          window.open(`sms:${clientPhone}?body=${message}`, '_blank');
          alert(`📨 Interface SMS ouverte pour envoyer à ${clientName}`);
        }
        
        loadData();
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (err) {
      console.error('Erreur envoi facture:', err);
      
      // Fallback: actions manuelles si backend indisponible
      if (method === 'whatsapp' && clientPhone) {
        const message = encodeURIComponent(`Bonjour ${clientName},\n\nVeuillez trouver votre facture ${invoice.number} d'un montant de ${invoice.amount.toLocaleString('fr-FR')} FCFA.\n\nÉchéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}\n\nCordialement`);
        window.open(`https://wa.me/${clientPhone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
        alert('📱 WhatsApp ouvert (mode fallback)');
      } else if (method === 'sms' && clientPhone) {
        const message = encodeURIComponent(`Facture ${invoice.number} - ${invoice.amount.toLocaleString('fr-FR')} FCFA - Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`);
        window.open(`sms:${clientPhone}?body=${message}`, '_blank');
        alert('📨 Interface SMS ouverte (mode fallback)');
      } else if (method === 'email') {
        alert('📧 Veuillez utiliser votre client email habituel pour envoyer la facture au client.');
      }
    }
  };

  const handleEmailDialogSend = async (data: { 
    to: string; 
    cc?: string;
    subject: string; 
    message: string;
    attachments?: File[];
  }) => {
    if (selectedInvoice) {
      console.log('📧 Envoi email avec:', data);
      console.log('📎 Pièces jointes:', data.attachments?.length || 0);
      await handleSendInvoice(selectedInvoice.id, 'email');
      triggerToast('success', `Email envoyé à ${data.to} avec ${data.attachments?.length || 0} pièce(s) jointe(s)`);
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice);
    setShowEditModal(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedInvoice = {
      clientId: formData.get('clientId'),
      dueDate: formData.get('dueDate'),
      amount: Number(formData.get('amount')),
      items: [{ description: formData.get('description'), quantity: 1, unitPrice: Number(formData.get('amount')) }]
    };
    
    try {
      await fetchPutWithAuth(`${getBaseUrl()}/api/v1/invoices/${editingInvoice.id}`, updatedInvoice);
      setShowEditModal(false);
      loadData();
      triggerToast('success', 'Facture mise à jour avec succès');
    } catch (err) {
      triggerToast('error', 'Erreur lors de la mise à jour de la facture');
      console.error(err);
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
      await fetchPostWithAuth(`${getBaseUrl()}/api/v1/invoices`, invoice);
      setShowAddForm(false);
      loadData();
      triggerToast("success", "Facture créée avec succès");
    } catch (err) {
      triggerToast("error", "Erreur lors de la création de la facture");
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

  const getClientEmail = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.email || '';
  };

  const getClientPhone = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.phone || client?.mobile || '';
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

  const handleExportWithFormat = (format: 'pdf' | 'excel' | 'csv') => {
    const exportData = {
      title: 'Liste des Factures',
      headers: ['N° Facture', 'Client', 'Date', 'Échéance', 'Montant', 'Statut'],
      rows: invoices.map(inv => [
        inv.number,
        getClientName(inv.clientId),
        new Date(inv.date).toLocaleDateString('fr-FR'),
        new Date(inv.dueDate).toLocaleDateString('fr-FR'),
        inv.amount.toLocaleString('fr-FR') + ' FCFA',
        getStatusLabel(inv.status)
      ]),
      metadata: {
        date: new Date().toLocaleDateString('fr-FR'),
        company: 'BMS Business Management System',
        period: 'Toutes les factures',
        author: 'Service Facturation'
      }
    };

    if (format === 'excel') {
      ProfessionalExporter.exportExcel(exportData, 'factures');
      triggerToast("success", "✅ Factures exportées en Excel !");
    } else if (format === 'pdf') {
      ProfessionalExporter.exportPDF(exportData, 'factures');
      triggerToast("success", "✅ Factures exportées en PDF !");
    } else if (format === 'csv') {
      // Export CSV basique
      const csvContent = [
        exportData.headers.join(','),
        ...exportData.rows.map((row: any[]) => row.join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'factures.csv';
      link.click();
      triggerToast("success", "✅ Factures exportées en CSV !");
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
            onClick={() => setShowExportPreview(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Download className="w-4 h-4" />
            Prévisualiser & Exporter
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
          <div className="text-2xl font-semibold text-[#0D9488]">{totalRevenue.toLocaleString('fr-FR')} FCFA</div>
          <div className="text-xs text-green-600">+12% vs mois dernier</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Factures impayées</div>
          <div className="text-2xl font-semibold text-orange-600">{unpaidAmount.toLocaleString('fr-FR')} FCFA</div>
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
                      <button 
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-1 text-gray-600 hover:text-[#0D9488]" 
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditInvoice(invoice)}
                        className="p-1 text-gray-600 hover:text-[#0D9488]" 
                        title="Modifier"
                      >
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

      <ProfessionalEmailDialog
        isOpen={showEmailDialog}
        onClose={() => setShowEmailDialog(false)}
        onSend={handleEmailDialogSend}
        defaultTo={selectedInvoice ? getClientEmail(selectedInvoice.clientId) : ""}
        defaultSubject={selectedInvoice ? `Facture ${selectedInvoice.number}` : ""}
        context={selectedInvoice ? {
          clientName: getClientName(selectedInvoice.clientId),
          invoiceNumber: selectedInvoice.number,
          amount: selectedInvoice.amount,
          dueDate: selectedInvoice.dueDate,
          companyName: 'BMS'
        } : undefined}
      />

      {/* Modal Visualisation */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Détails de la facture {selectedInvoice.number}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informations client</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Client:</span> <span className="font-medium">{getClientName(selectedInvoice.clientId)}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Informations facture</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Numéro:</span> <span className="font-medium">{selectedInvoice.number}</span></div>
                    <div><span className="text-gray-600">Date:</span> <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString('fr-FR')}</span></div>
                    <div><span className="text-gray-600">Échéance:</span> <span className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString('fr-FR')}</span></div>
                    <div><span className="text-gray-600">Statut:</span> <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedInvoice.status)}`}>{getStatusLabel(selectedInvoice.status)}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Détail des articles</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Quantité</th>
                      <th className="text-right py-2">Prix unitaire</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedInvoice.items || []).map((item: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">{new Intl.NumberFormat('fr-FR').format(item.unitPrice)} FCFA</td>
                        <td className="text-right py-2 font-medium">{new Intl.NumberFormat('fr-FR').format(item.quantity * item.unitPrice)} FCFA</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan={3} className="py-2 text-right font-semibold">Total:</td>
                      <td className="text-right py-2 font-bold text-lg">{new Intl.NumberFormat('fr-FR').format(selectedInvoice.amount)} FCFA</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditInvoice(selectedInvoice);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleSendInvoice(selectedInvoice.id, 'email');
                  }}
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && editingInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Modifier la facture {editingInvoice.number}</h2>
              <button onClick={() => {
                setShowEditModal(false);
                setEditingInvoice(null);
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client</label>
                <select 
                  name="clientId" 
                  defaultValue={editingInvoice.clientId}
                  required 
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input 
                    name="description" 
                    defaultValue={editingInvoice.items?.[0]?.description || ''}
                    required 
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Échéance</label>
                  <input 
                    name="dueDate" 
                    type="date" 
                    defaultValue={editingInvoice.dueDate?.split('T')[0]}
                    required 
                    className="w-full px-3 py-2 border rounded-lg" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Montant (FCFA)</label>
                <input 
                  name="amount" 
                  type="number" 
                  defaultValue={editingInvoice.amount}
                  required 
                  className="w-full px-3 py-2 border rounded-lg" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingInvoice(null);
                  }} 
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Preview Dialog */}
      <ExportPreviewDialog
        isOpen={showExportPreview}
        onClose={() => setShowExportPreview(false)}
        onExport={handleExportWithFormat}
        title="Factures"
        data={invoices.map(inv => ({
          number: inv.number,
          client: getClientName(inv.clientId),
          date: new Date(inv.date).toLocaleDateString('fr-FR'),
          dueDate: new Date(inv.dueDate).toLocaleDateString('fr-FR'),
          amount: inv.amount,
          status: getStatusLabel(inv.status)
        }))}
        columns={[
          { key: 'number', label: 'N° Facture' },
          { key: 'client', label: 'Client' },
          { key: 'date', label: 'Date' },
          { key: 'dueDate', label: 'Échéance' },
          { key: 'amount', label: 'Montant', format: (val) => `${val.toLocaleString('fr-FR')} FCFA` },
          { key: 'status', label: 'Statut' }
        ]}
        summary={[
          { label: 'Total Factures', value: invoices.length },
          { label: 'CA Réalisé', value: `${totalRevenue.toLocaleString('fr-FR')} FCFA` },
          { label: 'Impayés', value: `${unpaidAmount.toLocaleString('fr-FR')} FCFA` },
          { label: 'Taux Paiement', value: `${Math.round((totalRevenue / (totalRevenue + unpaidAmount)) * 100)}%` }
        ]}
      />
    </div>
  );
}
