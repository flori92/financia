"use client";
import { useState } from "react";
import { Mail, PhoneCall, MessageSquare, FileText, X, CheckCircle } from "lucide-react";

interface ReminderPreview {
  invoice: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerWhatsApp?: string;
  level: 'gentle' | 'firm' | 'formal' | 'legal';
  daysOverdue: number;
  amount: number;
  penalty: number;
  totalDue: number;
  subject: string;
  emailMessage: string;
  smsMessage?: string;
  whatsappMessage?: string;
}

interface ReminderPreviewModalProps {
  reminder: ReminderPreview | null;
  onClose: () => void;
  onSend: (type: 'email' | 'sms' | 'whatsapp' | 'call') => void;
  sending: boolean;
}

export function ReminderPreviewModal({ reminder, onClose, onSend, sending }: ReminderPreviewModalProps) {
  if (!reminder) return null;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'gentle': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'firm': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'formal': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'legal': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Prévisualisation de la relance</h2>
              <p className="text-sm text-gray-600 mt-1">
                {reminder.customerName} • Facture {reminder.invoice}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations sur la relance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${getLevelColor(reminder.level)}`}>
              <div className="text-sm font-medium">Niveau de relance</div>
              <div className="text-lg font-semibold">{getLevelLabel(reminder.level)}</div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-sm font-medium text-gray-600">Retard</div>
              <div className="text-lg font-semibold text-gray-900">{reminder.daysOverdue} jours</div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-sm font-medium text-gray-600">Montant total dû</div>
              <div className="text-lg font-semibold text-gray-900">
                {reminder.totalDue.toLocaleString()} FCFA
              </div>
            </div>
          </div>

          {/* Contact du client */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Coordonnées du client</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {reminder.customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{reminder.customerEmail}</span>
                </div>
              )}
              {reminder.customerPhone && (
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-gray-400" />
                  <span>{reminder.customerPhone}</span>
                </div>
              )}
              {reminder.customerWhatsApp && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span>{reminder.customerWhatsApp}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Email</h3>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Sujet : {reminder.subject}</div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                {reminder.emailMessage}
              </div>
            </div>
          </div>

          {/* SMS */}
          {reminder.smsMessage && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">SMS</h3>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                  {reminder.smsMessage}
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp */}
          {reminder.whatsappMessage && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">WhatsApp</h3>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                  {reminder.whatsappMessage}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {reminder.customerEmail && (
              <button
                onClick={() => onSend('email')}
                disabled={sending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-4 h-4" />
                {sending ? 'Envoi...' : 'Envoyer par Email'}
              </button>
            )}
            {reminder.customerPhone && (
              <button
                onClick={() => onSend('sms')}
                disabled={sending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-4 h-4" />
                {sending ? 'Envoi...' : 'Envoyer par SMS'}
              </button>
            )}
            {reminder.customerWhatsApp && (
              <button
                onClick={() => onSend('whatsapp')}
                disabled={sending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageSquare className="w-4 h-4" />
                {sending ? 'Envoi...' : 'Envoyer par WhatsApp'}
              </button>
            )}
            <button
              onClick={() => onSend('call')}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PhoneCall className="w-4 h-4" />
              {sending ? 'Marquer comme appelé...' : 'Marquer comme appelé'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
