"use client";

import { Download } from "lucide-react";

type ExportButtonProps = {
  onExport: () => void;
  label?: string;
};

export function ExportButton({ onExport, label = "Exporter" }: ExportButtonProps) {
  return (
    <button
      onClick={onExport}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
    >
      <Download className="w-4 h-4" />
      {label}
    </button>
  );
}
