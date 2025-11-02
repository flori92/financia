"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: " Bonjour ! Je suis votre assistant BMS. Je peux vous aider avec la comptabilité, la facturation, la trésorerie et bien plus encore. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userMessage: string): Promise<string> => {
    // Simulation de réponses intelligentes basées sur les mots-clés
    const lowerMessage = userMessage.toLowerCase();
    
    // Comptabilité et finance
    if (lowerMessage.includes("compt") || lowerMessage.includes("écriture") || lowerMessage.includes("journal")) {
      return "Pour la comptabilité, vous pouvez utiliser le **Journal des Écritures** dans la section Comptabilité. Vous y trouverez toutes vos écritures comptables avec la possibilité d'en ajouter de nouvelles. Le **Plan Comptable SYSCOHADA** est également disponible pour la gestion des comptes.";
    }
    
    if (lowerMessage.includes("facture") || lowerMessage.includes("facturation")) {
      return "La gestion des factures se trouve dans la section **Factures** du menu. Vous pouvez y créer, consulter et envoyer des factures par email, WhatsApp ou SMS. Les relances automatiques sont aussi disponibles dans **Relances Clients**.";
    }
    
    if (lowerMessage.includes("trésor") || lowerMessage.includes("banque") || lowerMessage.includes("paiement")) {
      return "La trésorerie est gérée dans la section **Trésorerie & Banque**. Vous y trouverez le rapprochement bancaire, les prévisionnels et les opérations. Le **Multi-banques** et **Mobile Money** sont aussi intégrés.";
    }
    
    if (lowerMessage.includes("bilan") || lowerMessage.includes("résultat") || lowerMessage.includes("balance")) {
      return "Les états financiers sont disponibles dans la section Comptabilité : **Bilan**, **Compte de Résultat**, **Balance de Vérification** et **Balance Âgée**. Ces documents sont générés automatiquement depuis vos écritures.";
    }
    
    // RH
    if (lowerMessage.includes("rh") || lowerMessage.includes("employé") || lowerMessage.includes("paie")) {
      return "Le module RH se trouve dans **Ressources Humaines**. Vous y trouverez la gestion des employés, la paie, les congés et absences, les CRA (feuilles de temps) et les notes de frais.";
    }
    
    if (lowerMessage.includes("congé") || lowerMessage.includes("absence") || lowerMessage.includes("cra")) {
      return "Les congés et CRA sont gérés dans les sous-sections RH : **Congés & Absences** pour les demandes de congés et **CRA & Temps** pour les feuilles de temps et comptes rendus d'activité.";
    }
    
    // CRM
    if (lowerMessage.includes("crm") || lowerMessage.includes("client") || lowerMessage.includes("contact")) {
      return "Le CRM est accessible via la section **CRM** du menu. Vous pouvez y gérer vos contacts, suivre les opportunités commerciales et consulter le dashboard CRM pour une vue d'ensemble.";
    }
    
    // TVA et fiscalité
    if (lowerMessage.includes("tva") || lowerMessage.includes("taxe") || lowerMessage.includes("déclaration")) {
      return "La **Déclaration TVA** se trouve dans la section Comptabilité. Elle génère automatiquement votre déclaration depuis les écritures comptables, avec calcul de la TVA collectée et déductible.";
    }
    
    // Aide générale
    if (lowerMessage.includes("aide") || lowerMessage.includes("help") || lowerMessage.includes("comment")) {
      return "Je suis là pour vous aider !  Vous pouvez me poser des questions sur :\n• Comptabilité et écritures\n• Facturation et relances\n• Trésorerie et banques\n• RH et paie\n• CRM et clients\n• TVA et déclarations\n\nDites-moi simplement ce dont vous avez besoin !";
    }
    
    // Dashboard
    if (lowerMessage.includes("dashboard") || lowerMessage.includes("tableau") || lowerMessage.includes("accueil")) {
      return "Le **Dashboard Comptable** vous donne une vue d'ensemble en temps réel avec les KPI financiers, graphiques d'évolution, top clients/fournisseurs et alertes. Il est synchronisé avec toutes vos données comptables.";
    }
    
    // Réponse par défaut
    return "Je comprends votre question. Pour une aide précise, essayez de me parler de : comptabilité, factures, trésorerie, RH, CRM, TVA ou dashboard. Vous pouvez aussi naviguer dans le menu latéral pour accéder à toutes les fonctionnalités. Pour une assistance technique, n'hésitez pas à consulter la documentation ou contacter le support.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simuler un délai de réponse
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const botResponse = await generateBotResponse(inputValue);
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
          title="Discuter avec l'assistant BMS"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Assistant BMS</h3>
            <p className="text-xs text-blue-100">Toujours là pour vous aider</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isMinimized ? "Agrandir" : "Réduire"}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-gray-500" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isTyping}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors disabled:cursor-not-allowed"
                title="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
               Essayez : "comment faire une facture ?", "aide comptabilité", "où trouver le bilan ?"
            </p>
          </div>
        </>
      )}
    </div>
  );
}
