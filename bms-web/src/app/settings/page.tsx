"use client";
import { useEffect, useState } from "react";
import { apiGet, apiPatch, getCompanyId } from "@/lib/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(7);
  const [warningThreshold, setWarningThreshold] = useState<number>(15);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true);
    apiGet(`/api/v1/companies/${cid}`)
      .then((data: any) => {
        setCompany(data);
        setCriticalThreshold(data.treasuryCriticalThreshold || 7);
        setWarningThreshold(data.treasuryWarningThreshold || 15);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    const cid = getCompanyId();
    if (!cid) return;
    setSaving(true);
    setMessage(null);
    try {
      await apiPatch(`/api/v1/companies/${cid}/treasury-settings`, {
        treasuryCriticalThreshold: criticalThreshold,
        treasuryWarningThreshold: warningThreshold,
      });
      setMessage({ type: 'success', text: 'Seuils de trésorerie mis à jour avec succès !' });
    } catch (e) {
      setMessage({ type: 'error', text: `Erreur: ${String(e)}` });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Paramètres</h1>
      </div>

      <div className="card p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Configuration Trésorerie</h2>
        <p className="text-sm text-slate-600 mb-6">
          Définissez les seuils d'alerte pour la trésorerie de votre société. Ces seuils déterminent quand vous recevrez des notifications.
        </p>

        {message && (
          <div
            className={`rounded-md px-4 py-3 mb-4 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Seuil Critique (jours) 🔴
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={criticalThreshold}
              onChange={(e) => setCriticalThreshold(parseInt(e.target.value, 10) || 7)}
              className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
            />
            <p className="text-xs text-slate-500 mt-1">
              Vous recevrez une notification critique si votre runway tombe en dessous de ce seuil.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Seuil Warning (jours) 🟡
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(parseInt(e.target.value, 10) || 15)}
              className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
            />
            <p className="text-xs text-slate-500 mt-1">
              Vous recevrez un avertissement si votre runway est entre le seuil critique et ce seuil.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-app-primary text-white px-4 py-2 hover:bg-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>

        {company && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Informations Société</h3>
            <dl className="text-sm space-y-1">
              <div className="flex gap-2">
                <dt className="font-medium text-slate-600">Nom:</dt>
                <dd className="text-slate-700">{company.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-slate-600">Devise:</dt>
                <dd className="text-slate-700">{company.defaultCurrency}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-slate-600">Plan:</dt>
                <dd className="text-slate-700">{company.plan}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
