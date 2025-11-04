'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, Mail, Send, Inbox, Archive, Trash2, Star, Paperclip, Search, Filter, 
  MoreVertical, Eye, EyeOff, Reply, Forward, Clock, Users, FileText, Calendar,
  Download, Upload, Edit, Copy, Save, Zap, CheckCircle, AlertCircle, BarChart3,
  MailOpen, MailPlus, Sparkles, Target, TrendingUp, Activity
} from 'lucide-react';
import { apiGet, apiPost, apiPut, getCompanyId } from '@/lib/api';

interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  preview: string;
  content: string;
  date: string;
  read: boolean;
  starred: boolean;
  folder: string;
  hasAttachment: boolean;
  attachments?: Attachment[];
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  campaignId?: string;
  templateId?: string;
  scheduledAt?: string;
  openedAt?: string;
  clickedAt?: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed';
  sentCount: number;
  totalRecipients: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  scheduledAt?: string;
}

interface ComposeData {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  content: string;
  templateId?: string;
  attachments: File[];
  scheduledAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  campaignId?: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [composeData, setComposeData] = useState<ComposeData>({
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    attachments: [],
    priority: 'normal'
  });

  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    pending: 0
  });

  const companyId = getCompanyId();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [emailsRes, templatesRes, campaignsRes, statsRes] = await Promise.all([
        apiGet(`/api/v1/communications/emails?companyId=${companyId}`).then(r => r.json()),
        apiGet(`/api/v1/communications/templates?companyId=${companyId}`).then(r => r.json()),
        apiGet(`/api/v1/communications/campaigns?companyId=${companyId}`).then(r => r.json()),
        apiGet(`/api/v1/communications/emails/stats?companyId=${companyId}`).then(r => r.json())
      ]);

      setEmails(emailsRes || []);
      setTemplates(templatesRes || []);
      setCampaigns(campaignsRes || []);
      setStats(statsRes || {
        total: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        pending: 0
      });
    } catch (error) {
      console.error('Error loading data:', error);
      // Données mockées en cas d'erreur
      setEmails([
        {
          id: '1',
          from: 'contact@client-entreprise.com',
          to: ['contact@bms.com'],
          subject: 'Demande de proposition ERP',
          preview: 'Bonjour, nous souhaiterions recevoir une proposition...',
          content: 'Contenu complet de l\'email...',
          date: new Date().toISOString(),
          read: false,
          starred: true,
          folder: 'inbox',
          hasAttachment: true,
          status: 'delivered',
          priority: 'high'
        }
      ]);
      setTemplates([
        {
          id: '1',
          name: 'Proposition Commerciale',
          subject: 'Proposition ERP - {{companyName}}',
          content: 'Bonjour {{clientName}},\n\nNous vous proposons...',
          variables: ['companyName', 'clientName'],
          category: 'Commercial',
          usageCount: 15,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const folders = [
    { id: 'inbox', name: 'Boîte de réception', icon: Inbox, count: emails.filter(e => e.folder === 'inbox').length },
    { id: 'sent', name: 'Envoyés', icon: Send, count: emails.filter(e => e.folder === 'sent').length },
    { id: 'starred', name: 'Favoris', icon: Star, count: emails.filter(e => e.starred).length },
    { id: 'archive', name: 'Archives', icon: Archive, count: emails.filter(e => e.folder === 'archive').length },
    { id: 'trash', name: 'Corbeille', icon: Trash2, count: emails.filter(e => e.folder === 'trash').length },
    { id: 'draft', name: 'Brouillons', icon: Edit, count: emails.filter(e => e.status === 'draft').length },
  ];

  // Actions sur les emails
  const toggleReadStatus = async (emailId: string) => {
    try {
      const email = emails.find(e => e.id === emailId);
      if (email) {
        await apiPut(`/api/v1/communications/emails/${emailId}/read`, { read: !email.read });
        setEmails(emails.map(e => 
          e.id === emailId ? { ...e, read: !e.read } : e
        ));
      }
    } catch (error) {
      console.error('Error toggling read status:', error);
    }
    setShowActionMenu(null);
  };

  const toggleStarred = async (emailId: string) => {
    try {
      const email = emails.find(e => e.id === emailId);
      if (email) {
        await apiPut(`/api/v1/communications/emails/${emailId}/star`, { starred: !email.starred });
        setEmails(emails.map(e => 
          e.id === emailId ? { ...e, starred: !e.starred } : e
        ));
      }
    } catch (error) {
      console.error('Error toggling starred:', error);
    }
    setShowActionMenu(null);
  };

  const archiveEmail = async (emailId: string) => {
    try {
      await apiPut(`/api/v1/communications/emails/${emailId}/archive`, {});
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, folder: 'archive' } : e
      ));
    } catch (error) {
      console.error('Error archiving email:', error);
    }
    setShowActionMenu(null);
  };

  const deleteEmail = async (emailId: string) => {
    try {
      await apiPut(`/api/v1/communications/emails/${emailId}/delete`, {});
      setEmails(emails.map(e => 
        e.id === emailId ? { ...e, folder: 'trash' } : e
      ));
    } catch (error) {
      console.error('Error deleting email:', error);
    }
    setShowActionMenu(null);
  };

  const sendEmail = async () => {
    try {
      const formData = new FormData();
      formData.append('to', JSON.stringify(composeData.to));
      formData.append('cc', JSON.stringify(composeData.cc));
      formData.append('bcc', JSON.stringify(composeData.bcc));
      formData.append('subject', composeData.subject);
      formData.append('content', composeData.content);
      formData.append('priority', composeData.priority);
      formData.append('companyId', companyId);
      
      if (composeData.scheduledAt) {
        formData.append('scheduledAt', composeData.scheduledAt);
      }
      
      if (composeData.templateId) {
        formData.append('templateId', composeData.templateId);
      }
      
      // Ajouter les pièces jointes
      composeData.attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      await apiPost('/api/v1/communications/emails/send', formData);
      
      // Réinitialiser le formulaire
      setComposeData({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        content: '',
        attachments: [],
        priority: 'normal'
      });
      setShowCompose(false);
      
      // Recharger les données
      loadData();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const useTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setComposeData({
      ...composeData,
      subject: template.subject,
      content: template.content,
      templateId: template.id
    });
    setShowCompose(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setComposeData({
      ...composeData,
      attachments: [...composeData.attachments, ...files]
    });
  };

  const removeAttachment = (index: number) => {
    setComposeData({
      ...composeData,
      attachments: composeData.attachments.filter((_, i) => i !== index)
    });
  };

  const addRecipient = (field: 'to' | 'cc' | 'bcc', email: string) => {
    if (email && !composeData[field].includes(email)) {
      setComposeData({
        ...composeData,
        [field]: [...composeData[field], email]
      });
    }
  };

  const removeRecipient = (field: 'to' | 'cc' | 'bcc', email: string) => {
    setComposeData({
      ...composeData,
      [field]: composeData[field].filter(e => e !== email)
    });
  };

  const filteredEmails = emails.filter(e => {
    const matchesFolder = selectedFolder === 'starred' ? e.starred : e.folder === selectedFolder;
    const matchesSearch = e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    
    return matchesFolder && matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header avec statistiques */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="w-8 h-8 text-teal-600" />
            Communications Emails
          </h1>
          <p className="text-gray-600 mt-1">Gestion professionnelle des emails et campagnes</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCampaigns(true)}
          >
            <Target className="w-4 h-4 mr-2" />
            Campagnes
          </Button>
          <Button 
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => setShowCompose(true)}
          >
            <MailPlus className="w-4 h-4 mr-2" />
            Nouveau Message
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Emails</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Envoyés</p>
                <p className="text-2xl font-bold text-green-900">{stats.sent}</p>
              </div>
              <Send className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Lus</p>
                <p className="text-2xl font-bold text-emerald-900">{stats.opened}</p>
              </div>
              <MailOpen className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Cliqués</p>
                <p className="text-2xl font-bold text-purple-900">{stats.clicked}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">En attente</p>
                <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-600 font-medium">Taux d'ouverture</p>
                <p className="text-2xl font-bold text-teal-900">
                  {stats.sent > 0 ? Math.round((stats.opened / stats.sent) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-teal-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardContent className="p-4 space-y-2">
              {folders.map((folder) => {
                const Icon = folder.icon;
                return (
                  <motion.button
                    key={folder.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${
                      selectedFolder === folder.id ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    {folder.count > 0 && (
                      <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {folder.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </CardContent>
          </Card>

          {/* Templates récents */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Templates Récents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.slice(0, 5).map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => useTemplate(template)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg text-sm border border-gray-100"
                >
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {template.category} • {template.usageCount} utilisations
                  </div>
                </motion.button>
              ))}
              {templates.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Aucun template
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{folders.find(f => f.id === selectedFolder)?.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="sent">Envoyés</option>
                    <option value="delivered">Livré</option>
                    <option value="opened">Lus</option>
                    <option value="clicked">Cliqués</option>
                    <option value="draft">Brouillons</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredEmails.map((email) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 border rounded-lg hover:shadow-md relative transition-all ${
                      !email.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => toggleReadStatus(email.id)}>
                        <div className="flex items-center gap-2 mb-2">
                          {email.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          <span className={`font-medium ${!email.read ? 'font-bold text-blue-900' : 'text-gray-900'}`}>
                            {email.from}
                          </span>
                          {email.hasAttachment && <Paperclip className="w-4 h-4 text-gray-400" />}
                          
                          {/* Badge de statut */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            email.status === 'sent' ? 'bg-green-100 text-green-700' :
                            email.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                            email.status === 'opened' ? 'bg-emerald-100 text-emerald-700' :
                            email.status === 'clicked' ? 'bg-purple-100 text-purple-700' :
                            email.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {email.status === 'sent' ? 'Envoyé' :
                             email.status === 'delivered' ? 'Livré' :
                             email.status === 'opened' ? 'Lu' :
                             email.status === 'clicked' ? 'Cliqué' :
                             email.status === 'draft' ? 'Brouillon' : 'Échec'}
                          </span>
                          
                          {/* Badge de priorité */}
                          {email.priority === 'urgent' && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        
                        <div className={`text-sm mb-1 ${!email.read ? 'font-semibold text-blue-800' : 'text-gray-700'}`}>
                          {email.subject}
                        </div>
                        
                        <div className="text-sm text-gray-500 line-clamp-2">{email.preview}</div>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>{new Date(email.date).toLocaleDateString('fr-FR')}</span>
                          <span>{new Date(email.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                          {email.to.length > 0 && (
                            <span>À: {email.to.join(', ')}</span>
                          )}
                          {email.scheduledAt && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <Clock className="w-3 h-3" />
                              Programmé
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === email.id ? null : email.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Menu d'actions */}
                    <AnimatePresence>
                      {showActionMenu === email.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 w-56"
                        >
                          <button
                            onClick={() => toggleReadStatus(email.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            {email.read ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            {email.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                          </button>
                          <button
                            onClick={() => toggleStarred(email.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            {email.starred ? 'Enlever des favoris' : 'Mettre en favori'}
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Reply className="w-4 h-4" />
                            Répondre
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Forward className="w-4 h-4" />
                            Transférer
                          </button>
                          <button
                            onClick={() => archiveEmail(email.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" />
                            Archiver
                          </button>
                          <button
                            onClick={() => deleteEmail(email.id)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                
                {filteredEmails.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun email trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal composition email */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <MailPlus className="w-5 h-5 text-teal-600" />
                  Nouveau Message
                  {selectedTemplate && (
                    <span className="text-sm text-teal-600 font-normal">
                      (Template: {selectedTemplate.name})
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowCompose(false);
                    setSelectedTemplate(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Destinataires */}
                    <div>
                      <label className="block text-sm font-medium mb-2">À</label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="ajouter@destinataire.com"
                            className="flex-1 border rounded-lg px-3 py-2"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addRecipient('to', e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="ajouter@destinataire.com"]') as HTMLInputElement;
                              if (input.value) {
                                addRecipient('to', input.value);
                                input.value = '';
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {composeData.to.map((email) => (
                            <span key={email} className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                              {email}
                              <button
                                onClick={() => removeRecipient('to', email)}
                                className="hover:text-teal-900"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sujet */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Sujet</label>
                      <input
                        type="text"
                        value={composeData.subject}
                        onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Objet du message"
                      />
                    </div>

                    {/* Priorité */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Priorité</label>
                      <select
                        value={composeData.priority}
                        onChange={(e) => setComposeData({ ...composeData, priority: e.target.value as any })}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="low">Basse</option>
                        <option value="normal">Normale</option>
                        <option value="high">Haute</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Templates */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Utiliser un template</label>
                      <select
                        value={composeData.templateId || ''}
                        onChange={(e) => {
                          const template = templates.find(t => t.id === e.target.value);
                          if (template) {
                            useTemplate(template);
                          }
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="">Sélectionner un template...</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Programmation */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Programmer l'envoi</label>
                      <input
                        type="datetime-local"
                        value={composeData.scheduledAt || ''}
                        onChange={(e) => setComposeData({ ...composeData, scheduledAt: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>

                    {/* Pièces jointes */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Pièces jointes</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Paperclip className="w-4 h-4 mr-2" />
                        Ajouter des pièces jointes
                      </Button>
                      <div className="mt-2 space-y-2">
                        {composeData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={composeData.content}
                    onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                    className="w-full border rounded-lg px-3 py-3 h-64"
                    placeholder="Votre message..."
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-6 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  {composeData.to.length} destinataire(s) • {composeData.attachments.length} pièce(s) jointe(s)
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCompose(false);
                      setSelectedTemplate(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Sauvegarder comme brouillon
                      alert('Brouillon sauvegardé');
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Brouillon
                  </Button>
                  <Button
                    type="button"
                    className="bg-teal-600 hover:bg-teal-700"
                    onClick={sendEmail}
                    disabled={composeData.to.length === 0 || !composeData.subject || !composeData.content}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {composeData.scheduledAt ? 'Programmer' : 'Envoyer maintenant'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Templates d'Emails
                </h3>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{template.name}</h4>
                            <p className="text-sm text-gray-500">{template.category}</p>
                          </div>
                          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs">
                            {template.usageCount} utilisations
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Sujet:</p>
                          <p className="text-sm text-gray-600">{template.subject}</p>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Variables:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <span key={variable} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {variable}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Créé le {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(`${template.subject}\n\n${template.content}`);
                                alert('Template copié dans le presse-papiers');
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                useTemplate(template);
                                setShowTemplates(false);
                              }}
                            >
                              <MailPlus className="w-3 h-3 mr-1" />
                              Utiliser
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {templates.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun template disponible</p>
                    <Button className="mt-4" onClick={() => alert('Fonctionnalité de création de template bientôt disponible')}>
                      Créer un template
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Campagnes */}
      <AnimatePresence>
        {showCampaigns && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-600" />
                  Campagnes d'Emailing
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => alert('Fonctionnalité de création de campagne bientôt disponible')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle campagne
                  </Button>
                  <button
                    onClick={() => setShowCampaigns(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-3 gap-4">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                            <p className="text-sm text-gray-500">
                              Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            campaign.status === 'completed' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            campaign.status === 'sending' ? 'bg-orange-100 text-orange-700' :
                            campaign.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {campaign.status === 'completed' ? 'Terminée' :
                             campaign.status === 'sent' ? 'Envoyée' :
                             campaign.status === 'sending' ? 'En cours' :
                             campaign.status === 'scheduled' ? 'Programmée' : 'Brouillon'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progression:</span>
                            <span className="font-medium">
                              {campaign.sentCount} / {campaign.totalRecipients}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min((campaign.sentCount / campaign.totalRecipients) * 100, 100)}%`
                              }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taux ouvert:</span>
                              <span className="font-medium text-emerald-600">{campaign.openRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taux clic:</span>
                              <span className="font-medium text-purple-600">{campaign.clickRate}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Stats
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Modifier
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {campaigns.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune campagne disponible</p>
                    <Button className="mt-4" onClick={() => alert('Fonctionnalité de création de campagne bientôt disponible')}>
                      Créer votre première campagne
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
