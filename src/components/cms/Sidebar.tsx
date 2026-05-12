'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCMSStore, type ViewName } from '@/store/cms-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  Settings,
  ChevronLeft,
  Sparkles,
  Lock,
} from 'lucide-react';

interface NavItem {
  view: ViewName;
  path: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
}

function getNavItems(isPending: boolean): NavItem[] {
  const items: NavItem[] = [
    { view: 'dashboard', path: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      view: 'sites',
      path: '/dashboard/sites',
      label: 'Sites web',
      icon: <Globe className="w-5 h-5" />,
      disabled: isPending,
      disabledTooltip: 'Disponible apres activation de votre compte',
    },
    {
      view: 'statistics',
      path: '/dashboard/statistics',
      label: 'Statistiques',
      icon: <BarChart3 className="w-5 h-5" />,
      disabled: isPending,
      disabledTooltip: 'Disponible apres activation de votre compte',
    },
    { view: 'settings', path: '/dashboard/settings', label: 'Parametres', icon: <Settings className="w-5 h-5" /> },
  ];
  return items;
}

export default function Sidebar() {
  const { user, sidebarOpen, toggleSidebar, isPendingUser } = useCMSStore();
  const pathname = usePathname();
  const router = useRouter();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const isPending = isPendingUser();
  const navItems = getNavItems(isPending);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-emerald-700 to-emerald-900 text-white transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap">
                JMSA Builder
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10 lg:flex hidden"
            onClick={toggleSidebar}
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>

        <Separator className="bg-white/10" />

        {/* Pending banner */}
        {isPending && sidebarOpen && (
          <div className="px-4 pt-4">
            <div className="rounded-lg bg-amber-500/20 border border-amber-400/30 px-3 py-2">
              <div className="flex items-center gap-2 text-amber-200">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-medium">Compte en attente d&apos;activation</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const isDisabled = item.disabled;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    if (isDisabled) return;
                    router.push(item.path);
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  disabled={isDisabled}
                  title={!sidebarOpen ? (isDisabled ? item.disabledTooltip : item.label) : undefined}
                  className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isDisabled
                      ? 'text-white/30 cursor-not-allowed'
                      : isActive
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="whitespace-nowrap">
                      {item.label}
                      {isDisabled && (
                        <Lock className="w-3 h-3 inline ml-1.5 opacity-50" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className="bg-white/10" />

        {/* User section */}
        <div className="p-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 flex-shrink-0 border-2 border-white/30">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-white/60 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
