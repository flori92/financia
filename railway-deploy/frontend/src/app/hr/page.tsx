"use client";
import { Users, DollarSign, Calendar, FileText, Clock, FileCheck, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HRPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ressources Humaines</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/hr/employees" className="card p-6 hover:shadow-lg transition-shadow">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold mb-2">Employés</h3>
          <p className="text-sm text-slate-600">Gestion des employés et contrats</p>
        </Link>
        <Link href="/hr/payroll" className="card p-6 hover:shadow-lg transition-shadow">
          <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
          <h3 className="font-semibold mb-2">Bulletins de Paie</h3>
          <p className="text-sm text-slate-600">Calcul et génération des fiches de paie</p>
        </Link>
        <Link href="/hr/timesheets" className="card p-6 hover:shadow-lg transition-shadow">
          <Clock className="w-8 h-8 text-indigo-600 mb-2" />
          <h3 className="font-semibold mb-2">CRA (Comptes Rendus d'Activité)</h3>
          <p className="text-sm text-slate-600">Calendrier pour valider son CRA</p>
        </Link>
        <Link href="/hr/leaves" className="card p-6 hover:shadow-lg transition-shadow">
          <Calendar className="w-8 h-8 text-amber-600 mb-2" />
          <h3 className="font-semibold mb-2">Congés & Absences</h3>
          <p className="text-sm text-slate-600">Soumettre et gérer vos congés</p>
        </Link>
        <Link href="/hr/attendance" className="card p-6 hover:shadow-lg transition-shadow">
          <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-semibold mb-2">Présences</h3>
          <p className="text-sm text-slate-600">Suivi et gestion des présences du personnel</p>
        </Link>
        <Link href="/hr/certificates" className="card p-6 hover:shadow-lg transition-shadow">
          <FileCheck className="w-8 h-8 text-teal-600 mb-2" />
          <h3 className="font-semibold mb-2">Attestations</h3>
          <p className="text-sm text-slate-600">Attestations employeur et certificats</p>
        </Link>
        <Link href="/hr/expenses" className="card p-6 hover:shadow-lg transition-shadow">
          <FileText className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold mb-2">Notes de Frais</h3>
          <p className="text-sm text-slate-600">Validation et remboursement</p>
        </Link>
      </div>
    </div>
  );
}
