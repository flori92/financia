"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Download, Calendar, User, Building2, FileText, Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Certificate = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "attestation_emploi" | "attestation_salaire" | "certificat_travail" | "autre";
  requestDate: string;
  generatedDate?: string;
  status: "pending" | "generated" | "delivered";
  purpose?: string;
  notes?: string;
};

const CERTIFICATE_TYPES = {
  attestation_emploi: "Attestation d'emploi",
  attestation_salaire: "Attestation de salaire",
  certificat_travail: "Certificat de travail",
  autre: "Autre"
};

const mockCertificates: Certificate[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'Jean Dupont',
    type: 'attestation_emploi',
    requestDate: '2025-11-01',
    generatedDate: '2025-11-02',
    status: 'delivered',
    purpose: 'Demande de visa'
  },
  {
    id: '2',
    employeeId: 'emp2',
    employeeName: 'Marie Martin',
    type: 'attestation_salaire',
    requestDate: '2025-11-10',
    status: 'pending',
    purpose: 'Demande de prêt bancaire'
  },
  {
    id: '3',
    employeeId: 'emp3',
    employeeName: 'Pierre Durand',
    type: 'certificat_travail',
    requestDate: '2025-11-05',
    generatedDate: '2025-11-06',
    status: 'generated',
    purpose: 'Fin de contrat'
  }
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      // Simulation API
      await new Promise(resolve => setTimeout(resolve, 500));
      setCertificates(mockCertificates);
    } catch (error) {
      console.error("Erreur lors du chargement des attestations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "generated": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "generated": return "Généré";
      case "delivered": return "Délivré";
      default: return status;
    }
  };

  const handleGenerateCertificate = (id: string) => {
    setCertificates(certificates.map(cert =>
      cert.id === id ? {
        ...cert,
        status: 'generated',
        generatedDate: new Date().toISOString().split('T')[0]
      } : cert
    ));
    alert('Attestation générée avec succès !');
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    alert(`Téléchargement de ${CERTIFICATE_TYPES[certificate.type]} pour ${certificate.employeeName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileCheck className="w-8 h-8 mx-auto text-teal-600 mb-2 animate-pulse" />
          <p>Chargement des attestations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attestations Employeur</h1>
        <Button onClick={() => setShowNewRequest(true)}>
          <Plus className="w-4 h-4 mr-2" />Nouvelle demande
        </Button>
      </div>

      {/* Modal Nouvelle demande */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nouvelle demande d'attestation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type d'attestation</label>
                <select className="w-full p-2 border rounded">
                  <option value="">Sélectionner un type</option>
                  <option value="attestation_emploi">Attestation d'emploi</option>
                  <option value="attestation_salaire">Attestation de salaire</option>
                  <option value="certificat_travail">Certificat de travail</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Objet de la demande</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Ex: Demande de visa, prêt bancaire, etc."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                  Annuler
                </Button>
                <Button onClick={() => {
                  setShowNewRequest(false);
                  alert('Demande d\'attestation créée avec succès !');
                }}>
                  Soumettre la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {certificates.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Délivrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {certificates.filter(c => c.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des attestations */}
      <div className="space-y-4">
        {certificates.map(certificate => (
          <Card key={certificate.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileCheck className="w-5 h-5 text-teal-600" />
                    <h3 className="font-medium text-lg">{CERTIFICATE_TYPES[certificate.type]}</h3>
                    <Badge className={getStatusColor(certificate.status)}>
                      {getStatusLabel(certificate.status)}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{certificate.employeeName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Demandé le {format(new Date(certificate.requestDate), 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                    {certificate.generatedDate && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Généré le {format(new Date(certificate.generatedDate), 'dd MMMM yyyy', { locale: fr })}</span>
                      </div>
                    )}
                    {certificate.purpose && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="italic">{certificate.purpose}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {certificate.status === 'pending' && (
                    <Button size="sm" onClick={() => handleGenerateCertificate(certificate.id)}>
                      Générer
                    </Button>
                  )}
                  {(certificate.status === 'generated' || certificate.status === 'delivered') && (
                    <Button size="sm" variant="outline" onClick={() => handleDownloadCertificate(certificate)}>
                      <Download className="w-4 h-4 mr-1" />Télécharger
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setSelectedCertificate(certificate)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {certificates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune attestation demandée</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
