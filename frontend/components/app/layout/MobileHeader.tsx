"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bell, Menu } from 'lucide-react';
import { useProfileStore } from '@/store/profile';
import MobileDrawer from './MobileDrawer';

const PAGE_TITLES: Record<string, string> = {
  '/accueil': 'Accueil',
  '/profil': 'Profil',
  '/mes-documents': 'Documents',
  '/candidatures': 'Candidatures',
  '/themes': 'Thèmes',
  '/parametres': 'Paramètres',
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.accessToken) {
      setToken(session.user.accessToken);
    }
  }, [session, setToken]);

  const title = resolveTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between safe-area-top">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-toggle"
            aria-label="Ouvrir le menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 rounded-lg text-text-secondary hover:text-primary hover:bg-primary-subtle transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-text-primary tracking-tight">{title}</h1>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Notifications"
            className="text-text-secondary hover:text-primary transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
