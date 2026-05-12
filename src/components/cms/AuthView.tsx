'use client';

import { useState } from 'react';
import { useCMSStore } from '@/store/cms-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft,
  User, Briefcase, Globe, Share2, CheckCircle2,
} from 'lucide-react';

const BUSINESS_TYPES = [
  'Commerce / Boutique',
  'Restaurant / Alimentation',
  'Services (BTP, Transport, Sante...)',
  'Technologie / Informatique',
  'Formation / Education',
  'Mode / Beaute / Cosmetique',
  'Artisanat',
  'Agriculture / Elevage',
  'Immobilier',
  'Autre',
];

const COUNTRIES = [
  'Cameroun', 'Cote d\'Ivoire', 'Senegal', 'Mali', 'Burkina Faso',
  'Guinee', 'Togo', 'Benin', 'Niger', 'Tchad',
  'Gabon', 'Congo', 'RD Congo', 'Angola', 'Nigeria',
  'Ghana', 'Autre',
];

export default function AuthView() {
  const { login, register, isLoading, notifications } = useCMSStore();

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Register form - multi step
  const [regStep, setRegStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Account
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Step 2: Business info
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('');
  const [regBusinessDesc, setRegBusinessDesc] = useState('');
  const [regBusinessAddress, setRegBusinessAddress] = useState('');
  const [regBusinessCity, setRegBusinessCity] = useState('');
  const [regBusinessCountry, setRegBusinessCountry] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Step 3: Social media
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regFacebook, setRegFacebook] = useState('');
  const [regInstagram, setRegInstagram] = useState('');
  const [regTiktok, setRegTiktok] = useState('');
  const [regTwitter, setRegTwitter] = useState('');
  const [regLinkedin, setRegLinkedin] = useState('');

  // Step 4: Plan
  const [regPlan, setRegPlan] = useState('free');

  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regSuccess, setRegSuccess] = useState('');

  const latestNotif = notifications[notifications.length - 1];

  function validateLogin(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!loginEmail.trim()) errors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail))
      errors.email = "Adresse email invalide";
    if (!loginPassword.trim()) errors.password = 'Le mot de passe est requis';
    else if (loginPassword.length < 6)
      errors.password = 'Le mot de passe doit contenir au moins 6 caracteres';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStep1(): boolean {
    const errors: Record<string, string> = {};
    if (!regName.trim()) errors.name = 'Le nom est requis';
    if (!regEmail.trim()) errors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail))
      errors.email = 'Adresse email invalide';
    if (!regPassword.trim()) errors.password = 'Le mot de passe est requis';
    else if (regPassword.length < 6)
      errors.password = 'Le mot de passe doit contenir au moins 6 caracteres';
    if (!regConfirm.trim()) errors.confirm = 'Veuillez confirmer le mot de passe';
    else if (regPassword !== regConfirm)
      errors.confirm = 'Les mots de passe ne correspondent pas';
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErrors({});
    if (!validateLogin()) return;
    try {
      await login(loginEmail, loginPassword);
    } catch {
      // erreur deja geree par la notification du store
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegErrors({});
    setRegSuccess('');
    if (!validateStep1()) return;

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        businessName: regBusinessName,
        businessType: regBusinessType,
        businessDescription: regBusinessDesc,
        businessAddress: regBusinessAddress,
        businessCity: regBusinessCity,
        businessCountry: regBusinessCountry,
        phone: regPhone,
        whatsapp: regWhatsapp,
        facebook: regFacebook,
        instagram: regInstagram,
        tiktok: regTiktok,
        twitter: regTwitter,
        linkedin: regLinkedin,
        plan: regPlan,
      });
      setRegSuccess('Compte cree avec succes ! JM Services Africa va analyser votre projet et vous contacter sous 24-72h.');
    } catch {
      // erreur deja geree par la notification du store
    }
  }

  function nextStep() {
    if (regStep === 1 && !validateStep1()) return;
    setRegErrors({});
    setRegStep((s) => Math.min(s + 1, totalSteps));
  }

  function prevStep() {
    setRegErrors({});
    setRegStep((s) => Math.max(s - 1, 1));
  }

  const stepTitles = ['Compte', 'Votre activite', 'Reseaux sociaux', 'Choix du forfait'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-4 py-8">
      {latestNotif && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm shadow-lg transition-all ${
            latestNotif.type === 'success'
              ? 'bg-emerald-600 text-white'
              : latestNotif.type === 'error'
                ? 'bg-red-600 text-white'
                : latestNotif.type === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white'
          }`}
        >
          {latestNotif.message}
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            JMSA Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion de clients par JM Services Africa
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Se connecter
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Creer un compte
            </TabsTrigger>
          </TabsList>

          {/* LOGIN TAB */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Connexion</CardTitle>
                <CardDescription>
                  Accedez a votre espace client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      className={loginErrors.email ? 'border-red-400' : ''}
                    />
                    {loginErrors.email && <p className="text-xs text-red-500">{loginErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="Votre mot de passe"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isLoading}
                        className={loginErrors.password ? 'border-red-400 pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && <p className="text-xs text-red-500">{loginErrors.password}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion en cours...</>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGISTER TAB - MULTI STEP */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl">
                    {regStep < totalSteps ? `Etape ${regStep}/${totalSteps - 1}` : 'Finalisation'}
                  </CardTitle>
                  <span className="text-sm text-emerald-600 font-medium">{stepTitles[regStep - 1]}</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(regStep / totalSteps) * 100}%` }}
                  />
                </div>
                <CardDescription className="mt-2">
                  {regStep === 1 && 'Creez votre compte pour commencer.'}
                  {regStep === 2 && 'Decrivez votre activite pour qu\'on puisse mieux vous servir.'}
                  {regStep === 3 && 'Ajoutez vos reseaux sociaux (optionnel).'}
                  {regStep === 4 && 'Choisissez le forfait adapte a vos besoins.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {regSuccess ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Inscription reussie !</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{regSuccess}</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* STEP 1: Account */}
                    {regStep === 1 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <User className="w-4 h-4" />
                          <span className="text-sm font-medium">Informations du compte</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-name">Nom complet *</Label>
                          <Input
                            id="reg-name"
                            type="text"
                            placeholder="Votre nom complet"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            disabled={isLoading}
                            className={regErrors.name ? 'border-red-400' : ''}
                          />
                          {regErrors.name && <p className="text-xs text-red-500">{regErrors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">Email *</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            disabled={isLoading}
                            className={regErrors.email ? 'border-red-400' : ''}
                          />
                          {regErrors.email && <p className="text-xs text-red-500">{regErrors.email}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Mot de passe *</Label>
                          <div className="relative">
                            <Input
                              id="reg-password"
                              type={showRegPassword ? 'text' : 'password'}
                              placeholder="Minimum 6 caracteres"
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              disabled={isLoading}
                              className={regErrors.password ? 'border-red-400 pr-10' : 'pr-10'}
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                            >
                              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {regErrors.password && <p className="text-xs text-red-500">{regErrors.password}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-confirm">Confirmer le mot de passe *</Label>
                          <Input
                            id="reg-confirm"
                            type={showRegPassword ? 'text' : 'password'}
                            placeholder="Repetez le mot de passe"
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            disabled={isLoading}
                            className={regErrors.confirm ? 'border-red-400' : ''}
                          />
                          {regErrors.confirm && <p className="text-xs text-red-500">{regErrors.confirm}</p>}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Business Info */}
                    {regStep === 2 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm font-medium">Votre activite</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="biz-name">Nom de l'entreprise / activite</Label>
                          <Input
                            id="biz-name"
                            type="text"
                            placeholder="Ex: Chez Mama, Digital Pro..."
                            value={regBusinessName}
                            onChange={(e) => setRegBusinessName(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="biz-type">Secteur d'activite</Label>
                          <select
                            id="biz-type"
                            value={regBusinessType}
                            onChange={(e) => setRegBusinessType(e.target.value)}
                            disabled={isLoading}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">-- Choisir un secteur --</option>
                            {BUSINESS_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="biz-desc">Decrivez votre activite</Label>
                          <Textarea
                            id="biz-desc"
                            placeholder="En quelques mots, que faites-vous ? Quels services proposez-vous ?"
                            value={regBusinessDesc}
                            onChange={(e) => setRegBusinessDesc(e.target.value)}
                            disabled={isLoading}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="biz-phone">Telephone</Label>
                            <Input
                              id="biz-phone"
                              type="tel"
                              placeholder="+237 6XX XXX XXX"
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="biz-country">Pays</Label>
                            <select
                              id="biz-country"
                              value={regBusinessCountry}
                              onChange={(e) => setRegBusinessCountry(e.target.value)}
                              disabled={isLoading}
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="">-- Pays --</option>
                              {COUNTRIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="biz-city">Ville</Label>
                            <Input
                              id="biz-city"
                              type="text"
                              placeholder="Douala, Yaounde..."
                              value={regBusinessCity}
                              onChange={(e) => setRegBusinessCity(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="biz-address">Quartier / Adresse</Label>
                            <Input
                              id="biz-address"
                              type="text"
                              placeholder="Bonapriso, Makepe..."
                              value={regBusinessAddress}
                              onChange={(e) => setRegBusinessAddress(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Social Media */}
                    {regStep === 3 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Vos reseaux sociaux</span>
                        </div>
                        <p className="text-xs text-gray-500">Ces informations nous aideront a creer les liens vers vos reseaux sur votre site. Optionnel.</p>
                        <div className="space-y-2">
                          <Label htmlFor="soc-whatsapp">WhatsApp</Label>
                          <Input
                            id="soc-whatsapp"
                            type="text"
                            placeholder="+237 6XX XXX XXX"
                            value={regWhatsapp}
                            onChange={(e) => setRegWhatsapp(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="soc-facebook">Facebook</Label>
                          <Input
                            id="soc-facebook"
                            type="text"
                            placeholder="https://facebook.com/votre-page"
                            value={regFacebook}
                            onChange={(e) => setRegFacebook(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="soc-instagram">Instagram</Label>
                          <Input
                            id="soc-instagram"
                            type="text"
                            placeholder="https://instagram.com/votre-compte"
                            value={regInstagram}
                            onChange={(e) => setRegInstagram(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="soc-tiktok">TikTok</Label>
                          <Input
                            id="soc-tiktok"
                            type="text"
                            placeholder="https://tiktok.com/@votre-compte"
                            value={regTiktok}
                            onChange={(e) => setRegTiktok(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="soc-twitter">Twitter / X</Label>
                            <Input
                              id="soc-twitter"
                              type="text"
                              placeholder="@votre-compte"
                              value={regTwitter}
                              onChange={(e) => setRegTwitter(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="soc-linkedin">LinkedIn</Label>
                            <Input
                              id="soc-linkedin"
                              type="text"
                              placeholder="https://linkedin.com/in/..."
                              value={regLinkedin}
                              onChange={(e) => setRegLinkedin(e.target.value)}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Plan */}
                    {regStep === 4 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-700 mb-2">
                          <Globe className="w-4 h-4" />
                          <span className="text-sm font-medium">Choisissez votre forfait</span>
                        </div>
                        <div className="grid gap-4">
                          {/* Free Plan */}
                          <button
                            type="button"
                            onClick={() => setRegPlan('free')}
                            className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                              regPlan === 'free'
                                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                : 'border-gray-200 hover:border-emerald-300 bg-white'
                            }`}
                          >
                            {regPlan === 'free' && (
                              <div className="absolute top-3 right-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              </div>
                            )}
                            <div className="text-sm font-bold text-emerald-600 mb-1">Gratuit - 45 jours</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Essai gratuit</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>Landing page personnalisee</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>Espace blog integre</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>Sous-nom de domaine (jmsa-builder.com/votre-site)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>Liens vers vos reseaux sociaux</span>
                              </li>
                            </ul>
                          </button>

                          {/* Paid Plan */}
                          <button
                            type="button"
                            onClick={() => setRegPlan('paid')}
                            className={`relative rounded-xl border-2 p-5 text-left transition-all ${
                              regPlan === 'paid'
                                ? 'border-amber-500 bg-amber-50 shadow-md'
                                : 'border-gray-200 hover:border-amber-300 bg-white'
                            }`}
                          >
                            {regPlan === 'paid' && (
                              <div className="absolute top-3 right-3">
                                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                              </div>
                            )}
                            <div className="text-sm font-bold text-amber-600 mb-1">Paiement direct</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Site complet</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>Site web complet et professionnel</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>Blog integre avec gestion de contenu</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>Nom de domaine personnalise (votresite.com)</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>Liens vers vos reseaux sociaux</span>
                              </li>
                            </ul>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between pt-2">
                      {regStep > 1 ? (
                        <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                          <ArrowLeft className="w-4 h-4 mr-1" /> Precedent
                        </Button>
                      ) : (
                        <div />
                      )}

                      {regStep < totalSteps ? (
                        <Button type="button" onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Suivant <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creation en cours...</>
                          ) : (
                            'Creer mon compte'
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; {new Date().getFullYear()} JM Services Africa. Tous droits reserves.
        </p>
      </div>
    </div>
  );
}
