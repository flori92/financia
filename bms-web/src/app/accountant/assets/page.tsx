"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost, getCompanyId } from "@/lib/api";
import { Building2, Plus, Search, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

type AssetStatus = "en_service" | "amortis" | "en_cours";

type AssetItem = {
  id: string;
  name: string;
  category: string;
  acquisitionDate: string;
  acquisitionValue: number;
  residualValue: number;
  status: AssetStatus;
  location?: string;
};

const fallbackAssets: AssetItem[] = [
  {
    id: "AST-001",
    name: "Serveur Comptable Dell R740",
    category: "Informatique",
    acquisitionDate: "2023-03-15",
    acquisitionValue: 12500000,
    residualValue: 6800000,
    status: "en_service",
    location: "Siège - Salle serveur",
  },
  {
    id: "AST-002",
    name: "Véhicule utilitaire Peugeot",
    category: "Transport",
    acquisitionDate: "2022-06-01",
    acquisitionValue: 18500000,
    residualValue: 9200000,
    status: "en_service",
    location: "Agence Abidjan",
  },
  {
    id: "AST-003",
    name: "Logiciel ERP Comptable",
    category: "Licences & logiciels",
    acquisitionDate: "2024-01-10",
    acquisitionValue: 5400000,
    residualValue: 4320000,
    status: "en_cours",
    location: "Cloud",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA";
}

function statusLabel(status: AssetStatus) {
  switch (status) {
    case "en_service":
      return { label: "En service", tone: "bg-emerald-100 text-emerald-700" };
    case "amortis":
      return { label: "Amorti", tone: "bg-slate-100 text-slate-700" };
    case "en_cours":
      return { label: "En cours", tone: "bg-amber-100 text-amber-700" };
    default:
      return { label: status, tone: "bg-slate-100 text-slate-700" };
  }
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Immobilier",
    acquisitionDate: new Date().toISOString().slice(0, 10),
    acquisitionValue: "",
    residualValue: "",
    status: "en_service" as AssetStatus,
    location: "",
  });
  const [saving, setSaving] = useState(false);

  const loadAssets = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setAssets(fallbackAssets);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet("/api/v1/assets", { companyId });
      if (Array.isArray(result) && result.length) {
        setAssets(
          result.map((item: any, index: number) => ({
            id: item.id || `AST-${String(index + 1).padStart(3, "0")}`,
            name: item.name || item.assetName || "Immobilisation",
            category: item.category || item.assetCategory || "Autre",
            acquisitionDate: item.acquisitionDate || item.startDate || new Date().toISOString().slice(0, 10),
            acquisitionValue: Number(item.acquisitionValue ?? item.purchaseValue ?? 0),
            residualValue: Number(item.residualValue ?? item.bookValue ?? 0),
            status: (item.status as AssetStatus) || "en_service",
            location: item.location || item.site || "",
          }))
        );
      } else {
        setAssets(fallbackAssets);
      }
    } catch (err) {
      console.error("loadAssets", err);
      setError("Impossible de récupérer les immobilisations (affichage des données de démonstration).");
      setAssets(fallbackAssets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const filteredAssets = useMemo(() => {
    if (!search.trim()) return assets;
    const term = search.toLowerCase();
    return assets.filter((asset) =>
      [asset.name, asset.category, asset.location, asset.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [assets, search]);

  const totalAcquisition = useMemo(() => assets.reduce((sum, item) => sum + (item.acquisitionValue || 0), 0), [assets]);
  const totalResidual = useMemo(() => assets.reduce((sum, item) => sum + (item.residualValue || 0), 0), [assets]);
  const serviceRate = useMemo(() => {
    if (!assets.length) return 0;
    const inService = assets.filter((asset) => asset.status === "en_service").length;
    return Math.round((inService / assets.length) * 100);
  }, [assets]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const companyId = getCompanyId();
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      acquisitionDate: form.acquisitionDate,
      acquisitionValue: Number(form.acquisitionValue || 0),
      residualValue: Number(form.residualValue || 0),
      status: form.status,
      location: form.location?.trim() || undefined,
      companyId,
    };
    if (!payload.name || payload.acquisitionValue <= 0) {
      setError("Merci de renseigner un nom et une valeur d'acquisition valide.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let created: any = null;
      if (companyId) {
        created = await apiPost("/api/v1/assets", payload);
      }
      const newAsset: AssetItem = {
        id: created?.id || `AST-${String(Date.now()).slice(-5)}`,
        name: created?.name || payload.name,
        category: created?.category || payload.category,
        acquisitionDate: created?.acquisitionDate || payload.acquisitionDate,
        acquisitionValue: Number(created?.acquisitionValue ?? payload.acquisitionValue),
        residualValue: Number(created?.residualValue ?? payload.residualValue),
        status: (created?.status as AssetStatus) || payload.status,
        location: created?.location || payload.location,
      };
      setAssets((prev) => [newAsset, ...prev]);
      setShowModal(false);
      setForm({
        name: "",
        category: "Immobilier",
        acquisitionDate: new Date().toISOString().slice(0, 10),
        acquisitionValue: "",
        residualValue: "",
        status: "en_service",
        location: "",
      });
    } catch (err) {
      console.error("createAsset", err);
      setError("Échec de la création via l'API. L'actif a été enregistré localement.");
      const fallback: AssetItem = {
        id: `AST-${String(Date.now()).slice(-5)}`,
        name: payload.name,
        category: payload.category,
        acquisitionDate: payload.acquisitionDate,
        acquisitionValue: payload.acquisitionValue,
        residualValue: payload.residualValue,
        status: payload.status,
        location: payload.location,
      };
      setAssets((prev) => [fallback, ...prev]);
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Immobilisations</h1>
          <p className="text-gray-600 mt-1">Suivi des actifs, amortissements et localisation</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]"
        >
          <Plus className="w-4 h-4" />
          Nouvelle immobilisation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Actifs enregistrés</div>
          <div className="text-2xl font-semibold text-slate-900">{assets.length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Valeur d'acquisition</div>
          <div className="text-xl font-semibold text-slate-900">{formatCurrency(totalAcquisition)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Valeur résiduelle</div>
          <div className="text-xl font-semibold text-slate-900">{formatCurrency(totalResidual)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-500">Taux en service</div>
          <div className="text-xl font-semibold text-slate-900">{serviceRate}%</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom, catégorie ou localisation..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
            />
          </div>
          <button
            type="button"
            onClick={loadAssets}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-slate-50"
          >
            Recharger
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#0D9488]" />
            Chargement des immobilisations…
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucune immobilisation trouvée avec ces critères</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 font-medium text-slate-600">Référence</th>
                  <th className="py-3 font-medium text-slate-600">Désignation</th>
                  <th className="py-3 font-medium text-slate-600">Catégorie</th>
                  <th className="py-3 font-medium text-slate-600">Date acquisition</th>
                  <th className="py-3 font-medium text-slate-600 text-right">Valeur d'origine</th>
                  <th className="py-3 font-medium text-slate-600 text-right">Valeur résiduelle</th>
                  <th className="py-3 font-medium text-slate-600">Localisation</th>
                  <th className="py-3 font-medium text-slate-600">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const tone = statusLabel(asset.status);
                  return (
                    <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 font-mono text-xs text-slate-500">{asset.id}</td>
                      <td className="py-3 text-slate-900 font-medium">{asset.name}</td>
                      <td className="py-3 text-slate-700">{asset.category}</td>
                      <td className="py-3 text-slate-600">{new Date(asset.acquisitionDate).toLocaleDateString("fr-FR")}</td>
                      <td className="py-3 text-right text-slate-900">{formatCurrency(asset.acquisitionValue || 0)}</td>
                      <td className="py-3 text-right text-slate-900">{formatCurrency(asset.residualValue || 0)}</td>
                      <td className="py-3 text-slate-600">{asset.location || "—"}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tone.tone}`}>
                          {asset.status === "en_service" && <CheckCircle2 className="w-3 h-3" />}
                          {tone.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Nouvelle immobilisation</h2>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Désignation</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  >
                    <option value="Immobilier">Immobilier</option>
                    <option value="Informatique">Informatique</option>
                    <option value="Transport">Transport</option>
                    <option value="Mobilier">Mobilier</option>
                    <option value="Licences & logiciels">Licences & logiciels</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date d'acquisition</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.acquisitionDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, acquisitionDate: event.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valeur d'acquisition</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.acquisitionValue}
                    onChange={(event) => setForm((prev) => ({ ...prev, acquisitionValue: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valeur résiduelle</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.residualValue}
                    onChange={(event) => setForm((prev) => ({ ...prev, residualValue: event.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as AssetStatus }))}
                  >
                    <option value="en_service">En service</option>
                    <option value="en_cours">En cours d'installation</option>
                    <option value="amortis">Amorti</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Localisation (optionnel)</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={form.location}
                    onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D9488] text-white text-sm hover:bg-[#0B7C74] disabled:opacity-60"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
