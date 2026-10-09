"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import config from '@/lib/config';
import {
  Home, User, FileText, Briefcase, Palette, Settings, LogOut, Globe,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const NAV = [
  { href: '/accueil', label: 'Accueil', icon: Home },
  { href: '/profil', label: 'Mon profil', icon: User },
  { href: '/mes-documents', label: 'Mes documents', icon: FileText },
  { href: '/candidatures', label: 'Mes candidatures', icon: Briefcase },
  { href: '/themes', label: 'Thèmes', icon: Palette },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const setToken = useProfileStore((state) => state.setToken);

  useEffect(() => {
    if (session?.user?.accessToken) {
      setToken(session.user.accessToken);
    }
  }, [session, setToken]);

  const name = session?.user?.name || session?.user?.email?.split('@')[0] || 'Vous';
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-background border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <Link href="/accueil" className="flex items-center gap-2.5 group select-none">
          <Image src={config.appLogo} alt={config.appName} width={32} height={32} className="object-contain" priority />
          <span className="text-ui-lg font-bold tracking-tight text-text-primary">{config.appName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-panel text-ui-sm font-medium transition-colors group ${active
                  ? 'bg-background-subtle text-primary border border-border shadow-sm'
                  : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Main CTA */}
      <div className="px-4 py-4 border-t border-border bg-background">
        <Link href="/candidatures/nouvelle" passHref>
          <Button fullWidth>Nouvelle candidature</Button>
        </Link>
      </div>

      {/* Bottom: settings + user */}
      <div className="border-t border-border px-4 py-4 space-y-1">
        <Link
          href="/parametres"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-panel text-ui-sm font-medium transition-colors group ${pathname === '/parametres' ? 'bg-background-subtle text-primary border border-border shadow-sm' : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
            }`}
        >
          <Settings className="w-4 h-4 text-text-muted group-hover:text-text-secondary" />
          Paramètres
        </Link>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-ui-xs font-bold text-white flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-ui-xs font-semibold text-text-primary truncate">{name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 rounded-md text-text-muted hover:text-danger-text hover:bg-background-subtle transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
