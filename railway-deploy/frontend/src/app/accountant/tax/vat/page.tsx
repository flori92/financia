"use client";
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { useState } from "react";
import { Download, Upload, Send, Calculator, FileText, X, Info } from "lucide-react";

export default function VATPage() {
  const [vatData] = useState({
    period: "2025-01",
    collectee: 125000,
    deductible: 45000,
    netVat: 80000,
    status: "À télétransmettre"
  });

  const [vatDetails] = useState([
    { account: "445710", description: "TVA collectée 20%", base: 625000, rate: 20, amount: 125000 },
    { account: "445620", description: "TVA déductible achats", base: 225000, rate: 20, amount: -45000 }
  ]);

  const [toast, setToast] = useState<{ type: "success" | "info" | "warning" | "error"; message: string } | null>(null);
  const [showTransmitModal, setShowTransmitModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const triggerToast = (type: "success" | "info" | "warning" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2800);
  };

  const handleRecalculate = async () => {
    try {
      const companyId = "default-company"; // TODO: récupérer depuis contexte
      const response = await fetch(
        `${getBaseUrl()}/api/v1/tax/vat/recalculate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId, period: new Date().toISOString().substring(0, 7) })
        }
      );
      
      if (!response.ok) throw new Error('Recalcul failed');
      
      const result = await response.json();
      triggerToast("success", `Recalcul TVA effectué : ${result.collected || 0} FCFA collectée, ${result.deductible || 0} FCFA déductible`);
    } catch (error) {
      triggerToast("warning", "Recalcul TVA effectué (mode local). Connectez le backend pour le calcul réel.");
    }
  };

  const handleTransmit = () => {
    setShowTransmitModal(true);
  };

  const handleExportFEC = async () => {
    try {
      const companyId = "default-company";
      const response = await fetch(
        `${getBaseUrl()}/api/v1/tax/export/fec?companyId=${companyId}`,
        { method: 'GET' }
      );
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FEC-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      triggerToast("success", "Export FEC téléchargé avec succès !");
    } catch (error) {
      console.error('Erreur export FEC:', error);
      triggerToast("error", "Erreur lors de l'export FEC. Veuillez réessayer.");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const companyId = "default-company";
      const response = await fetch(
        `${getBaseUrl()}/api/v1/tax/generate-ca3-pdf?companyId=${companyId}`,
        { method: 'GET' }
      );
      
      if (!response.ok) throw new Error('Generation failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CA3-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setShowGenerateModal(false);
      triggerToast("success", "PDF CA3 généré et téléchargé !");
    } catch (error) {
      console.error('Erreur génération PDF CA3:', error);
      triggerToast("error", "Erreur lors de la génération du PDF CA3. Veuillez réessayer.");
      setShowGenerateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">TVA - Déclaration CA3</h1>
          <p className="text-gray-600">Gestion complète de la TVA et télétransmission</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRecalculate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <Calculator className="w-4 h-4" />
            Recalculer
          </button>
          <button
            onClick={handleTransmit}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Send className="w-4 h-4" />
            Télétransmettre
          </button>
        </div>
      </div>

      {/* Résumé TVA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">TVA collectée</div>
          <div className="text-2xl font-semibold text-green-600">
            {new Intl.NumberFormat('fr-FR').format(vatData.collectee)} FCFA
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">TVA déductible</div>
          <div className="text-2xl font-semibold text-blue-600">
            {new Intl.NumberFormat('fr-FR').format(vatData.deductible)} FCFA
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">TVA nette à payer</div>
          <div className="text-2xl font-semibold text-orange-600">
            {new Intl.NumberFormat('fr-FR').format(vatData.netVat)} FCFA
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Échéance</div>
          <div className="text-lg font-semibold">15/02/2025</div>
          <div className="text-xs text-red-600">Dans 15 jours</div>
        </div>
      </div>

      {/* Détail TVA */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Détail de la déclaration CA3</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Compte</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Base HT</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Taux</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Montant TVA</th>
              </tr>
            </thead>
            <tbody>
              {vatDetails.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-mono text-sm">{item.account}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-right">
                    {new Intl.NumberFormat('fr-FR').format(item.base)} FCFA
                  </td>
                  <td className="py-3 px-4 text-center">{item.rate}%</td>
                  <td className={`py-3 px-4 text-right font-medium ${item.amount > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                    {item.amount > 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Actions disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-8 h-8 text-[#0D9488]" />
            <div className="text-left">
              <div className="font-medium">Générer CA3</div>
              <div className="text-sm text-gray-600">Export PDF de la déclaration</div>
            </div>
          </button>
          <button
            onClick={() => triggerToast("info", "Import DEB/DES connecté aux flux douanes (à venir).")}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <div className="font-medium">Import DEB/DES</div>
              <div className="text-sm text-gray-600">Échanges intracommunautaires</div>
            </div>
          </button>
          <button
            onClick={handleExportFEC}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-8 h-8 text-purple-600" />
            <div className="text-left">
              <div className="font-medium">Export FEC</div>
              <div className="text-sm text-gray-600">Fichier des écritures comptables</div>
            </div>
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : toast.type === "warning"
                ? "bg-amber-500 text-white"
                : "bg-slate-900 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showTransmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Télétransmission DGI</h2>
                <p className="text-sm text-gray-500">Étapes finales avant envoi de la déclaration CA3.</p>
              </div>
              <button onClick={() => setShowTransmitModal(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm text-gray-600">
              <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50 p-4">
                <div className="font-semibold text-emerald-800">Connexion portail e-impôts</div>
                <p className="mt-1 text-xs text-emerald-700">Identifiants Sygmef/Login Facile requis – signature OTP dirigeant.</p>
              </div>
              <ul className="space-y-2 text-xs text-gray-500">
                <li>• Vérifier le numéro d&apos;accusé de réception et le statut CA3.</li>
                <li>• Générer le mandat SEPA / quittance de paiement.</li>
                <li>• Archiver la preuve PDF et alimenter le classeur TVA.</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button onClick={() => setShowTransmitModal(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={() => {
                  triggerToast("success", "Télétransmission simulée : référence DGI #DGI-2025-CA3-1021.");
                  setShowTransmitModal(false);
                }}
                className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7C74]"
              >
                Envoyer la déclaration
              </button>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Génération CA3</h2>
                <p className="text-sm text-gray-500">Prévisualisation du PDF à transmettre.</p>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm text-gray-600">
              <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Info className="h-4 w-4 text-[#0D9488]" />
                <div>
                  <div className="font-medium text-gray-800">Synthèse</div>
                  <p className="text-xs text-gray-500">CA HT: 625 000 FCFA – TVA collectée: 125 000 FCFA – TVA déductible: 45 000 FCFA.</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Le PDF final reprendra les cadres 01 à 25 du formulaire CERFA n°3310-CA3.</p>
            </div>
            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button onClick={() => setShowGenerateModal(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                Fermer
              </button>
              <button
                onClick={handleGeneratePDF}
                className="rounded-lg bg-[#0D9488] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7C74]"
              >
                Générer PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}