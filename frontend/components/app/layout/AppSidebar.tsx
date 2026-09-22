"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, User, FileText, Briefcase, Palette, Settings, LogOut,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const NAV = [
  { href: '/accueil',       label: 'Accueil',         icon: Home },
  { href: '/profil',        label: 'Mon profil',      icon: User },
  { href: '/mes-documents', label: 'Mes documents',   icon: FileText },
  { href: '/candidatures',  label: 'Mes candidatures', icon: Briefcase },
  { href: '/themes',        label: 'Thèmes',          icon: Palette },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const name = session?.user?.name || session?.user?.email?.split('@')[0] || 'Vous';
  const initial = name.charAt(0).toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <Link href="/accueil" className="text-xl font-black tracking-tight text-indigo-600 select-none">
          CARIEY
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: settings + user */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
        <Link
          href="/parametres"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
            pathname === '/parametres' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          Paramètres
        </Link>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
