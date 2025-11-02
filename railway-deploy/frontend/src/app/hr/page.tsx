"use client";
import { Users, DollarSign, Calendar, FileText } from "lucide-react";
import Link from "next/link";

export default function HRPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ressources Humaines</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/hr/employees" className="card p-6 hover:shadow-lg transition-shadow">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold mb-2">Employés</h3>
          <p className="text-sm text-slate-600">Gestion des employés et contrats</p>
        </Link>
        <Link href="/hr/payroll" className="card p-6 hover:shadow-lg transition-shadow">
          <DollarSign className="w-8 h-8 text-emerald-600 mb-2" />
          <h3 className="font-semibold mb-2">Paie</h3>
          <p className="text-sm text-slate-600">Calcul et génération des fiches de paie</p>
        </Link>
        <Link href="/hr/leaves" className="card p-6 hover:shadow-lg transition-shadow">
          <Calendar className="w-8 h-8 text-amber-600 mb-2" />
          <h3 className="font-semibold mb-2">Congés & Absences</h3>
          <p className="text-sm text-slate-600">Gestion des demandes de congés</p>
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
