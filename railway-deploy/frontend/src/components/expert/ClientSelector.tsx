'use client';

import { useExpert } from '@/contexts/expert-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  ChevronDown, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Briefcase,
  Mail
} from 'lucide-react';
import { useState } from 'react';

export function ClientSelector() {
  const { 
    selectedClient, 
    clients, 
    isExpertMode, 
    selectClient, 
    switchToExpertMode 
  } = useExpert();
  const [isOpen, setIsOpen] = useState(false);

  if (!isExpertMode) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Espace Expert-Comptable
          </CardTitle>
          {selectedClient && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={switchToExpertMode}
            >
              Vue Cabinet
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Sélecteur de client */}
          <div className="relative">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="flex items-center gap-2">
                {selectedClient ? (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>{selectedClient.name}</span>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {selectedClient.status}
                    </Badge>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Choisir un client</span>
                  </>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => {
                      selectClient(null);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Vue Cabinet (tous les clients)</span>
                    </div>
                  </Button>
                  {clients.map((client: any) => (
                    <Button
                      key={client.id}
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        selectClient(client);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {client.industry}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(client.status)}>
                            {getStatusIcon(client.status)}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Informations du client sélectionné */}
          {selectedClient && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-900">Client sélectionné</h4>
                <Badge className="bg-blue-100 text-blue-800">
                  En mode client
                </Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{selectedClient.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>{selectedClient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Secteur: {selectedClient.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Dernière activité: {selectedClient.lastActivity}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  Vous naviguez maintenant dans l'espace de ce client. Toutes les fonctionnalités sont disponibles comme si vous étiez l'entrepreneur.
                </p>
              </div>
            </div>
          )}

          {/* Statut du mode */}
          {!selectedClient && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  Vue Cabinet : Vous pouvez voir l'ensemble de vos clients et leurs performances.
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
