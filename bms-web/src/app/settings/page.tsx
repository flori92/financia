"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Société</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Raison sociale</label>
              <input type="text" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="BMS SARL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SIRET</label>
              <input type="text" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="12345678900001" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Comptabilité</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Exercice comptable</label>
              <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>01/01 - 31/12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Devise</label>
              <select className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>FCFA (XOF)</option>
                <option>EUR</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Utilisateurs</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Jean Dupont</span>
              <span className="text-sm text-gray-600">Admin</span>
            </div>
            <button className="w-full px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74]">
              Ajouter utilisateur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}