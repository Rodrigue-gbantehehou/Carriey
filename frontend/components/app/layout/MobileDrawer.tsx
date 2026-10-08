"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Home, User, FileText, Briefcase, Palette, Settings, LogOut, X,
} from 'lucide-react';
import config from '@/lib/config';

const NAV = [
  { href: '/accueil', label: 'Accueil', icon: Home },
  { href: '/profil', label: 'Mon profil', icon: User },
  { href: '/mes-documents', label: 'Mes documents', icon: FileText },
  { href: '/candidatures', label: 'Mes candidatures', icon: Briefcase },
  { href: '/themes', label: 'Thèmes', icon: Palette },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const name = session?.user?.name || session?.user?.email?.split('@')[0] || 'Vous';
  const initial = name.charAt(0).toUpperCase();

  // SSR guard — portal needs document.body
  useEffect(() => { setMounted(true); }, []);

  // Close drawer on route change
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Drawer panel */}
      <aside
        aria-modal="true"
        role="dialog"
        aria-label="Menu de navigation"
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/accueil" className="flex items-center gap-2.5 select-none">
            <Image
              src={config.appLogo}
              alt={config.appName}
              width={28}
              height={28}
              className="object-contain"
              priority
            />
            <span className="text-lg font-bold tracking-tight text-indigo-600">
              {config.appName}
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: settings + user */}
        <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
          <Link
            href="/parametres"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${pathname === '/parametres'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            Paramètres
          </Link>

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
    </>,
    document.body
  );
}
