"use client";

import { useState, useEffect } from "react";
import { Mail, X, Paperclip, Save, Eye, Trash2, FileText, Plus } from "lucide-react";

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'invoice' | 'quote' | 'reminder' | 'general';
};

type EmailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { 
    to: string; 
    cc?: string;
    subject: string; 
    message: string;
    attachments?: File[];
  }) => void;
  defaultTo?: string;
  defaultSubject?: string;
  context?: {
    clientName?: string;
    invoiceNumber?: string;
    amount?: number;
    dueDate?: string;
    companyName?: string;
  };
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'invoice-send',
    name: 'Envoi Facture',
    category: 'invoice',
    subject: 'Facture {{invoiceNumber}} - {{companyName}}',
    body: `Bonjour {{clientName}},

Veuillez trouver ci-joint votre facture {{invoiceNumber}} d'un montant de {{amount}} FCFA.

Date d'échéance : {{dueDate}}

Pour tout règlement, merci de mentionner le numéro de facture.

Cordialement,
{{companyName}}`
  },
  {
    id: 'invoice-reminder',
    name: 'Relance Facture',
    category: 'reminder',
    subject: 'Rappel - Facture {{invoiceNumber}} échue',
    body: `Bonjour {{clientName}},

Nous tenons à vous informer que la facture {{invoiceNumber}} d'un montant de {{amount}} FCFA est échue depuis le {{dueDate}}.

Nous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.

Pour toute question, n'hésitez pas à nous contacter.

Cordialement,
{{companyName}}`
  },
  {
    id: 'quote-send',
    name: 'Envoi Devis',
    category: 'quote',
    subject: 'Devis {{invoiceNumber}} - {{companyName}}',
    body: `Bonjour {{clientName}},

Suite à votre demande, veuillez trouver ci-joint notre devis {{invoiceNumber}}.

Montant total : {{amount}} FCFA
Validité : {{dueDate}}

Ce devis est valable pour une durée de 30 jours.

Nous restons à votre disposition pour toute information complémentaire.

Cordialement,
{{companyName}}`
  },
  {
    id: 'thank-you',
    name: 'Remerciement',
    category: 'general',
    subject: 'Merci pour votre confiance',
    body: `Bonjour {{clientName}},

Nous vous remercions pour votre paiement de {{amount}} FCFA concernant la facture {{invoiceNumber}}.

Nous apprécions votre confiance et restons à votre service.

Cordialement,
{{companyName}}`
  }
];

export function ProfessionalEmailDialog({ 
  isOpen, 
  onClose, 
  onSend, 
  defaultTo = "", 
  defaultSubject = "",
  context = {}
}: EmailDialogProps) {
  const [to, setTo] = useState(defaultTo);
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [customTemplates, setCustomTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    // Charger les templates personnalisés depuis localStorage
    const saved = localStorage.getItem('emailTemplates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomTemplates(parsed);
        setTemplates([...DEFAULT_TEMPLATES, ...parsed]);
      } catch (e) {
        console.error('Erreur chargement templates:', e);
      }
    }
  }, []);

  useEffect(() => {
    setTo(defaultTo);
    setSubject(defaultSubject);
  }, [defaultTo, defaultSubject]);

  if (!isOpen) return null;

  const replaceVariables = (text: string): string => {
    return text
      .replace(/{{clientName}}/g, context.clientName || '[Nom Client]')
      .replace(/{{invoiceNumber}}/g, context.invoiceNumber || '[N° Facture]')
      .replace(/{{amount}}/g, context.amount?.toLocaleString('fr-FR') || '[Montant]')
      .replace(/{{dueDate}}/g, context.dueDate ? new Date(context.dueDate).toLocaleDateString('fr-FR') : '[Date]')
      .replace(/{{companyName}}/g, context.companyName || 'BMS');
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(replaceVariables(template.subject));
      setMessage(replaceVariables(template.body));
      setSelectedTemplate(templateId);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Veuillez entrer un nom pour le template');
      return;
    }

    const newTemplate: EmailTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName,
      category: 'general',
      subject: subject,
      body: message
    };

    const updated = [...customTemplates, newTemplate];
    setCustomTemplates(updated);
    setTemplates([...DEFAULT_TEMPLATES, ...updated]);
    
    localStorage.setItem('emailTemplates', JSON.stringify(updated));
    
    alert(`✅ Template "${newTemplateName}" sauvegardé !`);
    setNewTemplateName("");
    setShowTemplateManager(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Supprimer ce template ?')) {
      const updated = customTemplates.filter(t => t.id !== templateId);
      setCustomTemplates(updated);
      setTemplates([...DEFAULT_TEMPLATES, ...updated]);
      localStorage.setItem('emailTemplates', JSON.stringify(updated));
    }
  };

  const handleSend = () => {
    if (!to.trim()) {
      alert('Veuillez entrer une adresse email');
      return;
    }

    onSend({ 
      to, 
      cc: cc.trim() || undefined,
      subject, 
      message,
      attachments: attachments.length > 0 ? attachments : undefined
    });
    
    // Reset
    setTo("");
    setCc("");
    setSubject("");
    setMessage("");
    setAttachments([]);
    setSelectedTemplate("");
    onClose();
  };

  const previewContent = replaceVariables(message);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#0D9488]" />
            <h2 className="text-xl font-bold">Composer un email</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Templates Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-blue-900">📋 Templates disponibles</label>
              <button
                onClick={() => setShowTemplateManager(!showTemplateManager)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Save className="w-3 h-3" />
                Gérer les templates
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-2 text-xs rounded-lg border transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-white hover:bg-blue-100 border-blue-200'
                  }`}
                >
                  <FileText className="w-3 h-3 inline mr-1" />
                  {template.name}
                  {template.id.startsWith('custom-') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 inline" />
                    </button>
                  )}
                </button>
              ))}
            </div>

            {/* Template Manager */}
            {showTemplateManager && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
                <h4 className="font-semibold text-sm mb-2">💾 Sauvegarder comme template</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Nom du template..."
                    className="flex-1 px-3 py-2 text-sm border rounded-lg"
                  />
                  <button
                    onClick={handleSaveAsTemplate}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    Sauvegarder
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Variables disponibles: {'{'}{'{'} clientName{'}'}{'}'}, {'{'}{'{'} invoiceNumber{'}'}{'}'}, {'{'}{'{'} amount{'}'}{'}'}, {'{'}{'{'} dueDate{'}'}{'}'}, {'{'}{'{'} companyName{'}'}{'}'}
                </p>
              </div>
            )}
          </div>

          {/* Email Fields */}
          <div>
            <label className="block text-sm font-medium mb-2">Destinataire *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488]"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Copie (CC)</label>
            <input
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488]"
              placeholder="email2@example.com (optionnel)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Objet *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488]"
              placeholder="Objet du message"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Message *</label>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-[#0D9488] hover:underline flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                {showPreview ? 'Éditer' : 'Prévisualiser'}
              </button>
            </div>
            
            {showPreview ? (
              <div className="w-full px-4 py-3 border rounded-lg bg-gray-50 min-h-[200px] whitespace-pre-wrap">
                {previewContent || <span className="text-gray-400">Aucun message</span>}
              </div>
            ) : (
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg h-48 focus:ring-2 focus:ring-[#0D9488]"
                placeholder="Votre message..."
                required
              />
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium mb-2">Pièces jointes</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Cliquez pour ajouter des fichiers
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, images, documents (max 10MB par fichier)
                </span>
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">{attachments.length} fichier(s) sélectionné(s):</p>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center sticky bottom-0">
          <div className="text-sm text-gray-600">
            {attachments.length > 0 && (
              <span>📎 {attachments.length} fichier(s) joint(s)</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              disabled={!to.trim() || !subject.trim() || !message.trim()}
              className="px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Envoyer l'email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
