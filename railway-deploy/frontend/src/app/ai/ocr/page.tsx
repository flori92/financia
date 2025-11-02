"use client";

import { useState } from "react";
import { Upload, FileText, Receipt, Building2, CheckCircle, AlertCircle, Camera, Download, Sparkles, Info, PenTool } from "lucide-react";
import { formatCurrency, detectCurrency, type CurrencyCode } from "@/lib/currency";
import { CurrencyBadge } from "@/components/ui/currency-badge";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());

  // Helper pour formater les montants selon la devise
  const formatAmount = (amount: number, currency?: string): string => {
    const currencyCode = (currency || result?.data?.currency || 'XOF') as CurrencyCode;
    return formatCurrency(amount, currencyCode);
  };

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/ai/ocr/${selectedType}`, {
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
      
      // Initialiser les données éditables
      setEditedData(JSON.parse(JSON.stringify(data)));
      setIsEditing(false);
      setModifiedFields(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedData(JSON.parse(JSON.stringify(result?.data)));
    setModifiedFields(new Set());
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (result && editedData) {
      setResult({
        ...result,
        data: editedData,
      });
      setIsEditing(false);
      setModifiedFields(new Set());
    }
  };

  const handleFieldChange = (fieldPath: string, value: any) => {
    if (!editedData) return;

    const newEditedData = { ...editedData };
    const paths = fieldPath.split('.');
    let current: any = newEditedData;

    for (let i = 0; i < paths.length - 1; i++) {
      current = current[paths[i]];
    }
    
    current[paths[paths.length - 1]] = value;
    
    setEditedData(newEditedData);
    setModifiedFields(new Set([...modifiedFields, fieldPath]));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    if (!editedData || !editedData.items) return;

    const newItems = [...editedData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    setEditedData({ ...editedData, items: newItems });
    setModifiedFields(new Set([...modifiedFields, `items.${index}.${field}`]));
  };

  const renderEditableField = (label: string, fieldPath: string, value: any, type: string = "text") => {
    const isModified = modifiedFields.has(fieldPath);
    const displayValue = isEditing ? editedData : result?.data;
    const paths = fieldPath.split('.');
    let currentValue = displayValue;
    for (const path of paths) {
      currentValue = currentValue?.[path];
    }

    if (isEditing) {
      return (
        <div>
          <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
            {label}
            {isModified && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Modifié</span>}
          </label>
          <input
            type={type}
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(fieldPath, type === "number" ? parseFloat(e.target.value) : e.target.value)}
            className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488] ${
              isModified ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
            }`}
          />
        </div>
      );
    }

    return (
      <div>
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <div className="mt-1 text-lg font-semibold">{type === "number" ? formatAmount(currentValue) : currentValue}</div>
      </div>
    );
  };

  const renderExtractedData = () => {
    if (!result) return null;

    const { data, confidence } = result;
    const displayData = isEditing ? editedData : data;

    if (selectedType === "invoice") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {renderEditableField("N° Facture", "invoiceNumber", displayData.invoiceNumber)}
            <div>
              <label className="text-sm font-medium text-gray-600">Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedData.date || ''}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488] ${
                    modifiedFields.has('date') ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                  }`}
                />
              ) : (
                <div className="mt-1 text-lg font-semibold">{new Date(displayData.date).toLocaleDateString("fr-FR")}</div>
              )}
            </div>
            {renderEditableField("Fournisseur", "supplierName", displayData.supplierName)}
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                Montant TTC
                {modifiedFields.has('total') && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Modifié</span>}
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editedData.total || ''}
                  onChange={(e) => handleFieldChange('total', parseFloat(e.target.value))}
                  className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0D9488] ${
                    modifiedFields.has('total') ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                  }`}
                />
              ) : (
                <div className="mt-1 text-lg font-semibold text-[#0D9488]">
                  {formatAmount(displayData.total)}
                </div>
              )}
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
                {displayData.items?.map((item: any, idx: number) => (
                  <tr key={idx} className={`border-b ${modifiedFields.has(`items.${idx}`) ? 'bg-amber-50' : ''}`}>
                    <td className="py-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.items[idx].description || ''}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      ) : item.description}
                    </td>
                    <td className="text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedData.items[idx].quantity || ''}
                          onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                          className="w-20 px-2 py-1 border rounded text-right"
                        />
                      ) : item.quantity}
                    </td>
                    <td className="text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editedData.items[idx].unitPrice || ''}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                          className="w-28 px-2 py-1 border rounded text-right"
                        />
                      ) : `${formatAmount(item.unitPrice, displayData.currency)}`}
                    </td>
                    <td className="text-right font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editedData.items[idx].total || ''}
                          onChange={(e) => handleItemChange(idx, 'total', parseFloat(e.target.value))}
                          className="w-32 px-2 py-1 border rounded text-right"
                        />
                      ) : `${formatAmount(item.total, displayData.currency)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm items-center">
              <span>Sous-total HT</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editedData.subtotal || ''}
                  onChange={(e) => handleFieldChange('subtotal', parseFloat(e.target.value))}
                  className={`w-40 px-3 py-1 border rounded text-right ${
                    modifiedFields.has('subtotal') ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                  }`}
                />
              ) : (
                <span>{formatAmount(displayData.subtotal)}</span>
              )}
            </div>
            <div className="flex justify-between text-sm items-center">
              <span>TVA</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editedData.vatAmount || ''}
                  onChange={(e) => handleFieldChange('vatAmount', parseFloat(e.target.value))}
                  className={`w-40 px-3 py-1 border rounded text-right ${
                    modifiedFields.has('vatAmount') ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                  }`}
                />
              ) : (
                <span>{formatAmount(displayData.vatAmount)}</span>
              )}
            </div>
            <div className="flex justify-between text-lg font-bold items-center">
              <span>Total TTC</span>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  value={editedData.total || ''}
                  onChange={(e) => handleFieldChange('total', parseFloat(e.target.value))}
                  className={`w-40 px-3 py-1 border rounded text-right font-bold ${
                    modifiedFields.has('total') ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
                  }`}
                />
              ) : (
                <span className="text-[#0D9488]">{formatAmount(displayData.total)}</span>
              )}
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
                <span className="font-medium">{formatAmount(item.amount, data.currency)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatAmount(data.subtotal, data.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxe</span>
              <span>{formatAmount(data.tax, data.currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-[#0D9488]">{formatAmount(data.total, data.currency)}</span>
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
                    {formatAmount(transaction.amount, 'XOF')}
                  </td>
                  <td className="text-right">{formatAmount(transaction.balance, 'XOF')}</td>
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
                  <div className="flex items-center gap-2">
                    <CurrencyBadge currency={(result.data.currency || 'XOF') as CurrencyCode} />
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>{(result.confidence * 100).toFixed(0)}% confiance</span>
                    </div>
                  </div>
                </div>
                {renderExtractedData()}
              </div>

              <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold mb-4">Actions</h3>
                <div className="space-y-3">
                  {isEditing ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-amber-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Mode édition activé</span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          {modifiedFields.size} champ(s) modifié(s)
                        </p>
                      </div>
                      <button 
                        onClick={handleSaveEdit}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Sauvegarder les modifications
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleEdit}
                        className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <PenTool className="w-4 h-4" />
                        Modifier les données
                      </button>
                      <button className="w-full px-4 py-3 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] transition-colors font-medium">
                        Créer une écriture comptable
                      </button>
                      <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Exporter en JSON
                      </button>
                    </>
                  )}
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
