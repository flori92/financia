"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronRight, ClipboardList, FileCheck, FileText, Info, Loader2, UploadCloud } from "lucide-react";

const declarationTypes = [
  { id: "tva", title: "Déclaration TVA", description: "Mensuelle, télétransmission + paiement en ligne" },
  { id: "is", title: "Impôt sur les Sociétés", description: "Mensuelle, acompte provisionnel" },
  { id: "ir", title: "Impôt sur le Revenu", description: "Déclaration trimestrielle salariés/TS" }
];

const steps = [
  { id: 1, title: "Synthèse", description: "Résumé des déclarations en cours" },
  { id: 2, title: "Préparation", description: "Choix du type et import des pièces" },
  { id: 3, title: "Saisie", description: "Simulation & calcul automatique" },
  { id: 4, title: "Validation", description: "Contrôle, signature et télédéclaration" },
  { id: 5, title: "Suivi", description: "Statut DGI, preuves de dépôt" }
];

export default function TaxDeclarationsPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Déclarations fiscales</h1>
          <p className="text-gray-600 mt-1">Télédéclarations, calcul automatique et suivi en temps réel</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Module prototype</span>
          <span className="hidden md:inline-block">|</span>
          <Link href="/tax" className="text-app-primary hover:underline">Retour fiscalité</Link>
        </div>
      </div>

      <section className="bg-white border rounded-xl p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Maquette du parcours</h2>
            <p className="text-sm text-gray-500">Visualisez les étapes clés avant implémentation backend</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="h-4 w-4" />
            <span>Les actions sont simulées et ne génèrent pas de données réelles.</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`rounded-xl border p-4 text-left transition ${
                activeStep === step.id ? "border-emerald-500 bg-emerald-50" : "hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-xs font-medium text-gray-500">Étape {step.id}</div>
                {activeStep > step.id && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-800">{step.title}</div>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">{step.description}</p>
            </button>
          ))}
        </div>

        <div className="border rounded-xl p-6 bg-gray-50">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-semibold">Synthèse et statut</h3>
                  <p className="text-sm text-gray-600">Récapitulatif des obligations en cours avant une nouvelle déclaration.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-dashed border-emerald-200 bg-white p-4">
                  <div className="text-xl font-bold text-emerald-600">0</div>
                  <div className="text-sm text-gray-600">Déclarations en attente</div>
                </div>
                <div className="rounded-lg border border-dashed border-amber-200 bg-white p-4">
                  <div className="text-xl font-bold text-amber-600">15 Avril</div>
                  <div className="text-sm text-gray-600">Prochaine échéance TVA</div>
                </div>
                <div className="rounded-lg border border-dashed border-gray-200 bg-white p-4">
                  <div className="text-xl font-bold text-gray-600">Historique</div>
                  <div className="text-sm text-gray-600">Consultable une fois le module connecté</div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-semibold">Préparation de la déclaration</h3>
                  <p className="text-sm text-gray-600">Choisissez la typologie et regroupez les justificatifs.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {declarationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`border rounded-lg p-4 text-left transition ${
                      selectedType === type.id ? "border-emerald-500 bg-white" : "border-dashed border-gray-300 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-800">{type.title}</div>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">{type.description}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-app-primary">
                      Préparer <ChevronRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                Dépôt de pièces justificatives (journal TVA, factures, fichiers XML) prévu via glisser-déposer vers la plateforme DGI.
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-semibold">Saisie assistée</h3>
                  <p className="text-sm text-gray-600">Calcul automatique à partir des écritures comptables.</p>
                </div>
              </div>
              <div className="rounded-lg border border-white bg-white p-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Import des écritures classe 7 pour le CA taxable.</li>
                  <li>• Ventilation par taux (18%, exonéré, export) avec contrôles de cohérence.</li>
                  <li>• Simulation du montant TVA collectée vs TVA déductible.</li>
                  <li>• Vérifications automatiques : correspondance chiffre d’affaires, anomalies sur numérotation.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Une prévisualisation du formulaire CERFA/État DGI sera générée, prête pour signature électronique.
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-semibold">Validation & dépôt</h3>
                  <p className="text-sm text-gray-600">Revue finale avant transmission aux impôts.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
                  Checklist : signature dirigeant/EC, mandat de télédéclaration, pièces jointes.
                </div>
                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
                  Connexion API DGI (login-facile) ou export XML pour dépôt manuel.
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Confirmation attendue : numéro d’accusé de réception, référence de paiement, preuve PDF.
              </div>
            </div>
          )}

          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-semibold">Suivi & historique</h3>
                  <p className="text-sm text-gray-600">Centralisation des dépôts et paiements pour auditer.</p>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-gray-500 border-b">
                      <th className="py-2">Période</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Montant</th>
                      <th className="py-2">Statut</th>
                      <th className="py-2">Justificatifs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b text-gray-500">
                      <td className="py-2">Janvier 2025</td>
                      <td className="py-2">TVA</td>
                      <td className="py-2">0 FCFA</td>
                      <td className="py-2">À intégrer</td>
                      <td className="py-2">Preuve dépôt, reçu paiement</td>
                    </tr>
                    <tr className="text-gray-500">
                      <td className="py-2">Décembre 2024</td>
                      <td className="py-2">IS</td>
                      <td className="py-2">0 FCFA</td>
                      <td className="py-2">Historique en attente</td>
                      <td className="py-2">À alimenter via DGI</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                <div className="font-medium text-gray-700 mb-2">✅ Fonctionnalités disponibles</div>
                <ul className="space-y-1">
                  <li>• Rappels automatiques des échéances</li>
                  <li>• Relances e-mail intégrées</li>
                  <li>• Export FEC format fiscal</li>
                  <li>• Archivage sécurisé 10 ans</li>
                  <li>• Télétransmission DGI</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
