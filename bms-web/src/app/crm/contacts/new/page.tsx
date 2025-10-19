'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'client',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    position: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'BJ',
    taxId: '',
    vatNumber: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/crm/contacts/${data.id}`);
      } else {
        alert('Erreur lors de la création du contact');
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
      alert('Erreur lors de la création du contact');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nouveau contact</h1>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Type de contact</h2>
          <select
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full border rounded px-4 py-2"
            required
          >
            <option value="client">Client</option>
            <option value="prospect">Prospect</option>
            <option value="supplier">Fournisseur</option>
            <option value="partner">Partenaire</option>
          </select>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom de l'entreprise</label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Entreprise SARL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <Input
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Directeur Général"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="Jean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Dupont"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@entreprise.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+229 XX XX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <Input
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+229 XX XX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site web</label>
              <Input
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.entreprise.com"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informations fiscales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">NIF / IFU</label>
              <Input
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="1234567890123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Numéro TVA</label>
              <Input
                value={formData.vatNumber}
                onChange={(e) => handleChange('vatNumber', e.target.value)}
                placeholder="BJ123456789"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Adresse</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Adresse ligne 1</label>
              <Input
                value={formData.addressLine1}
                onChange={(e) => handleChange('addressLine1', e.target.value)}
                placeholder="123 Rue de la République"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Adresse ligne 2</label>
              <Input
                value={formData.addressLine2}
                onChange={(e) => handleChange('addressLine2', e.target.value)}
                placeholder="Appartement 4B"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ville</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Cotonou"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code postal</label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  placeholder="01 BP 123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pays</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full border rounded px-4 py-2"
                >
                  <option value="BJ">Bénin</option>
                  <option value="TG">Togo</option>
                  <option value="CI">Côte d'Ivoire</option>
                  <option value="SN">Sénégal</option>
                  <option value="BF">Burkina Faso</option>
                  <option value="ML">Mali</option>
                  <option value="NE">Niger</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
            className="w-full border rounded px-4 py-2"
            placeholder="Notes internes sur ce contact..."
          />
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Création...' : 'Créer le contact'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
