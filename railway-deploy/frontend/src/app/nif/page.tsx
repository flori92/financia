"use client";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";

function fd(s: any) { const d = s? new Date(s): null; return !d||isNaN(d.getTime())? "": d.toLocaleDateString("fr-FR"); }

export default function NifPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    apiGet('/api/v1/nif/my-requests')
      .then((list: any[]) => setRows(list||[]))
      .catch((e: unknown) => setError(String(e)))
      .finally(()=> setLoading(false));
  }, []);

  const mapped = useMemo(()=> (rows||[]).map((r:any)=>({
    id: r.id,
    businessName: r.businessName,
    status: r.status,
    submittedAt: fd(r.submittedAt),
    nifNumber: r.nifNumber || "—",
  })), [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Suivi NIF</h1>
      </div>

      {error && <div className="text-sm text-rose-600">{error}</div>}
      {loading && <div className="text-sm text-slate-500">Chargement…</div>}

      <div className="card p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2">Entreprise</th>
              <th className="py-2">Statut</th>
              <th className="py-2">Soumise le</th>
              <th className="py-2">NIF</th>
            </tr>
          </thead>
          <tbody>
            {mapped.map((r)=> (
              <tr key={r.id} className="border-t border-app-border">
                <td className="py-2">{r.businessName}</td>
                <td className="py-2">
                  {r.status === 'approved' ? <span className="badge-success">Approuvée</span>
                   : r.status === 'rejected' ? <span className="badge-danger">Rejetée</span>
                   : r.status === 'under_review' ? <span className="badge-warning">En cours</span>
                   : <span className="badge-warning">En attente</span>}
                </td>
                <td className="py-2">{r.submittedAt}</td>
                <td className="py-2">{r.nifNumber}</td>
              </tr>
            ))}
            {mapped.length === 0 && !loading && (
              <tr><td className="py-4 text-slate-500" colSpan={4}>Aucune demande pour l’instant.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
