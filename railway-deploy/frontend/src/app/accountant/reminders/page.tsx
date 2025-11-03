"use client";

import { useState, useEffect } from "react";
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { 
  Clock, 
  AlertTriangle, 
  Send, 
  Eye, 
  Calendar, 
  Users, 
  TrendingUp,
  MessageCircle,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Reminder {
  invoice: string;
  customerName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  level: 'gentle' | 'firm' | 'formal' | 'legal';
  nextAction: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    gentle: 0,
    firm: 0,
    formal: 0,
    legal: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/invoices/reminders/preview?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7`);
      const data = await response.json();
      
      setReminders(data.reminders || []);
      
      // Calculer les statistiques
      const stats = {
        total: data.reminders?.length || 0,
        gentle: data.reminders?.filter((r: Reminder) => r.level === 'gentle').length || 0,
        firm: data.reminders?.filter((r: Reminder) => r.level === 'firm').length || 0,
        formal: data.reminders?.filter((r: Reminder) => r.level === 'formal').length || 0,
        legal: data.reminders?.filter((r: Reminder) => r.level === 'legal').length || 0,
        totalAmount: data.reminders?.reduce((sum: number, r: Reminder) => sum + r.amount, 0) || 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des relances:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    setSending(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/invoices/reminders/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: '1805bc61-7cfd-44e9-8a63-17187bf05dc7' })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`${result.length} relances envoyées avec succès!`);
        loadReminders();
      } else {
        throw new Error('Erreur lors de l\'envoi des relances');
      }
    } catch (error) {
      alert('Erreur lors de l\'envoi des relances');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'gentle': return 'bg-blue-100 text-blue-800';
      case 'firm': return 'bg-orange-100 text-orange-800';
      case 'formal': return 'bg-red-100 text-red-800';
      case 'legal': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'gentle': return 'Rappel amical';
      case 'firm': return 'Rappel ferme';
      case 'formal': return 'Demande formelle';
      case 'legal': return 'Mise en demeure';
      default: return level;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'gentle': return <Clock className="w-4 h-4" />;
      case 'firm': return <AlertCircle className="w-4 h-4" />;
      case 'formal': return <AlertTriangle className="w-4 h-4" />;
      case 'legal': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Email')) return <Mail className="w-4 h-4" />;
    if (action.includes('WhatsApp')) return <MessageCircle className="w-4 h-4" />;
    if (action.includes('SMS')) return <Phone className="w-4 h-4" />;
    return <Send className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement des relances...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relances Clients</h1>
          <p className="text-gray-600">Gérez les relances de factures impayées</p>
        </div>
        <button
          onClick={sendReminders}
          disabled={sending || reminders.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0f7d73] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Envoyer toutes les relances
            </>
          )}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Users className="w-4 h-4" />
            Total relances
          </div>
          <div className="text-2xl font-semibold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">{safeToLocaleString(stats.totalAmount)} FCFA</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-blue-600 mb-1">
            <Clock className="w-4 h-4" />
            Rappels amicaux
          </div>
          <div className="text-2xl font-semibold text-blue-600">{stats.gentle}</div>
          <div className="text-xs text-gray-600">0-15 jours</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-orange-600 mb-1">
            <AlertCircle className="w-4 h-4" />
            Rappels fermes
          </div>
          <div className="text-2xl font-semibold text-orange-600">{stats.firm}</div>
          <div className="text-xs text-gray-600">15-30 jours</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-red-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            Demandes formelles
          </div>
          <div className="text-2xl font-semibold text-red-600">{stats.formal}</div>
          <div className="text-xs text-gray-600">30-45 jours</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-sm text-purple-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            Mises en demeure
          </div>
          <div className="text-2xl font-semibold text-purple-600">{stats.legal}</div>
          <div className="text-xs text-gray-600">+45 jours</div>
        </div>
      </div>

      {/* Tableau des relances */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Détail des relances</h2>
          <span className="text-sm text-gray-600">{reminders.length} facture(s) en retard</span>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune relance à envoyer</h3>
            <p className="text-gray-600">Toutes les factures sont à jour!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Facture</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Montant</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Échéance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Retard</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Niveau</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action prévue</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((reminder, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{reminder.invoice}</td>
                    <td className="py-3 px-4">{reminder.customerName}</td>
                    <td className="py-3 px-4 font-medium">
                      {new Intl.NumberFormat('fr-FR').format(reminder.amount)} FCFA
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(reminder.dueDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 font-medium">{reminder.daysOverdue}j</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getLevelColor(reminder.level)}`}>
                        {getLevelIcon(reminder.level)}
                        {getLevelLabel(reminder.level)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {getActionIcon(reminder.nextAction)}
                        {reminder.nextAction}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Comment fonctionnent les relances</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Rappel amical (0-15j)</strong> : Email uniquement</li>
              <li>• <strong>Rappel ferme (15-30j)</strong> : Email + WhatsApp</li>
              <li>• <strong>Demande formelle (30-45j)</strong> : Email + WhatsApp + SMS</li>
              <li>• <strong>Mise en demeure (+45j)</strong> : Notification légale par tous les canaux</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
