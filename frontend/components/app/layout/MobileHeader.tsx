"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Menu } from 'lucide-react';
import { useProfileStore } from '@/store/profile';
import { useUiStore } from '@/store/ui';

const PAGE_TITLES: Record<string, string> = {
  '/accueil': 'Accueil',
  '/profil': 'Mon profil',
  '/mes-documents': 'Mes documents',
  '/candidatures': 'Mes candidatures',
  '/themes': 'Modèles de CV',
  '/parametres': 'Paramètres',
  '/analyse': 'Diagnostic du profil',
};

function resolveTitle(pathname: string): string {
  for (const [key, label] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + '/')) return label;
  }
  return 'Carriey';
}

export default function MobileHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const setToken = useProfileStore((state) => state.setToken);
  const { isMobileDrawerOpen, openMobileDrawer } = useUiStore();

  useEffect(() => {
    if (session?.user?.accessToken) {
      setToken(session.user.accessToken);
    }
  }, [session, setToken]);

  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="mobile-menu-toggle"
          aria-label="Ouvrir le menu de navigation"
          aria-expanded={isMobileDrawerOpen}
          onClick={openMobileDrawer}
          className="p-2 -ml-1 rounded-panel text-text-secondary hover:text-text-primary hover:bg-background-subtle transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-ui-base font-semibold text-text-primary tracking-tight">
          {title}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="p-2 text-text-muted hover:text-text-primary hover:bg-background-subtle rounded-panel transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
