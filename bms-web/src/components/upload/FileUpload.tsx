"use client";
import { useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from "lucide-react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // en MB
  onUploadSuccess?: (upload: any) => void;
  onUploadError?: (error: string) => void;
  entityType?: string;
  entityId?: string;
  companyId?: string;
  existingFile?: {
    id: string;
    fileName: string;
    originalName: string;
    mimeType: string;
    publicUrl: string;
  };
}

export function FileUpload({
  label = "Sélectionner un fichier",
  accept = "image/*,application/pdf",
  maxSize = 10,
  onUploadSuccess,
  onUploadError,
  entityType,
  entityId,
  companyId,
  existingFile,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState(existingFile || null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation taille
    if (selectedFile.size > maxSize * 1024 * 1024) {
      onUploadError?.(`Fichier trop volumineux (max ${maxSize}MB)`);
      return;
    }

    setFile(selectedFile);

    // Prévisualisation pour les images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }

    // Upload automatique
    await uploadFile(selectedFile);
  }

  async function uploadFile(fileToUpload: File) {
    setUploading(true);

    try {
      const token = typeof window !== 'undefined' 
        ? window.localStorage.getItem('bms_token') 
        : null;

      const formData = new FormData();
      formData.append('file', fileToUpload);

      let url = `http://localhost:3001/api/v1/uploads?`;
      if (entityType) url += `entityType=${entityType}&`;
      if (entityId) url += `entityId=${entityId}&`;
      if (companyId) url += `companyId=${companyId}&`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Erreur upload: ${res.status}`);
      }

      const data = await res.json();
      setUploadedFile(data);
      onUploadSuccess?.(data);
    } catch (e) {
      onUploadError?.(String(e));
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setUploadedFile(null);
  }

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-md">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-green-900 truncate">
            {uploadedFile.originalName}
          </div>
          <div className="text-xs text-green-700">
            Téléchargé avec succès
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-green-700 hover:text-green-900"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <div className="flex items-center justify-center w-full p-6 border-2 border-dashed border-app-border rounded-md hover:border-app-primary transition-colors cursor-pointer">
          <div className="text-center">
            {uploading ? (
              <div className="text-sm text-slate-600">Upload en cours...</div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm text-slate-600">{label}</div>
                <div className="text-xs text-slate-500 mt-1">
                  JPG, PNG, PDF (max {maxSize}MB)
                </div>
              </>
            )}
          </div>
        </div>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </label>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Prévisualisation"
            className="w-full h-48 object-cover rounded-md border border-app-border"
          />
          {!uploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-slate-50"
              type="button"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          )}
        </div>
      )}

      {file && !preview && (
        <div className="flex items-center gap-3 p-3 border border-app-border rounded-md">
          {file.type === 'application/pdf' ? (
            <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-700 truncate">
              {file.name}
            </div>
            <div className="text-xs text-slate-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          {!uploading && (
            <button
              onClick={handleRemove}
              className="text-slate-400 hover:text-slate-600"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
