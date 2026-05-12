'use client';

import { useEffect } from 'react';
import { useCMSStore } from '@/store/cms-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Menu,
  LogOut,
  Bell,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Sidebar from './Sidebar';
import DashboardView from './DashboardView';
import SitesView from './SitesView';
import StatisticsView from './StatisticsView';
import SettingsView from './SettingsView';
import AuthView from './AuthView';

function NotificationToast() {
  const { notifications } = useCMSStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`rounded-lg px-4 py-3 text-sm shadow-lg animate-in slide-in-from-right duration-300 ${
            n.type === 'success'
              ? 'bg-emerald-600 text-white'
              : n.type === 'error'
                ? 'bg-red-600 text-white'
                : n.type === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-600 text-white'
          }`}
        >
          {n.message}
        </div>
      ))}
    </div>
  );
}

function WelcomeDialog() {
  const { user, welcomeShown, dismissWelcome, setView } = useCMSStore();

  const isOpen = !welcomeShown && !!user;

  function handleClose() {
    dismissWelcome();
  }

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Bienvenue, {user.name} !
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Merci d&apos;avoir choisi JMSA Builder pour votre presence en ligne.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
            <p className="text-sm text-emerald-800 font-medium mb-2">Prochaines etapes :</p>
            <ul className="space-y-2 text-sm text-emerald-700">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Notre equipe va analyser votre projet sous 24-72h.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Vous recevrez une version beta de votre site par email.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Apres validation, votre site sera mis en ligne !</span>
              </li>
            </ul>
          </div>
          {user.businessName && (
            <p className="text-sm text-gray-500 text-center">
              Activite : <span className="font-medium text-gray-700">{user.businessName}</span>
            </p>
          )}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8"
          >
            Acceder a mon espace <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Header() {
  const { user, currentView, toggleSidebar, logout } = useCMSStore();

  const viewLabels: Record<string, string> = {
    dashboard: 'Tableau de bord',
    sites: 'Sites web',
    statistics: 'Statistiques',
    settings: 'Parametres',
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        {/* Branding */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-tight">JMSA Builder</span>
            <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">{viewLabels[currentView] || 'Tableau de bord'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User menu */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            {user?.name}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Se deconnecter"
            className="text-gray-500 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );
}

export default function CMSLayout() {
  const {
    isAuthenticated,
    isLoading,
    currentView,
    checkSession,
    fetchDashboard,
    isPendingUser,
    setView,
    sidebarOpen,
  } = useCMSStore();

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Force pending users to dashboard
  useEffect(() => {
    if (isAuthenticated && isPendingUser() && currentView !== 'dashboard' && currentView !== 'settings') {
      setView('dashboard');
    }
  }, [isAuthenticated, isPendingUser, currentView, setView]);

  // Show loading on initial session check
  if (!isAuthenticated && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">JMSA Builder</h2>
          <p className="text-sm text-gray-500 mb-6">par JM Services Africa</p>
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-400 text-xs mt-3">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // Show auth view if not authenticated
  if (!isAuthenticated) {
    return <AuthView />;
  }

  const sidebarWidth = sidebarOpen ? 'lg:ml-64' : 'lg:ml-20';

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationToast />
      <WelcomeDialog />
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarWidth}`}>
        <Header />
        <main className="p-4 md:p-6">
          {isLoading && !currentView ? (
            <LoadingScreen />
          ) : (
            <>
              {currentView === 'dashboard' && <DashboardView />}
              {currentView === 'sites' && !isPendingUser() && <SitesView />}
              {currentView === 'statistics' && !isPendingUser() && <StatisticsView />}
              {currentView === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
