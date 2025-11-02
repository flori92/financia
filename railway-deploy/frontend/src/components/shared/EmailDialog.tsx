"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";

type EmailDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: { to: string; subject: string; message: string }) => void;
  defaultTo?: string;
  defaultSubject?: string;
};

export function EmailDialog({ isOpen, onClose, onSend, defaultTo = "", defaultSubject = "" }: EmailDialogProps) {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    onSend({ to, subject, message });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <h2 className="text-xl font-bold">Envoyer un email</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Destinataire</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Objet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Objet du message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-32"
              placeholder="Votre message..."
            />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
