"use client";

import { CalendarClock, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";

const TAX_EVENTS = [
  { id: 1, title: "Déclaration TVA", date: "2025-01-25", type: "TVA", status: "pending", priority: "high", description: "Déclaration mensuelle TVA janvier" },
  { id: 2, title: "Paiement TVA", date: "2025-01-25", type: "TVA", status: "pending", priority: "high", description: "Paiement TVA janvier" },
  { id: 3, title: "Déclaration IR", date: "2025-02-15", type: "IR", status: "upcoming", priority: "medium", description: "Déclaration impôt sur le revenu" },
  { id: 4, title: "Cotisations sociales", date: "2025-02-28", type: "Social", status: "upcoming", priority: "medium", description: "Paiement cotisations CNSS" },
  { id: 5, title: "Déclaration IS", date: "2025-03-31", type: "IS", status: "upcoming", priority: "low", description: "Déclaration impôt sur les sociétés" },
  { id: 6, title: "Bilan annuel", date: "2025-04-30", type: "Comptable", status: "upcoming", priority: "high", description: "Dépôt bilan et liasse fiscale" },
];

const COMPLETED = [
  { title: "Déclaration TVA Décembre", date: "2024-12-20", type: "TVA" },
  { title: "Paiement TVA Décembre", date: "2024-12-20", type: "TVA" },
  { title: "Cotisations sociales Q4", date: "2024-12-31", type: "Social" },
];

const getStatusColor = (status: string) => {
  switch(status) {
    case "pending": return "bg-red-100 text-red-700";
    case "upcoming": return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getPriorityIcon = (priority: string) => {
  switch(priority) {
    case "high": return <AlertCircle className="w-5 h-5 text-red-600" />;
    case "medium": return <Clock className="w-5 h-5 text-yellow-600" />;
    default: return <FileText className="w-5 h-5 text-gray-600" />;
  }
};

export default function TaxCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendrier fiscal</h1>
        <p className="text-gray-600 mt-1">Échéances et rappels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="text-sm text-gray-600">Urgent</div>
          </div>
          <div className="text-2xl font-bold">2</div>
          <div className="text-sm text-gray-600 mt-1">Dans les 7 jours</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div className="text-sm text-gray-600">À venir</div>
          </div>
          <div className="text-2xl font-bold">4</div>
          <div className="text-sm text-gray-600 mt-1">Dans les 30 jours</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="text-sm text-gray-600">Terminé</div>
          </div>
          <div className="text-2xl font-bold">3</div>
          <div className="text-sm text-gray-600 mt-1">Ce mois-ci</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Échéances à venir</h2>
        <div className="space-y-3">
          {TAX_EVENTS.map((event) => (
            <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <div className="mt-1">
                {getPriorityIcon(event.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{event.title}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status === "pending" ? "Urgent" : "À venir"}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{event.description}</div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarClock className="w-4 h-4" />
                    {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{event.type}</span>
                </div>
              </div>
              <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Déclarer
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Déclarations effectuées</h2>
        <div className="space-y-2">
          {COMPLETED.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.type}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(item.date).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
