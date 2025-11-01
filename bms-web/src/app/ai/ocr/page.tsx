"use client";

import { useState } from "react";
import { Upload, FileText, Receipt, Building2, CheckCircle, AlertCircle, Camera, Download, Sparkles, Info } from "lucide-react";

type DocumentType = "invoice" | "receipt" | "bank_statement";

type OcrResult = {
  type: DocumentType;
  confidence: number;
  data: any;
  extractedAt: string;
};

export default function OcrPage() {
  const [selectedType, setSelectedType] = useState<DocumentType>("invoice");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const documentTypes: { value: DocumentType; label: string; icon: typeof FileText; description: string }[] = [
    { value: "invoice", label: "Facture", icon: FileText, description: "Extraction de factures fournisseurs" },
    { value: "receipt", label: "Reçu", icon: Receipt, description: "Tickets de caisse et reçus" },
    { value: "bank_statement", label: "Relevé bancaire", icon: Building2, description: "Relevés et transactions" }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Format non supporté. Utilisez JPG, PNG ou PDF.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Fichier trop volumineux. Maximum 10 Mo.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`http://localhost:3001/api/v1/ai/ocr/${selectedType}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'extraction OCR");
      }

      const data = await response.json();
      
      setResult({
        type: selectedType,
        confidence: data.confidence || 0.95,
        data,
        extractedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  };

  const renderExtractedData = () => {
    if (!result) return null;

    const { data, confidence } = result;

    if (selectedType === "invoice") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">N° Facture</label>
              <div className="mt-1 text-lg font-semibold">{data.invoiceNumber}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date</label>
              <div className="mt-1 text-lg font-semibold">{new Date(data.date).toLocaleDateString("fr-FR")}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Fournisseur</label>
              <div className="mt-1 text-lg font-semibold">{data.supplierName}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Montant TTC</label>
              <div className="mt-1 text-lg font-semibold text-[#0D9488]">
                {new Intl.NumberFormat("fr-FR").format(data.total)} FCFA
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Articles</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qté</th>
                  <th className="text-right py-2">Prix unitaire</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{new Intl.NumberFormat("fr-FR").format(item.unitPrice)} FCFA</td>
                    <td className="text-right font-medium">{new Intl.NumberFormat("fr-FR").format(item.total)} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total HT</span>
              <span>{new Intl.NumberFormat("fr-FR").format(data.subtotal)} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>TVA</span>
              <span>{new Intl.NumberFormat("fr-FR").format(data.vatAmount)} FCFA</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total TTC</span>
              <span className="text-[#0D9488]">{new Intl.NumberFormat("fr-FR").format(data.total)} FCFA</span>
            </div>
          </div>
        </div>
      );
    }

    if (selectedType === "receipt") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Commerce</label>
              <div className="mt-1 text-lg font-semibold">{data.merchant}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date</label>
              <div className="mt-1 text-lg font-semibold">
                {new Date(data.date).toLocaleDateString("fr-FR")} {data.time}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Articles</h4>
            {data.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between py-1 text-sm">
                <span>{item.description}</span>
                <span className="font-medium">{new Intl.NumberFormat("fr-FR").format(item.amount)} FCFA</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{new Intl.NumberFormat("fr-FR").format(data.subtotal)} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxe</span>
              <span>{new Intl.NumberFormat("fr-FR").format(data.tax)} FCFA</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#0D9488]">{new Intl.NumberFormat("fr-FR").format(data.total)} FCFA</span>
            </div>
            <div className="text-sm text-gray-600">
              Paiement: {data.paymentMethod}
            </div>
          </div>
        </div>
      );
    }

    if (selectedType === "bank_statement") {
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Transactions extraites</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Montant</th>
                <th className="text-right py-2">Solde</th>
              </tr>
            </thead>
            <tbody>
              {data.map((transaction: any, idx: number) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{new Date(transaction.date).toLocaleDateString("fr-FR")}</td>
                  <td>{transaction.description}</td>
                  <td className={`text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : ''}
                    {new Intl.NumberFormat("fr-FR").format(transaction.amount)} FCFA
                  </td>
                  <td className="text-right">{new Intl.NumberFormat("fr-FR").format(transaction.balance)} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">OCR - Extraction de documents</h1>
        <p className="text-gray-600 mt-1">
          Numérisez vos factures, reçus et relevés bancaires automatiquement
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-green-900">
          <p className="font-medium mb-1">✅ OCR Réel avec Tesseract.js</p>
          <p className="text-green-700">
            L'extraction OCR fonctionne avec <strong>Tesseract.js</strong> - solution open-source gratuite et locale, sans API externe. Support français et anglais avec reconnaissance automatique du type de document.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone de sélection et upload */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Type de document</h3>
            <div className="grid grid-cols-1 gap-3">
              {documentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedType === type.value
                      ? "border-[#0D9488] bg-[#0D9488]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <type.icon className={`w-5 h-5 mt-0.5 ${selectedType === type.value ? "text-[#0D9488]" : "text-gray-400"}`} />
                  <div className="text-left flex-1">
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{type.description}</div>
                  </div>
                  {selectedType === type.value && (
                    <CheckCircle className="w-5 h-5 text-[#0D9488]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Upload du document</h3>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-[#0D9488] bg-[#0D9488]/5"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Glissez-déposez votre document ici
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    ou cliquez pour parcourir
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] cursor-pointer transition-colors"
                >
                  Sélectionner un fichier
                </label>
                <p className="text-xs text-gray-400">
                  JPG, PNG ou PDF • Max 10 Mo
                </p>
              </div>
            </div>

            {file && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-sm">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} Ko
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-800">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className={`mt-4 w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                file && !uploading
                  ? "bg-[#0D9488] text-white hover:bg-[#0B7C74]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Extraction en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  Lancer l'extraction OCR
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Zone de résultats */}
        <div className="space-y-6">
          {result ? (
            <>
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Données extraites</h3>
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>{(result.confidence * 100).toFixed(0)}% confiance</span>
                  </div>
                </div>
                {renderExtractedData()}
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] transition-colors font-medium">
                    Créer une écriture comptable
                  </button>
                  <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Exporter en JSON
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                En attente d'extraction
              </h3>
              <p className="text-sm text-gray-500">
                Sélectionnez un document et lancez l'extraction pour voir les résultats ici
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
