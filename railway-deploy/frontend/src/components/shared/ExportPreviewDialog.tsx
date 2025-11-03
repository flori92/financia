"use client";

import { useState } from "react";
import { X, Download, Eye, FileText, FileSpreadsheet, Printer } from "lucide-react";

type ExportFormat = 'pdf' | 'excel' | 'csv';

type ExportPreviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  title: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    format?: (value: any) => string;
  }[];
  summary?: {
    label: string;
    value: string | number;
  }[];
};

export function ExportPreviewDialog({
  isOpen,
  onClose,
  onExport,
  title,
  data,
  columns,
  summary
}: ExportPreviewDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(selectedFormat);
    onClose();
  };

  const formatValue = (value: any, column: typeof columns[0]) => {
    if (column.format) {
      return column.format(value);
    }
    if (typeof value === 'number') {
      return value.toLocaleString('fr-FR');
    }
    if (value instanceof Date) {
      return value.toLocaleDateString('fr-FR');
    }
    return value?.toString() || '-';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-[#0D9488]" />
            <div>
              <h2 className="text-xl font-bold">Prévisualisation avant export</h2>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="p-6 border-b bg-gray-50">
          <label className="block text-sm font-medium mb-3">Format d'export</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedFormat('pdf')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormat === 'pdf'
                  ? 'border-[#0D9488] bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileText className={`w-8 h-8 mx-auto mb-2 ${
                selectedFormat === 'pdf' ? 'text-[#0D9488]' : 'text-gray-400'
              }`} />
              <div className="text-center">
                <div className="font-semibold">PDF</div>
                <div className="text-xs text-gray-600">Impression & Partage</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat('excel')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormat === 'excel'
                  ? 'border-[#0D9488] bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${
                selectedFormat === 'excel' ? 'text-[#0D9488]' : 'text-gray-400'
              }`} />
              <div className="text-center">
                <div className="font-semibold">Excel</div>
                <div className="text-xs text-gray-600">Analyse approfondie</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedFormat('csv')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedFormat === 'csv'
                  ? 'border-[#0D9488] bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <FileSpreadsheet className={`w-8 h-8 mx-auto mb-2 ${
                selectedFormat === 'csv' ? 'text-[#0D9488]' : 'text-gray-400'
              }`} />
              <div className="text-center">
                <div className="font-semibold">CSV</div>
                <div className="text-xs text-gray-600">Import autres logiciels</div>
              </div>
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="border rounded-lg overflow-hidden">
            {/* Summary Cards */}
            {summary && summary.length > 0 && (
              <div className="bg-blue-50 p-4 border-b">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {summary.map((item, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                      <div className="text-lg font-bold text-[#0D9488]">
                        {typeof item.value === 'number' 
                          ? item.value.toLocaleString('fr-FR')
                          : item.value
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table Preview */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    {columns.map((column, idx) => (
                      <th 
                        key={idx} 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.slice(0, 20).map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      {columns.map((column, colIdx) => (
                        <td 
                          key={colIdx} 
                          className="px-4 py-3 text-sm"
                        >
                          {formatValue(row[column.key], column)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.length > 20 && (
              <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-600">
                📊 Affichage de 20 lignes sur {data.length} total
                <br />
                <span className="text-xs">L'export complet inclura toutes les données</span>
              </div>
            )}

            {data.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Aucune donnée à prévisualiser</p>
              </div>
            )}
          </div>

          {/* Export Info */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">ℹ️ Informations sur l'export</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>{data.length}</strong> ligne(s) de données</li>
              <li>• <strong>{columns.length}</strong> colonne(s)</li>
              <li>• Format: <strong>{selectedFormat.toUpperCase()}</strong></li>
              <li>• Date d'export: <strong>{new Date().toLocaleDateString('fr-FR')}</strong></li>
              {selectedFormat === 'pdf' && (
                <li className="text-blue-600">• Optimisé pour l'impression A4 paysage</li>
              )}
              {selectedFormat === 'excel' && (
                <li className="text-green-600">• Inclut formules et formatage avancé</li>
              )}
              {selectedFormat === 'csv' && (
                <li className="text-purple-600">• Compatible avec tous les tableurs</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {data.length > 0 ? (
              <span>✅ Prêt à exporter {data.length} ligne(s)</span>
            ) : (
              <span className="text-red-600">⚠️ Aucune donnée à exporter</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              disabled={data.length === 0}
              className="px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0B7C74] disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter en {selectedFormat.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
