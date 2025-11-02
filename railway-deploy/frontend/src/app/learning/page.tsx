"use client";

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Formation</h1>
        <div className="text-sm text-slate-500">Guides et ressources</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="font-medium">Guide de démarrage BMS</div>
          <div className="text-sm text-slate-600 mt-1">Premiers pas pour configurer votre entreprise.</div>
          <button className="mt-3 rounded-md bg-app-primary text-white text-sm px-3 py-2 hover:bg-[#0F766E]">Ouvrir</button>
        </div>
        <div className="card p-4">
          <div className="font-medium">Rapprochement bancaire</div>
          <div className="text-sm text-slate-600 mt-1">Comment rapprocher vos relevés.</div>
          <button className="mt-3 rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Voir</button>
        </div>
        <div className="card p-4">
          <div className="font-medium">Fiscalité (Bénin)</div>
          <div className="text-sm text-slate-600 mt-1">Obligations et échéances principales.</div>
          <button className="mt-3 rounded-md bg-white text-slate-700 border border-app-border text-sm px-3 py-2 hover:bg-slate-50">Voir</button>
        </div>
      </div>
    </div>
  );
}
