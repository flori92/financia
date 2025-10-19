"use client";

import { CalendarClock } from "lucide-react";

export default function TaxCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendrier fiscal</h1>
        <p className="text-gray-600 mt-1">Échéances et rappels</p>
      </div>

      <div className="bg-white rounded-xl border p-12 text-center">
        <CalendarClock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Calendrier fiscal disponible prochainement</p>
      </div>
    </div>
  );
}
