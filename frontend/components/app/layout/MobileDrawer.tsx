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
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[260px] bg-[#0B0F24] flex flex-col shadow-2xl font-sans
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <Link href="/accueil" className="flex items-center gap-3 select-none">
            <Image
              src={config.appLogo}
              alt={config.appName}
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <span className="text-xl font-bold tracking-tight text-white block leading-none">{config.appName}</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '#' && pathname.startsWith(href + '/'));
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all group ${
                  active
                    ? 'bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                {label}
              </Link>
            );
          })}
          
          <div>
            <Link
              href="/parametres"
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2 rounded-full text-xs font-semibold transition-all group ${
                pathname === '/parametres'
                  ? 'bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className={`w-3.5 h-3.5 flex-shrink-0 ${pathname === '/parametres' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              Paramètres
            </Link>
          </div>
        </nav>

      </aside>
    </>,
    document.body
  );
}
