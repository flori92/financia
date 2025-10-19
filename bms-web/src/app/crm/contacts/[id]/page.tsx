'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Building, FileText } from 'lucide-react';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<any>(null);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContact();
    fetchActivities();
    fetchOpportunities();
  }, [params.id]);

  const fetchContact = async () => {
    try {
      const res = await fetch(`/api/crm/contacts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setContact(data);
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/crm/contacts/${params.id}/activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`/api/crm/contacts/${params.id}/opportunities`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!contact) {
    return <div className="p-6">Contact non trouvé</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {contact.companyName || `${contact.firstName} ${contact.lastName}`}
          </h1>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 capitalize">
              {contact.type}
            </span>
            <span
              className={`px-3 py-1 text-sm rounded-full capitalize ${
                contact.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {contact.status}
            </span>
          </div>
        </div>
        <Button onClick={() => router.push(`/crm/contacts/${params.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <span className="font-semibold">Email</span>
          </div>
          <p className="text-sm">{contact.email || 'Non renseigné'}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span className="font-semibold">Téléphone</span>
          </div>
          <p className="text-sm">{contact.phone || 'Non renseigné'}</p>
          {contact.mobile && <p className="text-sm text-gray-600">{contact.mobile}</p>}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="font-semibold">Localisation</span>
          </div>
          <p className="text-sm">
            {contact.city ? `${contact.city}, ${contact.country}` : 'Non renseigné'}
          </p>
        </Card>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activités ({activities.length})
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'opportunities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Opportunités ({opportunities.length})
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'info' && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Informations générales
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Position</label>
                  <p className="font-medium">{contact.position || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Site web</label>
                  <p className="font-medium">
                    {contact.website ? (
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {contact.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informations fiscales
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">NIF / IFU</label>
                  <p className="font-medium">{contact.taxId || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Numéro TVA</label>
                  <p className="font-medium">{contact.vatNumber || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Adresse complète</h3>
              <div className="space-y-1 text-sm">
                {contact.addressLine1 && <p>{contact.addressLine1}</p>}
                {contact.addressLine2 && <p>{contact.addressLine2}</p>}
                {contact.city && (
                  <p>
                    {contact.postalCode} {contact.city}
                  </p>
                )}
                {contact.country && <p>{contact.country}</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Statistiques</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Valeur vie client</label>
                  <p className="font-medium text-lg">
                    {contact.lifetimeValue?.toLocaleString() || 0} FCFA
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Opportunités</label>
                  <p className="font-medium">{contact.opportunityCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Factures</label>
                  <p className="font-medium">{contact.invoiceCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {contact.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'activities' && (
        <Card className="p-6">
          {activities.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Aucune activité enregistrée</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity: any) => (
                <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="font-semibold">{activity.type}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'opportunities' && (
        <Card className="p-6">
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Aucune opportunité</p>
              <Button onClick={() => router.push('/crm/opportunities/new')}>
                Créer une opportunité
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.map((opp: any) => (
                <div
                  key={opp.id}
                  className="border rounded p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/crm/opportunities/${opp.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{opp.title}</h3>
                      <p className="text-sm text-gray-600">{opp.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{opp.amount?.toLocaleString()} FCFA</p>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {opp.stage}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
