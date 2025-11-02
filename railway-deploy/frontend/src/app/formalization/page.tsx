"use client";
import { useEffect, useState } from "react";
import { CheckCircle, Circle, XCircle, Clock, FileText, Upload, AlertTriangle } from "lucide-react";
import { apiGet, apiPost, apiPatch, getCompanyId, apiDelete } from "@/lib/api";
import { FileUpload } from "@/components/upload/FileUpload";

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-slate-100 text-slate-700", icon: Clock },
  under_review: { label: "En cours d'examen", color: "bg-blue-100 text-blue-700", icon: Clock },
  approved: { label: "Approuvée", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Rejetée", color: "bg-red-100 text-red-700", icon: XCircle },
};

const REQUIRED_DOCUMENTS = [
  { key: "identityCard", label: "Carte d'identité nationale (CNI)", required: true },
  { key: "proofOfAddress", label: "Justificatif de domicile", required: true },
  { key: "businessLicense", label: "Licence commerciale", required: false },
  { key: "statutes", label: "Statuts de l'entreprise", required: false },
  { key: "taxCertificate", label: "Certificat fiscal (si existant)", required: false },
];

export default function FormalizationPage() {
  const [loading, setLoading] = useState(false);
  const [nifRequest, setNifRequest] = useState<any>(null);
  const [toast, setToast] = useState<{type:'success'|'error', text:string}|null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Commerce",
    address: "",
    city: "",
    phone: "",
    email: "",
  });

  function extractUploadId(url: string): string | null {
    if (!url) return null;
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    } catch { return null; }
  }

  async function handleDeleteDocument(docKey: string) {
    try {
      if (!nifRequest) return;
      const url = nifRequest.documents?.[docKey];
      const uploadId = extractUploadId(url);
      if (uploadId) {
        await apiDelete(`/api/v1/uploads/${uploadId}`);
      }
      await apiPatch(`/api/v1/nif/request/${nifRequest.id}/document`, { key: docKey, url: '' });
      await refresh();
      showSuccess('Document supprimé');
    } catch (e: any) {
      showError(String(e));
    }
  }

  function showSuccess(text: string){ setToast({ type:'success', text }); setTimeout(()=>setToast(null), 2500); }
  function showError(text: string){ setToast({ type:'error', text }); setTimeout(()=>setToast(null), 3500); }

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const requests = await apiGet('/api/v1/nif/my-requests') as any[];
      if (requests && requests.length > 0) {
        setNifRequest(requests[0]); // Prendre la demande la plus récente
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRequest() {
    try {
      const cid = getCompanyId();
      if (!cid) {
        showError("Aucune société sélectionnée");
        return;
      }

      const body = {
        companyId: cid,
        businessName: formData.businessName,
        businessType: formData.businessType,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        documents: {}, // À compléter avec upload
      };

      await apiPost('/api/v1/nif/request', body);
      showSuccess("Demande de NIF créée avec succès");
      setShowForm(false);
      await refresh();
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  async function handleSubmit() {
    try {
      if (!nifRequest?.id) return;
      await apiPatch(`/api/v1/nif/request/${nifRequest.id}/submit`, {});
      showSuccess("Demande soumise à la DGI");
      await refresh();
    } catch (e: unknown) {
      showError(String(e));
    }
  }

  const documentsUploaded = nifRequest?.documents ? Object.keys(nifRequest.documents).length : 0;
  const documentsRequired = REQUIRED_DOCUMENTS.filter(d => d.required).length;
  const canSubmit = documentsUploaded >= documentsRequired && nifRequest?.status === 'pending';

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-16 right-6 z-50 rounded-md px-4 py-2 text-sm shadow-lg ${toast.type==='success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Formalisation & NIF</h1>
          <p className="text-sm text-slate-600 mt-1">Obtenez votre Numéro d'Identification Fiscale (NIF)</p>
        </div>
        {!nifRequest && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E]"
          >
            Nouvelle demande
          </button>
        )}
      </div>

      {loading && <div className="text-sm text-slate-500">Chargement...</div>}

      {!loading && !nifRequest && !showForm && (
        <div className="card p-8 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune demande de NIF</h3>
          <p className="text-sm text-slate-600 mb-4">
            Formalisez votre activité et obtenez votre NIF pour accéder à tous les services BMS
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E]"
          >
            Démarrer ma demande
          </button>
        </div>
      )}

      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Nouvelle demande de NIF</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'entreprise *</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
                  placeholder="Ex: Boutique Benin Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type d'activité *</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                  className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
                >
                  <option value="Commerce">Commerce</option>
                  <option value="Artisanat">Artisanat</option>
                  <option value="Services">Services</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Industrie">Industrie</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Adresse *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
                placeholder="Rue, quartier"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ville *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
                  placeholder="Cotonou"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
                  placeholder="+229 97 00 00 01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-app-border rounded-md px-3 py-2 text-slate-700"
                  placeholder="contact@entreprise.bj"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={handleCreateRequest}
                className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E]"
              >
                Créer la demande
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md bg-white text-slate-700 border border-app-border text-sm px-4 py-2 hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {nifRequest && (
        <>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Statut de votre demande</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[nifRequest.status as keyof typeof STATUS_CONFIG].color}`}>
                {STATUS_CONFIG[nifRequest.status as keyof typeof STATUS_CONFIG].label}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Entreprise</div>
                <div className="font-medium">{nifRequest.businessName}</div>
              </div>
              <div>
                <div className="text-slate-600">Type d'activité</div>
                <div className="font-medium">{nifRequest.businessType}</div>
              </div>
              <div>
                <div className="text-slate-600">Ville</div>
                <div className="font-medium">{nifRequest.city}</div>
              </div>
              <div>
                <div className="text-slate-600">Date de création</div>
                <div className="font-medium">{new Date(nifRequest.createdAt).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>

            {nifRequest.status === 'approved' && nifRequest.nifNumber && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 text-green-800 font-semibold mb-1">
                  <CheckCircle className="h-5 w-5" />
                  NIF approuvé
                </div>
                <div className="text-2xl font-mono font-bold text-green-900">{nifRequest.nifNumber}</div>
              </div>
            )}

            {nifRequest.status === 'rejected' && nifRequest.rejectionReason && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-800 font-semibold mb-1">
                  <XCircle className="h-5 w-5" />
                  Demande rejetée
                </div>
                <div className="text-sm text-red-700">{nifRequest.rejectionReason}</div>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Documents requis</h3>
            <div className="space-y-3">
              {REQUIRED_DOCUMENTS.map((doc) => {
                const uploaded = nifRequest.documents && nifRequest.documents[doc.key];
                return (
                  <div key={doc.key} className="flex items-center justify-between p-3 border border-app-border rounded-md">
                    <div className="flex items-center gap-3">
                      {uploaded ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          {doc.label}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                        </div>
                        {uploaded && (
                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <a href={uploaded} target="_blank" rel="noreferrer" className="text-app-primary hover:underline">Ouvrir</a>
                            <button onClick={()=> handleDeleteDocument(doc.key)} className="text-rose-700 hover:underline">Supprimer</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {!uploaded && (
                      <div className="w-60">
                        <FileUpload
                          label={`Ajouter ${doc.label}`}
                          accept="image/*,application/pdf"
                          maxSize={10}
                          entityType="nif_request"
                          entityId={nifRequest?.id}
                          companyId={typeof window !== 'undefined' ? (window.localStorage.getItem('companyId')||undefined) as any : undefined}
                          onUploadSuccess={async (u:any)=>{
                            try {
                              await apiPatch(`/api/v1/nif/request/${nifRequest.id}/document`, { key: doc.key, url: u.publicUrl });
                              await refresh();
                            } catch (e) { console.error(e); }
                          }}
                          onUploadError={(err)=> console.error(err)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {nifRequest.status === 'pending' && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  {documentsUploaded < documentsRequired ? (
                    <span>Téléchargez tous les documents obligatoires avant de soumettre votre demande.</span>
                  ) : (
                    <span>Tous les documents sont prêts. Vous pouvez soumettre votre demande à la DGI.</span>
                  )}
                </div>
              </div>
            )}

            {canSubmit && (
              <div className="mt-4">
                <button
                  onClick={handleSubmit}
                  className="rounded-md bg-app-primary text-white text-sm px-4 py-2 hover:bg-[#0F766E]"
                >
                  Soumettre à la DGI
                </button>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="w-0.5 h-full bg-slate-200 flex-1"></div>
                </div>
                <div className="pb-8">
                  <div className="font-medium text-slate-700">Demande créée</div>
                  <div className="text-sm text-slate-500">{new Date(nifRequest.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>

              {nifRequest.submittedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    {(nifRequest.status === 'under_review' || nifRequest.status === 'approved' || nifRequest.status === 'rejected') && (
                      <div className="w-0.5 h-full bg-slate-200 flex-1"></div>
                    )}
                  </div>
                  <div className="pb-8">
                    <div className="font-medium text-slate-700">Soumise à la DGI</div>
                    <div className="text-sm text-slate-500">{new Date(nifRequest.submittedAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              )}

              {nifRequest.approvedAt && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700">Approuvée</div>
                    <div className="text-sm text-slate-500">{new Date(nifRequest.approvedAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
