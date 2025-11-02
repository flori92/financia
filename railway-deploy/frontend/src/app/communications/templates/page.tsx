'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, MessageSquare, MessageCircle, Edit, Trash2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  channel: string;
  category: string;
  subject?: string;
  content: string;
  usageCount: number;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet('/api/v1/communications/templates')
      .then(r => r.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getIcon = (channel: string) => {
    switch(channel) {
      case 'email': return Mail;
      case 'sms': return MessageSquare;
      case 'whatsapp': return MessageCircle;
      default: return Mail;
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Templates de Communication</h1>
          <p className="text-gray-600">Gérez vos modèles d'emails, SMS et WhatsApp</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = getIcon(template.channel);
          return (
            <Card key={template.id} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      template.channel === 'email' ? 'bg-blue-100' :
                      template.channel === 'sms' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        template.channel === 'email' ? 'text-blue-600' :
                        template.channel === 'sms' ? 'text-purple-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        {template.channel === 'email' ? 'Email' :
                         template.channel === 'sms' ? 'SMS' : 'WhatsApp'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    template.category === 'reminder' ? 'bg-orange-100 text-orange-800' :
                    template.category === 'notification' ? 'bg-blue-100 text-blue-800' :
                    template.category === 'marketing' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {template.category === 'reminder' ? 'Relance' :
                     template.category === 'notification' ? 'Notification' :
                     template.category === 'marketing' ? 'Marketing' : 'Autre'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.subject && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Sujet:</p>
                      <p className="text-sm font-medium">{template.subject}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Message:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Utilisé {template.usageCount} fois
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
