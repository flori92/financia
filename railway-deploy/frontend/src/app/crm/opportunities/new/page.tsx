"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, DollarSign, Calendar, User, Target, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface Contact {
  id: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  type: string;
  probability: number;
}

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    probability: 0,
    contactId: '',
    pipelineStageId: '',
    description: '',
    closeDate: '',
    ownerId: '',
  });

  // Récupérer le companyId depuis localStorage
  const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') : null;

  useEffect(() => {
    if (companyId) {
      loadContacts();
      loadStages();
    }
  }, [companyId]);

  const loadContacts = async () => {
    if (!companyId) return;

    try {
      const response = await fetch(`/api/crm/contacts?companyId=${companyId}&limit=1000`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des contacts', err);
    }
  };

  const loadStages = async () => {
    if (!companyId) return;

    try {
      const response = await fetch(`/api/crm/opportunities/pipeline/stages?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setStages(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des étapes', err);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyId) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        probability: Number(formData.probability),
      };

      const response = await fetch('/api/crm/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création');
      }

      router.push('/crm/opportunities');
    } catch (err) {
      console.error('Erreur lors de la création de l\'opportunité', err);
      alert('Erreur lors de la création de l\'opportunité');
    } finally {
      setLoading(false);
    }
  };

  const getContactDisplayName = (contact: Contact) => {
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    }
    return contact.companyName || 'Contact sans nom';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/crm/opportunities">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Opportunité</h1>
          <p className="text-gray-600 mt-1">Créez une nouvelle opportunité dans votre pipeline</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Détails de l'opportunité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Détails de l'opportunité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'opportunité *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Vente logiciel ERP - Entreprise ABC"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Montant (FCFA) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      placeholder="1000000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="probability">Probabilité (%) *</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
                      placeholder="50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closeDate">Date de clôture prévue</Label>
                  <Input
                    id="closeDate"
                    type="date"
                    value={formData.closeDate}
                    onChange={(e) => handleInputChange('closeDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez l'opportunité, les besoins du client, les enjeux..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact associé */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact associé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactId">Sélectionner un contact</Label>
                  <Select value={formData.contactId} onValueChange={(value) => handleInputChange('contactId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un contact..." />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {getContactDisplayName(contact)}
                          {contact.email && ` (${contact.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.contactId && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      Contact sélectionné: {getContactDisplayName(contacts.find(c => c.id === formData.contactId)!)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Étape du pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Étape du pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pipelineStageId">Étape actuelle</Label>
                  <Select value={formData.pipelineStageId} onValueChange={(value) => handleInputChange('pipelineStageId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une étape..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name} ({stage.probability}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.pipelineStageId && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      Probabilité: {stages.find(s => s.id === formData.pipelineStageId)?.probability}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Résumé */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.title && (
                  <div className="text-sm">
                    <strong>Titre:</strong> {formData.title}
                  </div>
                )}

                {formData.amount > 0 && (
                  <div className="text-sm">
                    <strong>Montant:</strong> {formData.amount.toLocaleString('fr-FR')} FCFA
                  </div>
                )}

                {formData.probability > 0 && (
                  <div className="text-sm">
                    <strong>Probabilité:</strong> {formData.probability}%
                  </div>
                )}

                {formData.contactId && (
                  <div className="text-sm">
                    <strong>Contact:</strong> {getContactDisplayName(contacts.find(c => c.id === formData.contactId)!)}
                  </div>
                )}

                {formData.closeDate && (
                  <div className="text-sm">
                    <strong>Clôture:</strong> {new Date(formData.closeDate).toLocaleDateString('fr-FR')}
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="text-sm">
                    <strong>Valeur pondérée:</strong> {((formData.amount * formData.probability) / 100).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href="/crm/opportunities">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-app-primary hover:bg-app-primary/90">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Créer l'Opportunité
          </Button>
        </div>
      </form>
    </div>
  );
}
