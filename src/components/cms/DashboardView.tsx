'use client';

import { useEffect, useState } from 'react';
import { useCMSStore, type UserStatus } from '@/store/cms-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, Clock, Search, Palette, Rocket, Globe, CheckCircle2,
  ArrowRight, MessageCircle, Phone, MapPin, Building2, ExternalLink,
  AlertCircle, Timer, ShieldCheck, CreditCard,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status step definitions
// ---------------------------------------------------------------------------

interface StatusStep {
  key: UserStatus;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const STATUS_STEPS: StatusStep[] = [
  {
    key: 'pending',
    label: 'Inscription enregistree',
    description: 'Votre demande a ete recue. Notre equipe va etudier votre projet.',
    icon: <Clock className="w-5 h-5" />,
    color: 'bg-gray-400',
  },
  {
    key: 'analyzing',
    label: 'Analyse en cours',
    description: "L'equipe JM Services Africa analyse votre projet et prepare votre site. Duree estimee : 24 a 72 heures.",
    icon: <Search className="w-5 h-5" />,
    color: 'bg-blue-500',
  },
  {
    key: 'beta_ready',
    label: 'Version beta prete',
    description: 'La version beta de votre site est prete. Consultez-la et donnez votre avis.',
    icon: <Palette className="w-5 h-5" />,
    color: 'bg-amber-500',
  },
  {
    key: 'active',
    label: 'Site en ligne',
    description: 'Votre site est publie et accessible a tous vos clients !',
    icon: <Rocket className="w-5 h-5" />,
    color: 'bg-emerald-500',
  },
];

function getStepIndex(status?: UserStatus): number {
  if (!status) return 0;
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

// ---------------------------------------------------------------------------
// Pending User Dashboard (status tracker)
// ---------------------------------------------------------------------------

function PendingDashboard() {
  const { user } = useCMSStore();
  const currentStepIdx = getStepIndex(user?.status);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Bienvenue, {user?.name}
        </h2>
        <p className="text-gray-500 mt-1">
          Suivez l&apos;avancement de votre projet en temps reel
        </p>
      </div>

      {/* Status Banner */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 text-lg">
                Compte en attente d&apos;activation
              </h3>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Votre projet est actuellement en cours de traitement par l&apos;equipe JM Services Africa.
                Vous serez informe par email et/ou WhatsApp de chaque avancee.
              </p>
              <p className="text-xs text-amber-600 mt-2 font-medium">
                Duree estimee : 24 a 72 heures ouvrables
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-600" />
            Avancement de votre projet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isFuture = idx > currentStepIdx;

              return (
                <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Vertical line */}
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className="absolute left-[19px] top-10 w-0.5 h-full">
                      <div
                        className={`w-full h-full ${
                          idx < currentStepIdx ? 'bg-emerald-400' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}

                  {/* Step indicator */}
                  <div className="relative z-10 flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 ring-4 ring-emerald-100 animate-pulse">
                        <span className="w-5 h-5 text-white">{step.icon}</span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 w-5 h-5">{step.icon}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-semibold text-sm ${
                          isCurrent
                            ? 'text-emerald-700'
                            : isCompleted
                              ? 'text-gray-700'
                              : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCompleted && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-100">
                          Termine
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs hover:bg-amber-100">
                          En cours
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isFuture ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {step.description}
                    </p>

                    {/* Beta URL link */}
                    {step.key === 'beta_ready' && isCurrent && user?.betaUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => window.open(user.betaUrl, '_blank')}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Voir la version beta
                      </Button>
                    )}

                    {/* Site link when active */}
                    {step.key === 'active' && isCompleted && user?.domain && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => window.open(`https://${user.domain}`, '_blank')}
                      >
                        <Globe className="w-3.5 h-3.5 mr-1.5" />
                        Visiter mon site
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* User Info Card */}
      {(user?.businessName || user?.phone || user?.businessCity) && (
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Vos informations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {user.businessName && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Activite</p>
                    <p className="text-sm font-medium text-gray-800">{user.businessName}</p>
                  </div>
                </div>
              )}
              {user.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Telephone</p>
                    <p className="text-sm font-medium text-gray-800">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <p className="text-sm font-medium text-gray-800">{user.whatsapp}</p>
                  </div>
                </div>
              )}
              {(user.businessCity || user.businessCountry) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Localisation</p>
                    <p className="text-sm font-medium text-gray-800">
                      {[user.businessCity, user.businessCountry].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
              {user.plan && (
                <div className="flex items-start gap-3">
                  <Rocket className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Forfait</p>
                    <Badge
                      className={`text-xs ${
                        user.plan === 'paid'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {user.plan === 'paid' ? 'Site complet' : 'Essai gratuit (45 jours)'}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <Card className="shadow-sm border-emerald-100">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-semibold text-gray-800">Besoin d&apos;aide ?</h4>
              <p className="text-sm text-gray-500 mt-0.5">
                Contactez notre equipe via WhatsApp ou email pour toute question.
              </p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter JMSA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trial Countdown Component
// ---------------------------------------------------------------------------

function TrialCountdown({ planStartDate }: { planStartDate?: string | null }) {
  const calculateDaysLeft = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffMs = 45 * 24 * 60 * 60 * 1000 - (now.getTime() - start.getTime());
    return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  };

  const [daysLeft, setDaysLeft] = useState<number | null>(
    planStartDate ? calculateDaysLeft(planStartDate) : null
  );

  const [prevStartDate, setPrevStartDate] = useState(planStartDate);

  if (planStartDate && planStartDate !== prevStartDate) {
    setDaysLeft(calculateDaysLeft(planStartDate));
    setPrevStartDate(planStartDate);
  }

  // Update countdown every hour
  useEffect(() => {
    if (!planStartDate) return;
    const interval = setInterval(() => {
      setDaysLeft(calculateDaysLeft(planStartDate));
    }, 3600000);
    return () => clearInterval(interval);
  }, [planStartDate]);

  if (!planStartDate || daysLeft === null) return null;

  const percent = Math.max(0, Math.min(100, ((45 - daysLeft) / 45) * 100));
  const isUrgent = daysLeft <= 7;
  const isExpired = daysLeft === 0;

  if (isExpired) {
    return (
      <Card className="border-red-300 bg-gradient-to-r from-red-50 to-red-100/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 text-lg">Periode d&apos;essai terminee</h3>
              <p className="text-sm text-red-700 mt-1">
                Votre essai gratuit de 45 jours est termine. Votre site sera desactive si vous ne souscrivez pas a un forfait.
              </p>
              <div className="flex gap-2 mt-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Souscrire maintenant
                </Button>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-sm">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Contacter JMSA
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${isUrgent ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50' : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50'}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isUrgent ? 'bg-amber-100' : 'bg-emerald-100'}`}>
            <Timer className={`w-6 h-6 ${isUrgent ? 'text-amber-600' : 'text-emerald-600'}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-semibold ${isUrgent ? 'text-amber-800' : 'text-emerald-800'}`}>
                {isUrgent ? "Periode d'essai bientot terminee !" : "Periode d'essai gratuit"}
              </h3>
              <Badge className={`text-xs ${isUrgent ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
                {daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}
              </Badge>
            </div>
            <p className={`text-sm mt-1 ${isUrgent ? 'text-amber-700' : 'text-emerald-700'}`}>
              {isUrgent
                ? "Il vous reste peu de temps. Souscrivez pour garder votre site en ligne."
                : "Votre site est actif gratuitement. Souscrivez apres l'essai pour le maintenir en ligne."}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Jour 1</span>
                <span>{Math.round(percent)}% ecoule</span>
                <span>Jour 45</span>
              </div>
              <Progress value={percent} className={`h-2 ${isUrgent ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
            </div>
            {isUrgent && (
              <div className="flex gap-2 mt-3">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                  <CreditCard className="w-4 h-4 mr-1.5" />
                  Souscrire maintenant
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Active User Dashboard (full features)
// ---------------------------------------------------------------------------

function ActiveDashboard() {
  const { user, dashboardStats, setView, isPendingUser } = useCMSStore();
  const isPaidPlan = user?.plan === 'paid';

  if (isPendingUser()) return <PendingDashboard />;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Espace client JMSA
          </h2>
          <p className="text-gray-500 mt-1">
            Bienvenue, {user?.name}. Voici l&apos;etat de votre site web.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {user?.domain && (
            <Button
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => window.open(`https://${user.domain}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Visiter mon site
            </Button>
          )}
          <Button
            onClick={() => setView('sites')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Globe className="w-4 h-4 mr-2" />
            Gerer mes sites
          </Button>
        </div>
      </div>

      {/* Trial countdown (only for free users) */}
      {!isPaidPlan && <TrialCountdown planStartDate={user?.planStartDate} />}

      {/* Paid plan badge */}
      {isPaidPlan && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-800">Forfait Premium actif</span>
                  <Badge className="bg-emerald-200 text-emerald-800 text-xs">Premium</Badge>
                </div>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Votre site web est actif et pleinement fonctionnel. Support 24/7 inclus.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Site status card */}
      {user?.domain && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800">
                  Votre site est en ligne
                </h3>
                <p className="text-sm text-emerald-700 mt-1">
                  {user.domain}
                </p>
              </div>
              <Badge className="bg-emerald-200 text-emerald-800 text-sm">Actif</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Globe className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{dashboardStats?.totalPages ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Sites web</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{dashboardStats?.totalPosts ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Articles publies</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Rocket className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-800 capitalize">{user?.plan === 'paid' ? 'Premium' : 'Essai gratuit'}</p>
            <p className="text-xs text-gray-500 mt-1">Forfait actuel</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <MessageCircle className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-2xl font-bold text-gray-800">24/7</p>
            <p className="text-xs text-gray-500 mt-1">Support JMSA</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm cursor-pointer hover:border-emerald-200 transition-colors" onClick={() => setView('sites')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Sites web</h3>
                <p className="text-sm text-gray-500">Gerer vos sites web et pages</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:border-emerald-200 transition-colors" onClick={() => setView('statistics')}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Loader2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Statistiques</h3>
                <p className="text-sm text-gray-500">Consultez les stats de visites</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info note */}
      <Card className="shadow-sm border-gray-200 bg-gray-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 leading-relaxed">
              Votre site est cree et gere par <span className="font-semibold text-gray-800">JM Services Africa</span>. Pour toute modification, contactez notre equipe.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard View
// ---------------------------------------------------------------------------

export default function DashboardView() {
  const { isLoading, fetchDashboard, isPendingUser } = useCMSStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isPendingUser()) {
    return <PendingDashboard />;
  }

  return <ActiveDashboard />;
}
