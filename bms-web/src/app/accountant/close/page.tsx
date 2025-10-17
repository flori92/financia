"use client";
import { useState, useEffect } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ClosePeriodPage() {
  const [loading, setLoading] = useState(false);
  const [closures, setClosures] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(
    new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 10)
  );
  const [preview, setPreview] = useState<any | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  async function refresh() {
    const cid = getCompanyId();
    if (!cid) return;
    try {
      const data = await apiGet('/api/v1/accounting/closure', { companyId: cid });
      setClosures(data || []);
    } catch (e: any) {
      console.error(e);
    }
  }

  async function calculatePreview() {
    const cid = getCompanyId();
    if (!cid) { showError('Aucune société sélectionnée'); return; }
    if (!startDate || !endDate) { showError('Dates requises'); return; }
    
    setLoading(true);
    try {
      const data = await apiGet('/api/v1/accounting/closure/preview', { 
        companyId: cid, 
        startDate, 
        endDate 
      });
      setPreview(data);
      if (!data.canClose) {
        showError(data.reason || 'Impossible de clôturer');
      } else {
        showSuccess('Calcul effectué');
      }
    } catch (e: any) {
      showError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleClose() {
    const cid = getCompanyId();
    if (!cid || !preview || !preview.canClose) return;
    
    const userId = '550e8400-e29b-41d4-a716-446655440000'; // TODO: récupérer du contexte
    
    setLoading(true);
    try {
      await apiPost('/api/v1/accounting/closure/close', {
        companyId: cid,
        startDate,
        endDate,
        userId,
      });
      showSuccess('Période clôturée avec succès');
      setShowConfirm(false);
      setPreview(null);
      await refresh();
    } catch (e: any) {
      showError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const nf = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-3 shadow-lg ${toast.type==='success'?'bg-emerald-50 text-emerald-800':'bg-rose-50 text-rose-800'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clôture de Période</h1>
      </div>

      {/* Instructions */}
      <div className="card p-4 bg-amber-50 border border-amber-200">
        <div className="flex gap-2 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 mb-1">⚠️ Attention : Action irréversible</h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>La clôture verrouille définitivement toutes les écritures de la période</li>
              <li>Une OD de clôture sera automatiquement générée</li>
              <li>Le résultat sera transféré vers le compte 120 (Résultat de l'exercice)</li>
              <li>Aucune modification ne sera plus possible après clôture</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Sélection de la période</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        
        <button
          onClick={calculatePreview}
          disabled={loading}
          className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E] disabled:opacity-50"
        >
          {loading ? 'Calcul...' : 'Calculer le résultat'}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Résultat de la période</h3>
          
          {!preview.canClose ? (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-4 mb-4">
              <div className="flex items-center gap-2 text-rose-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{preview.reason}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <div className="text-sm text-emerald-700 mb-1">Total Produits</div>
                  <div className="text-2xl font-semibold text-emerald-900">{nf(preview.totalRevenues)} FCFA</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-700 mb-1">Total Charges</div>
                  <div className="text-2xl font-semibold text-orange-900">{nf(preview.totalExpenses)} FCFA</div>
                </div>
                <div className={`p-4 rounded-lg ${preview.result >= 0 ? 'bg-blue-50' : 'bg-rose-50'}`}>
                  <div className={`text-sm mb-1 ${preview.result >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                    {preview.result >= 0 ? 'Résultat Bénéficiaire' : 'Résultat Déficitaire'}
                  </div>
                  <div className={`text-2xl font-semibold ${preview.result >= 0 ? 'text-blue-900' : 'text-rose-900'}`}>
                    {nf(Math.abs(preview.result))} FCFA
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Opérations effectuées lors de la clôture :</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Génération d'une OD de clôture pour solder les comptes de gestion (classes 6 et 7)</li>
                  <li>Transfert du résultat vers le compte 120 (Résultat de l'exercice)</li>
                  <li>Verrouillage de toutes les écritures jusqu'au {new Date(endDate).toLocaleDateString('fr-FR')}</li>
                  <li>Création d'un enregistrement de clôture dans l'historique</li>
                </ol>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                className="rounded-md bg-rose-600 text-white text-sm px-4 py-2 hover:bg-rose-700 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Clôturer la période
              </button>
            </>
          )}
        </div>
      )}

      {/* Historique */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Historique des clôtures</h3>
        {closures.length === 0 ? (
          <div className="text-sm text-slate-500">Aucune clôture enregistrée</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-app-border">
                  <th className="pb-2">Période</th>
                  <th className="pb-2 text-right">Résultat</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2">Clôturée le</th>
                </tr>
              </thead>
              <tbody>
                {closures.map((closure: any) => (
                  <tr key={closure.id} className="border-b border-app-border">
                    <td className="py-2">
                      {new Date(closure.startDate).toLocaleDateString('fr-FR')} → {new Date(closure.endDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className={`py-2 text-right font-mono ${closure.resultAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {nf(Math.abs(closure.resultAmount))} FCFA
                    </td>
                    <td className="py-2">
                      {closure.status === 'closed' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          Clôturée
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-slate-600">
                      {closure.closedAt ? new Date(closure.closedAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Confirmer la clôture
            </h3>
            <p className="text-sm text-slate-700 mb-4">
              Êtes-vous absolument certain de vouloir clôturer cette période ?<br />
              <strong className="text-rose-700">Cette action est irréversible.</strong>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-4 py-2 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-md bg-rose-600 text-white text-sm px-4 py-2 hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? 'Clôture...' : 'Confirmer la clôture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
