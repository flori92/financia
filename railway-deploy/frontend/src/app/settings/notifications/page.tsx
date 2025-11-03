"use client";

import { useState, useEffect } from "react";
import { getBaseUrl } from "@/lib/api";
import { formatCurrency } from "@/lib/format-utils";
import { 
  Settings, 
  Mail, 
  MessageCircle, 
  Phone, 
  Save, 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Server,
  Lock
} from "lucide-react";

interface NotificationConfig {
  id?: string;
  emailProvider: 'console' | 'smtp' | 'sendgrid';
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;
  sendgridApiKey?: string;
  sendgridFrom?: string;
  smsProvider: 'console' | 'twilio';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  whatsappProvider: 'console' | 'twilio' | 'meta';
  twilioWhatsAppNumber?: string;
  metaAccessToken?: string;
  metaPhoneNumberId?: string;
  frontendUrl?: string;
  enabled: boolean;
}

export default function NotificationSettingsPage() {
  const [config, setConfig] = useState<NotificationConfig>({
    emailProvider: 'console',
    smsProvider: 'console',
    whatsappProvider: 'console',
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/notification-config`);
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/notification-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (response.ok) {
        alert('Configuration sauvegardée avec succès!');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde de la configuration');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const testConfig = async (type: 'email' | 'sms' | 'whatsapp') => {
    setTesting(type);
    try {
      const response = await fetch(`${getBaseUrl()}/api/v1/notification-config/test/${type}`, {
        method: 'POST',
      });
      const result = await response.json();
      setTestResults({ ...testResults, [type]: result });
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        [type]: { success: false, message: 'Erreur de connexion' }
      });
    } finally {
      setTesting(null);
    }
  };

  const togglePassword = (field: string) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement de la configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration des Notifications</h1>
          <p className="text-gray-600">Configurez l'envoi d'emails, SMS et WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-[#0D9488] text-white rounded-lg hover:bg-[#0f7d73] disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Configuration Email</h2>
          <button
            onClick={() => testConfig('email')}
            disabled={testing === 'email'}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {testing === 'email' ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Test...
              </>
            ) : (
              <>
                <TestTube className="w-3 h-3" />
                Tester
              </>
            )}
          </button>
        </div>

        {testResults.email && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            testResults.email.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {testResults.email.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{testResults.email.message}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider Email</label>
            <select
              value={config.emailProvider}
              onChange={(e) => setConfig({ ...config, emailProvider: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            >
              <option value="console">Console (développement)</option>
              <option value="smtp">SMTP (Gmail, Outlook, etc.)</option>
              <option value="sendgrid">SendGrid</option>
            </select>
          </div>

          {config.emailProvider === 'smtp' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serveur SMTP</label>
                  <input
                    type="text"
                    value={config.smtpHost || ''}
                    onChange={(e) => setConfig({ ...config, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Port</label>
                  <input
                    type="number"
                    value={config.smtpPort || 587}
                    onChange={(e) => setConfig({ ...config, smtpPort: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={config.smtpUser || ''}
                  onChange={(e) => setConfig({ ...config, smtpUser: e.target.value })}
                  placeholder="votre-email@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPasswords.smtp ? 'text' : 'password'}
                    value={config.smtpPass || ''}
                    onChange={(e) => setConfig({ ...config, smtpPass: e.target.value })}
                    autoComplete="new-password"
                    placeholder="Mot de passe d'application"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('smtp')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.smtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Utilisez un mot de passe d'application (Gmail) ou mot de passe app
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email d'envoi</label>
                <input
                  type="text"
                  value={config.smtpFrom || ''}
                  onChange={(e) => setConfig({ ...config, smtpFrom: e.target.value })}
                  placeholder='"BMS" <noreply@votre-entreprise.com>'
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
              </div>
            </>
          )}

          {config.emailProvider === 'sendgrid' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clé API SendGrid</label>
                <div className="relative">
                  <input
                    type={showPasswords.sendgrid ? 'text' : 'password'}
                    value={config.sendgridApiKey || ''}
                    onChange={(e) => setConfig({ ...config, sendgridApiKey: e.target.value })}
                    autoComplete="new-password"
                    placeholder="SG.xxxxx..."
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('sendgrid')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.sendgrid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email d'envoi</label>
                <input
                  type="email"
                  value={config.sendgridFrom || ''}
                  onChange={(e) => setConfig({ ...config, sendgridFrom: e.target.value })}
                  placeholder="noreply@votre-entreprise.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* WhatsApp Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Configuration WhatsApp</h2>
          <button
            onClick={() => testConfig('whatsapp')}
            disabled={testing === 'whatsapp'}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {testing === 'whatsapp' ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Test...
              </>
            ) : (
              <>
                <TestTube className="w-3 h-3" />
                Tester
              </>
            )}
          </button>
        </div>

        {testResults.whatsapp && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            testResults.whatsapp.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {testResults.whatsapp.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{testResults.whatsapp.message}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider WhatsApp</label>
            <select
              value={config.whatsappProvider}
              onChange={(e) => setConfig({ ...config, whatsappProvider: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            >
              <option value="console">Console (développement)</option>
              <option value="twilio">Twilio WhatsApp</option>
              <option value="meta">Meta WhatsApp Business</option>
            </select>
          </div>

          {config.whatsappProvider === 'twilio' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                <input
                  type="text"
                  value={config.twilioAccountSid || ''}
                  onChange={(e) => setConfig({ ...config, twilioAccountSid: e.target.value })}
                  placeholder="ACxxxx..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                <div className="relative">
                  <input
                    type={showPasswords.twilio ? 'text' : 'password'}
                    value={config.twilioAuthToken || ''}
                    onChange={(e) => setConfig({ ...config, twilioAuthToken: e.target.value })}
                    autoComplete="new-password"
                    placeholder="Votre token Twilio"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('twilio')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.twilio ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro WhatsApp</label>
                <input
                  type="text"
                  value={config.twilioWhatsAppNumber || ''}
                  onChange={(e) => setConfig({ ...config, twilioWhatsAppNumber: e.target.value })}
                  placeholder="+14155238886"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Numéro Twilio WhatsApp avec indicatif pays
                </p>
              </div>
            </>
          )}

          {config.whatsappProvider === 'meta' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                <div className="relative">
                  <input
                    type={showPasswords.meta ? 'text' : 'password'}
                    value={config.metaAccessToken || ''}
                    onChange={(e) => setConfig({ ...config, metaAccessToken: e.target.value })}
                    autoComplete="new-password"
                    placeholder="Token d'accès Meta"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('meta')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.meta ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number ID</label>
                <input
                  type="text"
                  value={config.metaPhoneNumberId || ''}
                  onChange={(e) => setConfig({ ...config, metaPhoneNumberId: e.target.value })}
                  placeholder="ID du numéro de téléphone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* SMS Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Configuration SMS</h2>
          <button
            onClick={() => testConfig('sms')}
            disabled={testing === 'sms'}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {testing === 'sms' ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Test...
              </>
            ) : (
              <>
                <TestTube className="w-3 h-3" />
                Tester
              </>
            )}
          </button>
        </div>

        {testResults.sms && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            testResults.sms.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {testResults.sms.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{testResults.sms.message}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider SMS</label>
            <select
              value={config.smsProvider}
              onChange={(e) => setConfig({ ...config, smsProvider: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
            >
              <option value="console">Console (développement)</option>
              <option value="twilio">Twilio SMS</option>
            </select>
          </div>

          {config.smsProvider === 'twilio' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account SID</label>
                <input
                  type="text"
                  value={config.twilioAccountSid || ''}
                  onChange={(e) => setConfig({ ...config, twilioAccountSid: e.target.value })}
                  placeholder="ACxxxx..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token</label>
                <div className="relative">
                  <input
                    type={showPasswords.twilioSms ? 'text' : 'password'}
                    value={config.twilioAuthToken || ''}
                    onChange={(e) => setConfig({ ...config, twilioAuthToken: e.target.value })}
                    autoComplete="new-password"
                    placeholder="Votre token Twilio"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword('twilioSms')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.twilioSms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro SMS</label>
                <input
                  type="text"
                  value={config.twilioPhoneNumber || ''}
                  onChange={(e) => setConfig({ ...config, twilioPhoneNumber: e.target.value })}
                  placeholder="+229XXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D9488] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Numéro Twilio avec indicatif pays
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Guide d'aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Guide de configuration rapide</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div>
                <strong>Email SMTP (Gmail) :</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Activez l'authentification 2 facteurs</li>
                  <li>• Générez un "mot de passe d'application"</li>
                  <li>• Utilisez smtp.gmail.com:587</li>
                </ul>
              </div>
              <div>
                <strong>WhatsApp Twilio :</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Créez un compte Twilio</li>
                  <li>• Activez le Sandbox WhatsApp</li>
                  <li>• Utilisez le numéro +14155238886 pour tester</li>
                </ul>
              </div>
              <div>
                <strong>Mode Console :</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Idéal pour tester sans configuration</li>
                  <li>• Messages affichés dans les logs serveur</li>
                  <li>• Aucun envoi réel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
