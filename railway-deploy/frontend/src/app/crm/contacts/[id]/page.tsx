"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { Mail, Phone, MapPin, DollarSign, Calendar } from "lucide-react";
import { useParams } from "next/navigation";

export default function ContactDetailPage() {
  const params = useParams();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadContact() {
    if (!params?.id) return;
    setLoading(true);
    try {
      const data = await apiGet(`/api/v1/crm/contacts/${params.id}`);
      setContact(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadContact(); }, [params?.id]);

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!contact) return <div className="p-8">Contact non trouvé</div>;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <p className="text-slate-600">{contact.company}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${contact.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
            {contact.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4" />
            <span>{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{contact.address}</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-700">Valeur totale</div>
              <div className="text-xl font-bold text-blue-900">{safeToLocaleString(contact.totalValue)} FCFA</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Opportunités</h3>
          <div className="space-y-3">
            {contact.opportunities.map((opp: any) => (
              <div key={opp.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{opp.title}</div>
                    <div className="text-sm text-slate-600">{opp.stage}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{safeToLocaleString(opp.value)} FCFA</div>
                    <div className="text-sm text-slate-600">{opp.probability}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Activités récentes</h3>
          <div className="space-y-3">
            {contact.activities.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.description}</div>
                  <div className="text-xs text-slate-500">{activity.date} • {activity.user}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-4">Factures</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-app-border">
              <th className="pb-3">N°</th>
              <th className="pb-3">Date</th>
              <th className="pb-3 text-right">Montant</th>
              <th className="pb-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {contact.invoices.map((invoice: any) => (
              <tr key={invoice.id} className="border-b border-app-border">
                <td className="py-3 font-mono text-sm">{invoice.number}</td>
                <td className="py-3">{invoice.date}</td>
                <td className="py-3 text-right">{safeToLocaleString(invoice.amount)} FCFA</td>
                <td className="py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
