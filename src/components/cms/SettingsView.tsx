'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCMSStore } from '@/store/cms-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Globe, Phone, Share2, Search } from 'lucide-react';

interface SettingField {
  key: string;
  label: string;
  type: 'input' | 'textarea';
  placeholder: string;
}

const SETTING_SECTIONS = [
  {
    title: 'Informations du site',
    description: 'Informations generales affichees sur votre site',
    icon: <Globe className="w-5 h-5 text-emerald-600" />,
    fields: [
      { key: 'siteName', label: 'Nom du site', type: 'input', placeholder: 'Mon site JMSA' },
      { key: 'siteDescription', label: 'Description du site', type: 'textarea', placeholder: 'Decrivez votre site en quelques phrases...' },
      { key: 'siteSlogan', label: 'Slogan', type: 'input', placeholder: 'Votre slogan ici' },
    ] as SettingField[],
  },
  {
    title: 'Contact',
    description: 'Coordonnees de contact de votre entreprise',
    icon: <Phone className="w-5 h-5 text-emerald-600" />,
    fields: [
      { key: 'contactEmail', label: 'Email de contact', type: 'input', placeholder: 'contact@monsite.com' },
      { key: 'contactPhone', label: 'Telephone', type: 'input', placeholder: '+225 00 00 00 00' },
      { key: 'contactWhatsApp', label: 'WhatsApp', type: 'input', placeholder: '+225 00 00 00 00' },
      { key: 'contactAddress', label: 'Adresse', type: 'input', placeholder: 'Abidjan, Cote d\'Ivoire' },
    ] as SettingField[],
  },
  {
    title: 'Reseaux sociaux',
    description: 'Liens vers vos profils sur les reseaux sociaux',
    icon: <Share2 className="w-5 h-5 text-emerald-600" />,
    fields: [
      { key: 'socialFacebook', label: 'Facebook', type: 'input', placeholder: 'https://facebook.com/monsite' },
      { key: 'socialInstagram', label: 'Instagram', type: 'input', placeholder: 'https://instagram.com/monsite' },
      { key: 'socialTwitter', label: 'Twitter / X', type: 'input', placeholder: 'https://twitter.com/monsite' },
      { key: 'socialLinkedIn', label: 'LinkedIn', type: 'input', placeholder: 'https://linkedin.com/company/monsite' },
    ] as SettingField[],
  },
  {
    title: 'SEO',
    description: 'Optimisation pour les moteurs de recherche',
    icon: <Search className="w-5 h-5 text-emerald-600" />,
    fields: [
      { key: 'seoTitle', label: 'Titre SEO', type: 'input', placeholder: 'Titre par defaut pour les moteurs de recherche' },
      { key: 'seoDescription', label: 'Description SEO', type: 'textarea', placeholder: 'Meta description par defaut (150-160 caracteres recommandes)...' },
    ] as SettingField[],
  },
];

export default function SettingsView() {
  const { settings, isLoading, fetchSettings, updateSettings, addNotification } = useCMSStore();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Sync local state with store (deferred to avoid lint warning)
  useEffect(() => {
    if (Object.keys(settings).length > 0 && !initialized) {
      queueMicrotask(() => {
        setLocalSettings({ ...settings });
        setInitialized(true);
      });
    }
  }, [settings, initialized]);

  function handleChange(key: string, value: string) {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  async function handleSave() {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
    } catch {
      // error handled by store
    }
  }

  // Count filled settings
  const filledCount = useMemo(() => {
    return Object.values(localSettings).filter((v) => v && v.trim()).length;
  }, [localSettings]);

  const totalFields = SETTING_SECTIONS.reduce((acc, s) => acc + s.fields.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Parametres</h2>
          <p className="text-sm text-gray-500">
            {filledCount} / {totalFields} champ(s) rempli(s)
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading || !hasChanges}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
          Vous avez des modifications non enregistrees.
        </div>
      )}

      {isLoading && Object.keys(settings).length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {SETTING_SECTIONS.map((section, idx) => (
            <Card key={section.title} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    {section.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.fields.map((field, fIdx) => (
                    <div key={field.key}>
                      <div className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={field.key}
                            value={localSettings[field.key] ?? ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                          />
                        ) : (
                          <Input
                            id={field.key}
                            value={localSettings[field.key] ?? ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                      {fIdx < section.fields.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
