"use client";
import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { useCompanyId } from '@/hooks/useCompanyId';
import { formatCurrency } from "@/lib/format-utils";
import { Database, Filter, Download, RefreshCw, BarChart3, PieChart, LineChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, Area } from "recharts";

const DIMENSIONS = ["Temps", "Géographie", "Produit", "Client", "Canal"];
const MESURES = ["CA", "Marge", "Volume", "Coût"];

const CUBE_DATA = [
  { periode: "T1 2024", ca: 385000, marge: 115500, volume: 245, cout: 269500 },
  { periode: "T2 2024", ca: 425000, marge: 127500, volume: 280, cout: 297500 },
  { periode: "T3 2024", ca: 468000, marge: 140400, volume: 315, cout: 327600 },
  { periode: "T4 2024", ca: 512000, marge: 153600, volume: 342, cout: 358400 },
];

const GEO_DATA = [
  { region: "Cotonou", ca: 580000, part: 38 },
  { region: "Porto-Novo", ca: 420000, part: 28 },
  { region: "Parakou", ca: 310000, part: 20 },
  { region: "Autres", ca: 210000, part: 14 },
];

const PRODUCT_ANALYSIS = [
  { produit: "Produit A", ca: 450000, marge: 32, rotation: 8.5 },
  { produit: "Produit B", ca: 380000, marge: 28, rotation: 6.2 },
  { produit: "Produit C", ca: 320000, marge: 35, rotation: 7.8 },
  { produit: "Produit D", ca: 280000, marge: 25, rotation: 5.4 },
];

export default function BIPage() {
  const companyId = useCompanyId();
  const [selectedDim, setSelectedDim] = useState("Temps");
  const [selectedMesure, setSelectedMesure] = useState("CA");

  useEffect(() => {
    loadBI();
  }, [companyId]);

  const loadBI = async () => {
    try {
      const data = await apiGet('/dashboard/bi', { companyId });
      console.log('BI data loaded:', data);
    } catch (error) {
      console.error('Erreur chargement BI:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BI avancée</h1>
          <p className="text-gray-600 mt-1">Analyse OLAP et cubes de données</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Dimensions:</span>
          </div>
          <div className="flex gap-2">
            {DIMENSIONS.map((dim) => (
              <button
                key={dim}
                onClick={() => setSelectedDim(dim)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedDim === dim
                    ? "bg-[#0D9488] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {dim}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium">Mesures:</span>
          </div>
          <div className="flex gap-2">
            {MESURES.map((mes) => (
              <button
                key={mes}
                onClick={() => setSelectedMesure(mes)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedMesure === mes
                    ? "bg-[#06B6D4] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {mes}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-[#0D9488]" />
            <div className="text-sm text-gray-600">CA Total</div>
          </div>
          <div className="text-2xl font-bold">1 790 000 FCFA</div>
          <div className="text-sm text-green-600 mt-1">+18% vs N-1</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-gray-600">Marge moyenne</div>
          </div>
          <div className="text-2xl font-bold">30%</div>
          <div className="text-sm text-green-600 mt-1">+2 pts vs N-1</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-2">
            <LineChart className="w-5 h-5 text-purple-600" />
            <div className="text-sm text-gray-600">Volume</div>
          </div>
          <div className="text-2xl font-bold">1 182</div>
          <div className="text-sm text-green-600 mt-1">+15% vs N-1</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-orange-600" />
            <div className="text-sm text-gray-600">Coût moyen</div>
          </div>
          <div className="text-2xl font-bold">1 253 000 FCFA</div>
          <div className="text-sm text-red-600 mt-1">+8% vs N-1</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Analyse temporelle (Cube OLAP)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={CUBE_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periode" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="ca" fill="#0D9488" name="CA" />
            <Line yAxisId="right" type="monotone" dataKey="marge" stroke="#06B6D4" strokeWidth={2} name="Marge" />
            <Area yAxisId="left" type="monotone" dataKey="cout" fill="#F59E0B" stroke="#F59E0B" fillOpacity={0.3} name="Coût" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Répartition géographique</h2>
          <div className="space-y-3">
            {GEO_DATA.map((geo, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{geo.region}</span>
                  <span className="text-gray-600">{geo.ca.toLocaleString('fr-FR')} FCFA ({geo.part}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0D9488] h-2 rounded-full"
                    style={{ width: `${geo.part}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-4">Performance produits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">CA</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Marge %</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rotation</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {PRODUCT_ANALYSIS.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{prod.produit}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(prod.ca)}</td>
                    <td className="px-3 py-2 text-right text-green-600 font-medium">{prod.marge}%</td>
                    <td className="px-3 py-2 text-right">{prod.rotation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
