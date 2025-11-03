'use client';

import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageCircle, FileText, TrendingUp, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  {
    icon: FileText,
    title: "Analyse comptable",
    prompt: "Analyse mes écritures comptables du mois dernier et identifie les anomalies"
  },
  {
    icon: TrendingUp,
    title: "Prévisions",
    prompt: "Quelles sont les prévisions de trésorerie pour les 3 prochains mois ?"
  },
  {
    icon: HelpCircle,
    title: "Conseil fiscal",
    prompt: "Quelles optimisations fiscales puis-je appliquer pour mon entreprise ?"
  }
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "🚀 **Nouveau : Assistant IA Intelligent BMS**\n\nNotre système a été mis à jour avec **GPT-4 connecté à vos données réelles** !\n\n✨ **Nouvelles fonctionnalités :**\n• 📊 Analyse basée sur vos données comptables réelles\n• 💰 Recommandations fiscales personnalisées (OHADA/Bénin)\n• 📈 Prévisions financières intelligentes\n• ⚠️ Détection automatique des risques\n• 🎯 Conseils business adaptés à votre secteur\n\n👉 [Essayez le nouveau chat intelligent](/ai/intelligent-chat)\n\nOu continuez avec cette version de démonstration ci-dessous.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // Simuler une réponse (ancienne version)
      setTimeout(() => {
        const responses = [
          "Pour une analyse complète basée sur vos données réelles, essayez notre nouveau chat intelligent : /ai/intelligent-chat",
          "Je vous recommande d'utiliser le nouvel assistant IA avec GPT-4 connecté à vos comptes.",
          "Cette version est une démonstration. Accédez au vrai système IA pour des analyses personnalisées."
        ];
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Alert for new intelligent version */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Assistant IA Intelligent BMS
              </h2>
              <p className="text-blue-100 mb-4">
                Accédez maintenant à notre nouveau système basé sur GPT-4 avec analyse de vos données réelles
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">📊 Données réelles</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">🧠 GPT-4</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">💰 Fiscalité OHADA</span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">⚡ Temps réel</span>
              </div>
            </div>
            <a 
              href="/ai/intelligent-chat"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Essayer maintenant →
            </a>
          </div>
        </div>
      </div>

      {/* Old Chat Interface */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Chat IA (Version démo)
              </h1>
              <p className="text-gray-300 mt-1">
                Version de démonstration - Essayez le nouveau système intelligent ci-dessus
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-500 text-white rounded-full text-sm">
              Démo
            </div>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-2xl ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                  : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
              } px-4 py-3`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('fr-FR')}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>En cours de réflexion...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Suggestions rapides :</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.prompt)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <suggestion.icon className="w-4 h-4 text-gray-600" />
                  {suggestion.title}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}
