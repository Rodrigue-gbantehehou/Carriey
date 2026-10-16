"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import config from '@/lib/config';
import {
  Home, User, FileText, Briefcase, Settings, LogOut,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useEffect } from 'react';

const NAV = [
  { href: '/accueil', label: 'Accueil', icon: Home },
  { href: '/profil', label: 'Mon profil', icon: User },
  { href: '/mes-documents', label: 'Mes documents', icon: FileText },
  { href: '/candidatures', label: 'Mes candidatures', icon: Briefcase },
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

  return (
    <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-background border-r border-border h-screen sticky top-0 font-sans">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-border flex-shrink-0">
        <Link href="/accueil" className="flex items-center gap-2.5 group select-none">
          <Image src={config.appLogo} alt={config.appName} width={28} height={28} className="object-contain" priority />
          <span className="text-ui-lg font-bold tracking-tight text-text-primary">{config.appName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto" aria-label="Navigation principale">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '#' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-panel text-ui-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-subtle text-primary'
                  : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : 'text-text-muted'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-3 border-t border-border space-y-0.5 flex-shrink-0">
        <Link
          href="/parametres"
          className={`flex items-center gap-3 px-3 py-2 rounded-panel text-ui-sm font-medium transition-colors ${
            pathname === '/parametres'
              ? 'bg-primary-subtle text-primary'
              : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
          }`}
        >
          <Settings className={`w-4 h-4 flex-shrink-0 ${pathname === '/parametres' ? 'text-primary' : 'text-text-muted'}`} />
          Paramètres
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-panel text-ui-sm font-medium text-text-secondary hover:bg-danger-bg hover:text-danger-text transition-colors"
          aria-label="Se déconnecter"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-text-muted" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
