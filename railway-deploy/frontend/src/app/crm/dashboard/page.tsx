"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { TrendingUp, Users, DollarSign, Target } from "lucide-react";
import Link from "next/link";

export default function CRMDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const cid = getCompanyId();
    if (!cid) return;
    setLoading(true);
    try {
      const result = await apiGet('/api/v1/crm/dashboard', { companyId: cid });
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="p-8">Chargement...</div>;
  if (!data) return <div className="p-8">Aucune donnée</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">CRM Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-700">Contacts</div>
              <div className="text-2xl font-bold text-blue-900">{data.stats.totalContacts}</div>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-emerald-700">Opportunités</div>
              <div className="text-2xl font-bold text-emerald-900">{data.stats.activeOpportunities}</div>
            </div>
            <Target className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-700">Ventes gagnées</div>
              <div className="text-2xl font-bold text-purple-900">{data.stats.wonDeals}</div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="card p-4 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-amber-700">CA Total</div>
              <div className="text-2xl font-bold text-amber-900">{(data.stats.revenue / 1000000).toFixed(1)}M</div>
            </div>
            <DollarSign className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Pipeline de ventes</h3>
          <div className="space-y-3">
            {data.pipeline.map((stage: any) => (
              <div key={stage.stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-slate-600">{stage.count} • {(stage.value / 1000000).toFixed(1)}M FCFA</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-app-primary rounded-full"
                    style={{ width: `${(stage.value / 5000000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-4">Activités récentes</h3>
          <div className="space-y-3">
            {data.recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-2 h-2 bg-app-primary rounded-full mt-2" />
                <div className="flex-1">
                  <div className="font-medium">{activity.contact}</div>
                  <div className="text-sm text-slate-600">{activity.description}</div>
                  <div className="text-xs text-slate-500 mt-1">{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/crm/contacts" className="btn-primary">
          Voir tous les contacts
        </Link>
        <Link href="/crm/opportunities" className="btn-secondary">
          Gérer les opportunités
        </Link>
      </div>
    </div>
  );
}
