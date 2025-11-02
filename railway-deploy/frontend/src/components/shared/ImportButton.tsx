"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

type ImportButtonProps = {
  onImport: (file: File) => void;
  accept?: string;
  label?: string;
};

export function ImportButton({ onImport, accept = ".csv,.xlsx", label = "Importer" }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImport(file);
  };

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        <Upload className="w-4 h-4" />
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
