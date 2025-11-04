'use client';

import { useState, useRef, useEffect } from 'react';
import { getBaseUrl, apiPost, apiGet } from '@/lib/api';
import { formatCurrency } from '@/lib/format-utils';
import { useCompanyId } from '@/hooks/useCompanyId';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  MessageCircle, 
  FileText, 
  TrendingUp, 
  HelpCircle,
  BarChart3,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Star,
  RefreshCw,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    hasData: boolean;
    dataDate?: string;
    entryCount?: number;
    kpiAvailable?: boolean;
    isFallback?: boolean;
    model?: string;
    provider?: string;
  };
  metadata?: {
    model: string;
    tokensUsed: number;
    cost: number;
    provider: string;
  };
}

interface Suggestion {
  icon: any;
  title: string;
  question: string;
}

interface AIStats {
  total_interactions: number;
  active_days: number;
  avg_response_length: number;
  last_interaction: string;
  totalCost: number;
  avgCostPerInteraction: number;
  model: string;
  provider: string;
  advantage: string;
}

const FREE_SUGGESTIONS: Suggestion[] = [
  {
    icon: FileText,
    title: 'Analyse financière',
    question: 'Analyse la santé financière de mon entreprise ce mois-ci et identifie les points d\'attention.'
  },
  {
    icon: TrendingUp,
    title: 'Prévisions',
    question: 'Quelles sont les prévisions de trésorerie pour les 3 prochains mois basées sur mes données récentes ?'
  },
  {
    icon: HelpCircle,
    title: 'Conseil fiscal',
    question: 'Quelles optimisations fiscales puis-je appliquer pour mon entreprise au Bénin ?'
  },
  {
    icon: AlertTriangle,
    title: 'Risques et alertes',
    question: 'Identifie les risques financiers ou opérationnels dans mon entreprise et propose des solutions concrètes.'
  },
  {
    icon: BarChart3,
    title: 'Performance',
    question: 'Évalue la performance globale de mon entreprise ce mois-ci avec des indicateurs clés.'
  },
  {
    icon: DollarSign,
    title: 'Optimisation coûts',
    question: 'Comment puis-je optimiser mes coûts opérationnels sans sacrifier la qualité ?'
  }
];

const REPORT_TYPES = [
  { id: 'financial_summary', label: 'Résumé financier', icon: FileText },
  { id: 'tax_optimization', label: 'Optimisation fiscale', icon: TrendingUp },
  { id: 'cash_flow', label: 'Analyse trésorerie', icon: DollarSign },
  { id: 'performance', label: 'Performance globale', icon: BarChart3 }
];

export default function FreeAIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "🦙 **Bienvenue sur BMS IA GRATUITE !**\n\nJ'utilise **Llama 3.2**, un modèle d'intelligence artificielle open-source **100% GRATUIT** et performant !\n\n✨ **Fonctionnalités disponibles :**\n• 📊 Analyse financière basée sur vos données réelles\n• 💰 Optimisation fiscale (OHADA/Bénin)\n• 📈 Prévisions et tendances\n• ⚠️ Détection de risques\n• 🎯 Recommandations business personnalisées\n\n**🎉 AVANTAGE : 0 FCFA - Totalement gratuit !**\n\nComment puis-je vous aider aujourd'hui ?",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(FREE_SUGGESTIONS);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [stats, setStats] = useState<AIStats | null>(null);
  const [showReports, setShowReports] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [availableModels, setAvailableModels] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const companyId = useCompanyId();
  const userId = 'demo-user-1'; // TODO: Get from auth context

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadPersonalizedSuggestions();
    loadStats();
    loadModels();
  }, []);

  const loadPersonalizedSuggestions = async () => {
    try {
      const response = await apiGet(`/api/v1/ai/free/suggestions?companyId=${companyId}&userId=${userId}`);
      if (response.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('❌ Erreur chargement suggestions:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiGet(`/api/v1/ai/free/stats?companyId=${companyId}&userId=${userId}`);
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await apiGet('/api/v1/ai/free/models');
      if (response.success) {
        setAvailableModels(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur chargement modèles:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await apiGet(`/api/v1/ai/free/history?companyId=${companyId}&userId=${userId}&limit=20`);
      if (response.success) {
        setHistory(response.data.history.map((item: any) => ({
          id: item.id,
          role: 'user' as const,
          content: item.question,
          timestamp: new Date(item.created_at),
          assistantResponse: item.response
        })));
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiPost('/api/v1/ai/free/chat', {
        question: input,
        companyId,
        userId
      });

      if (response.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          context: response.data.context,
          metadata: response.data.metadata
        };

        setMessages(prev => [...prev, assistantMessage]);
        loadStats(); // Refresh stats
      }
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Désolé, une erreur est survenue. Veuillez réessayer dans quelques instants.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.question);
  };

  const handleGenerateReport = async (reportType: string) => {
    setIsGeneratingReport(true);
    try {
      const response = await apiPost('/api/v1/ai/free/reports', {
        type: reportType,
        companyId,
        userId
      });

      if (response.success) {
        const reportMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📊 **Rapport: ${REPORT_TYPES.find(r => r.id === reportType)?.label}**\n\n${response.data.report}`,
          timestamp: new Date(),
          context: response.data.context,
          metadata: response.data.metadata
        };

        setMessages(prev => [...prev, reportMessage]);
        setShowReports(false);
        loadStats();
      }
    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatCost = (cost: number) => {
    return cost === 0 ? 'GRATUIT' : `$${cost.toFixed(4)}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">BMS IA GRATUITE</h2>
              <p className="text-sm text-green-600 font-medium">Llama 3.2 • 0 FCFA</p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total interactions</span>
                <span className="font-medium">{stats.total_interactions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Coût total</span>
                <span className="font-medium text-green-600">{formatCost(stats.totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Modèle</span>
                <span className="font-medium text-green-600">{stats.model}</span>
              </div>
              <div className="bg-green-50 p-2 rounded text-xs text-green-700 font-medium">
                {stats.advantage}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowReports(!showReports)}
            className="w-full flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Générer un rapport
          </button>
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadHistory();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mt-2"
          >
            <Clock className="w-4 h-4" />
            Historique
          </button>
        </div>

        {/* Available Models */}
        {availableModels && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Modèles disponibles</h3>
            <div className="text-xs text-gray-600 space-y-1">
              {availableModels.available.slice(0, 2).map((model: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span>{model.name}</span>
                  <span className="text-green-600 font-medium">{model.cost}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-medium text-gray-900 mb-3">Suggestions rapides</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <suggestion.icon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm text-gray-900 group-hover:text-green-700">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.question.substring(0, 60)}...
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Chat IA GRATUITE
              </h1>
              <p className="text-sm text-gray-500">Llama 3.2 • 100% Gratuit • Vos données BMS</p>
            </div>
            <button
              onClick={() => setMessages([messages[0]])}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Nouvelle conversation
            </button>
          </div>
        </div>

        {/* Reports Modal */}
        {showReports && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-4">
            <h3 className="font-medium text-green-900 mb-3">Générer un rapport automatisé (GRATUIT)</h3>
            <div className="grid grid-cols-2 gap-3">
              {REPORT_TYPES.map((report) => (
                <button
                  key={report.id}
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isGeneratingReport}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <report.icon className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">{report.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-3xl ${
                  message.role === 'user' 
                    ? 'bg-green-600 text-white rounded-2xl rounded-br-sm' 
                    : 'bg-white border border-gray-200 rounded-2xl rounded-bl-sm'
                } px-4 py-3 shadow-sm`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {/* Context info */}
                  {message.context && (
                    <div className={`mt-3 pt-3 border-t ${
                      message.role === 'user' ? 'border-green-500' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center gap-4 text-xs">
                        {message.context.hasData && (
                          <span className={message.role === 'user' ? 'text-green-100' : 'text-gray-500'}>
                            📊 Basé sur vos données réelles
                          </span>
                        )}
                        {message.context.model && (
                          <span className={message.role === 'user' ? 'text-green-100' : 'text-green-600 font-medium'}>
                            🦙 {message.context.model}
                          </span>
                        )}
                        {message.metadata && (
                          <span className={message.role === 'user' ? 'text-green-100' : 'text-gray-500'}>
                            {message.metadata.tokensUsed} tokens • {formatCost(message.metadata.cost)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className={`mt-2 text-xs ${
                    message.role === 'user' ? 'text-green-100' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString('fr-FR')}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                    <span className="text-sm text-gray-600">Llama analyse vos données...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question sur vos finances, comptabilité, ou gestion d'entreprise..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      {showHistory && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Historique des conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {item.content.substring(0, 50)}...
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.timestamp.toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
