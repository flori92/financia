"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileCheck,
  Download,
  Calendar,
  User,
  Building2,
  FileText,
  Plus,
  Eye,
  Loader2,
  Send,
  Check,
} from "lucide-react";
import { apiGet, apiPost, getBaseUrl } from "@/lib/api";
import { useEffectiveCompanyId } from "@/hooks/useCompanyId";

type HrCertificateStatus = "pending" | "generated" | "delivered";

type HrCertificateType =
  | "attestation_emploi"
  | "attestation_salaire"
  | "certificat_travail"
  | "autre";

type Certificate = {
  id: string;
  companyId: string;
  employeeId: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    position?: string;
    department?: string;
  } | null;
  type: HrCertificateType;
  status: HrCertificateStatus;
  requestDate?: string;
  generatedAt?: string;
  deliveredAt?: string;
  purpose?: string;
  notes?: string;
  pdfFileName?: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
};

const CERTIFICATE_TYPES: Record<HrCertificateType, string> = {
  attestation_emploi: "Attestation d'emploi",
  attestation_salaire: "Attestation de salaire",
  certificat_travail: "Certificat de travail",
  autre: "Attestation",
};

const STATUS_META: Record<HrCertificateStatus, { label: string; badge: string }> = {
  pending: { label: "En attente", badge: "bg-yellow-100 text-yellow-800" },
  generated: { label: "Généré", badge: "bg-blue-100 text-blue-800" },
  delivered: { label: "Délivré", badge: "bg-green-100 text-green-800" },
};

const DEFAULT_ISSUED_BY = "Service RH";

function formatDate(value?: string | Date) {
  if (!value) return "―";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "―";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getAuthToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.localStorage.getItem("bms_token") ||
    window.localStorage.getItem("token") ||
    undefined
  );
}

export default function CertificatesPage() {
  const companyId = useEffectiveCompanyId();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "",
    type: "attestation_emploi" as HrCertificateType,
    purpose: "",
    notes: "",
  });

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const updateCertificateState = useCallback((updated: Certificate, options?: { prepend?: boolean }) => {
    setCertificates((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === updated.id);
      if (existingIndex === -1) {
        return options?.prepend ? [updated, ...prev] : [...prev, updated];
      }
      const next = [...prev];
      next[existingIndex] = updated;
      return next;
    });
    setSelectedCertificate((prev) => (prev?.id === updated.id ? updated : prev));
  }, []);

  const refreshCertificate = useCallback(
    async (certificateId: string, options?: { prepend?: boolean }) => {
      if (!companyId) {
        return null;
      }
      try {
        const detailed = await apiGet(`/api/v1/hr/certificates/${certificateId}`, { companyId });
        updateCertificateState(detailed, options);
        return detailed as Certificate;
      } catch (err) {
        console.error("Erreur lors du rafraîchissement de l'attestation", err);
        return null;
      }
    },
    [companyId, updateCertificateState],
  );

  const loadInitialData = useCallback(
    async (currentCompanyId: string) => {
      setLoading(true);
      setError(null);
      try {
        const [certs, emps] = await Promise.all([
          apiGet("/api/v1/hr/certificates", { companyId: currentCompanyId }),
          apiGet("/api/v1/hr/employees", { companyId: currentCompanyId }),
        ]);

        setCertificates(Array.isArray(certs) ? (certs as Certificate[]) : []);
        setEmployees(Array.isArray(emps) ? (emps as Employee[]) : []);
      } catch (err: any) {
        console.error("Erreur de chargement des attestations", err);
        setCertificates([]);
        setEmployees([]);
        setError(err?.message || "Impossible de charger les attestations");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      setError("Aucune société sélectionnée. Veuillez choisir une société depuis la barre supérieure.");
      setCertificates([]);
      setEmployees([]);
      return;
    }

    loadInitialData(companyId);
  }, [companyId, loadInitialData]);

  const stats = useMemo(() => {
    return certificates.reduce(
      (acc, certificate) => {
        acc.total += 1;
        acc.byStatus[certificate.status] += 1;
        return acc;
      },
      {
        total: 0,
        byStatus: {
          pending: 0,
          generated: 0,
          delivered: 0,
        } as Record<HrCertificateStatus, number>,
      },
    );
  }, [certificates]);

  const triggerToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  const resetForm = () => {
    setFormData({ employeeId: "", type: "attestation_emploi", purpose: "", notes: "" });
  };

  const handleCreateRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!companyId) {
      triggerToast("error", "Aucune société n'est sélectionnée");
      return;
    }
    if (!formData.employeeId) {
      triggerToast("error", "Veuillez sélectionner un employé");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        companyId,
        employeeId: formData.employeeId,
        type: formData.type,
        purpose: formData.purpose || undefined,
        notes: formData.notes || undefined,
      };

      const created = (await apiPost("/api/v1/hr/certificates", payload)) as Certificate;
      const detailed = await refreshCertificate(created.id, { prepend: true });
      if (!detailed) {
        updateCertificateState(created, { prepend: true });
      }
      triggerToast("success", "Demande d'attestation créée");
      setShowNewRequest(false);
      resetForm();
    } catch (err: any) {
      console.error("Erreur création attestation", err);
      triggerToast("error", err?.message || "Impossible de créer la demande");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateCertificate = async (certificate: Certificate) => {
    if (!companyId) return;
    try {
      setActionLoadingId(certificate.id);
      await apiPost(`/api/v1/hr/certificates/${certificate.id}/generate`, {
        companyId,
        issuedBy: DEFAULT_ISSUED_BY,
      });
      await refreshCertificate(certificate.id);
      triggerToast("success", "Attestation générée");
    } catch (err: any) {
      console.error("Erreur génération attestation", err);
      triggerToast("error", err?.message || "Génération impossible");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkDelivered = async (certificate: Certificate) => {
    if (!companyId) return;
    try {
      setActionLoadingId(certificate.id);
      await apiPost(`/api/v1/hr/certificates/${certificate.id}/deliver`, { companyId });
      await refreshCertificate(certificate.id);
      triggerToast("success", "Attestation marquée comme délivrée");
    } catch (err: any) {
      console.error("Erreur marquage attestation", err);
      triggerToast("error", err?.message || "Impossible de marquer comme délivrée");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    if (!companyId) return;
    const token = getAuthToken();
    const base = getBaseUrl().replace(/\/$/, "");

    try {
      setActionLoadingId(certificate.id);
      const res = await fetch(
        `${base}/api/v1/hr/certificates/${certificate.id}/download?companyId=${companyId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/pdf",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (!res.ok) {
        throw new Error(`Téléchargement impossible (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = certificate.pdfFileName || `attestation-${certificate.id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      triggerToast("success", "Téléchargement démarré");
    } catch (err: any) {
      console.error("Erreur téléchargement attestation", err);
      triggerToast("error", err?.message || "Impossible de télécharger l'attestation");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span>Chargement des attestations…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm shadow ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attestations employeur</h1>
          <p className="text-sm text-slate-600">
            Créez, générez et délivrez des attestations en temps réel pour vos collaborateurs.
          </p>
        </div>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle demande
        </Button>
      </div>

      {error && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-4 text-sm text-rose-700">
            {error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-amber-600">{stats.byStatus.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Délivrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-emerald-600">{stats.byStatus.delivered}</div>
          </CardContent>
        </Card>
      </div>

      {selectedCertificate && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Détails de l'attestation</CardTitle>
              <p className="text-sm text-slate-500">{selectedCertificate.id}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setSelectedCertificate(null)}>
              Fermer
            </Button>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-teal-600" />
              <span>{CERTIFICATE_TYPES[selectedCertificate.type]}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              <span>
                {selectedCertificate.employee
                  ? `${selectedCertificate.employee.firstName} ${selectedCertificate.employee.lastName}`
                  : "Employé inconnu"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Demandée le {formatDate(selectedCertificate.requestDate)}</span>
            </div>
            {selectedCertificate.generatedAt && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <span>Générée le {formatDate(selectedCertificate.generatedAt)}</span>
              </div>
            )}
            {selectedCertificate.deliveredAt && (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-slate-500" />
                <span>Délivrée le {formatDate(selectedCertificate.deliveredAt)}</span>
              </div>
            )}
            {selectedCertificate.purpose && (
              <p className="italic text-slate-600">Objet : {selectedCertificate.purpose}</p>
            )}
            {selectedCertificate.notes && <p className="text-slate-600">Notes : {selectedCertificate.notes}</p>}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {certificates.map((certificate) => {
          const employeeName = certificate.employee
            ? `${certificate.employee.firstName} ${certificate.employee.lastName}`
            : "Employé inconnu";
          const statusMeta = STATUS_META[certificate.status];
          const isLoading = actionLoadingId === certificate.id;

          return (
            <Card key={certificate.id} className="border-slate-200">
              <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <FileCheck className="h-5 w-5 text-teal-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      {CERTIFICATE_TYPES[certificate.type]}
                    </h3>
                    <Badge className={statusMeta.badge}>{statusMeta.label}</Badge>
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span>{employeeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Demandé le {formatDate(certificate.requestDate)}</span>
                    </div>
                    {certificate.purpose && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <span className="italic">{certificate.purpose}</span>
                      </div>
                    )}
                    {certificate.generatedAt && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-500" />
                        <span>Généré le {formatDate(certificate.generatedAt)}</span>
                      </div>
                    )}
                    {certificate.deliveredAt && (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-slate-500" />
                        <span>Délivré le {formatDate(certificate.deliveredAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-2 md:w-56">
                  {certificate.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleGenerateCertificate(certificate)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                      Générer le PDF
                    </Button>
                  )}
                  {(certificate.status === "generated" || certificate.status === "delivered") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadCertificate(certificate)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Télécharger
                    </Button>
                  )}
                  {certificate.status === "generated" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkDelivered(certificate)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Marquer délivrée
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setSelectedCertificate(certificate)}>
                    <Eye className="mr-2 h-4 w-4" /> Voir les détails
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {certificates.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-slate-500">
              <FileCheck className="h-12 w-12 text-slate-400" />
              <p>Aucune demande d'attestation pour le moment.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {showNewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Nouvelle demande d'attestation</h2>
                <p className="text-sm text-slate-500">
                  Sélectionnez l'employé concerné et précisez l'objet de la demande.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowNewRequest(false)}>
                Fermer
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateRequest}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Employé</label>
                <select
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                  value={formData.employeeId}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, employeeId: event.target.value }))
                  }
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                      {employee.position ? ` • ${employee.position}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Type d'attestation</label>
                <select
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, type: event.target.value as HrCertificateType }))
                  }
                >
                  {Object.entries(CERTIFICATE_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Objet de la demande</label>
                <Input
                  placeholder="Ex : Demande de visa, dossier bancaire..."
                  value={formData.purpose}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, purpose: event.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Notes complémentaires</label>
                <Textarea
                  rows={4}
                  placeholder="Informations additionnelles à faire figurer sur l'attestation"
                  value={formData.notes}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, notes: event.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowNewRequest(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Soumettre la demande
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
