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
        <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
          <Link href="/accueil" className="flex items-center gap-3 select-none">
            <Image
              src={config.appLogo}
              alt={config.appName}
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">{config.appName}</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 block">Votre identité. Votre avenir.</span>
            </div>
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
        <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
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
          
          <div className="pt-2 pb-1">
            <Link
              href="/parametres"
              onClick={onClose}
              className={`flex items-center gap-3.5 px-4 py-2.5 rounded-full text-[13px] font-medium transition-all group ${
                pathname === '/parametres'
                  ? 'bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className={`w-4 h-4 flex-shrink-0 ${pathname === '/parametres' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              Paramètres
            </Link>
          </div>
        </nav>

        {/* CTA Card (Like Mockup) */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-primary/80 to-indigo-900 rounded-2xl p-5 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h4 className="text-white font-bold text-sm mb-2 relative z-10">Construis la carrière qui te ressemble</h4>
            <p className="text-indigo-100 text-[11px] mb-4 relative z-10 leading-relaxed">
              Structure ton identité, développe tes compétences et progresse à ton rythme.
            </p>
            <Link 
              href="/candidatures/nouvelle" 
              onClick={onClose}
              className="block text-center bg-white text-primary text-xs font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors relative z-10"
            >
              Nouvelle candidature &rarr;
            </Link>
          </div>
        </div>

        {/* Bottom: settings + user */}
        <div className="border-t border-white/5 px-4 py-4 space-y-2 bg-[#0A0D1E]">
          <Link
            href="/parametres"
            onClick={onClose}
            className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
              pathname === '/parametres'
                ? 'bg-white/10 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-white" />
            Paramètres
          </Link>

          <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{name}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>,
    document.body
  );
}
