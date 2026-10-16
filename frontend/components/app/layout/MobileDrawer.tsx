"use client";

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Home,
  User,
  FileText,
  Briefcase,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import config from '@/lib/config';
import { useUiStore } from '@/store/ui';

const NAV = [
  { href: '/accueil', label: 'Accueil', icon: Home },
  { href: '/profil', label: 'Mon profil', icon: User },
  { href: '/mes-documents', label: 'Mes documents', icon: FileText },
  { href: '/candidatures', label: 'Mes candidatures', icon: Briefcase },
];

interface MobileDrawerProps {
  open?: boolean;
  onClose?: () => void;
}

export default function MobileDrawer({ open: controlledOpen, onClose: controlledOnClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const { isMobileDrawerOpen, closeMobileDrawer } = useUiStore();

  const isOpen = controlledOpen !== undefined ? controlledOpen : isMobileDrawerOpen;
  const handleClose = controlledOnClose || closeMobileDrawer;

  const name =
    session?.user?.name || session?.user?.email?.split('@')[0] || 'Vous';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fermer lors d'un vrai changement d'URL
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      handleClose();
    }
  }, [pathname, handleClose]);

  // Fermer sur Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Bloquer le scroll d'arrière-plan quand ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Si fermé ou pas encore monté côté client, ne rien rendre dans le DOM
  if (!isOpen || !mounted) return null;

  const drawerContent = (
    <div
      className="lg:hidden fixed inset-0 z-[9999] flex"
      aria-modal="true"
      role="dialog"
      aria-label="Menu de navigation mobile"
    >
      {/* Backdrop sombre et cliquable */}
      <div
        className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm transition-opacity cursor-pointer animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panneau latéral du menu */}
      <aside
        className="relative z-10 w-[280px] max-w-[85vw] h-full bg-background border-r border-border flex flex-col shadow-2xl font-sans animate-fade-in"
      >
        {/* En-tête : Logo et bouton fermer */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <Link
            href="/accueil"
            className="flex items-center gap-2.5 select-none"
            onClick={handleClose}
          >
            <Image
              src={config.appLogo}
              alt={config.appName}
              width={30}
              height={30}
              className="object-contain"
              priority
            />
            <span className="text-ui-lg font-bold tracking-tight text-text-primary">
              {config.appName}
            </span>
          </Link>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fermer le menu"
            className="p-2 rounded-panel text-text-muted hover:text-text-primary hover:bg-background-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info utilisateur connecté */}
        {session?.user && (
          <div className="px-5 py-3 border-b border-border bg-background-subtle/50 shrink-0">
            <p className="text-ui-xs text-text-muted">Connecté en tant que</p>
            <p className="text-ui-sm font-semibold text-text-primary truncate mt-0.5">
              {name}
            </p>
          </div>
        )}

        {/* Liens de navigation */}
        <nav
          className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto"
          aria-label="Navigation principale"
        >
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== '#' && pathname.startsWith(href + '/'));
            return (
              <Link
                key={label}
                href={href}
                onClick={handleClose}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-panel text-ui-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-subtle text-primary font-semibold'
                    : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? 'text-primary' : 'text-text-muted'
                  }`}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Section basse : Paramètres & Déconnexion */}
        <div className="px-3 py-3 border-t border-border space-y-1 shrink-0">
          <Link
            href="/parametres"
            onClick={handleClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-panel text-ui-sm font-medium transition-colors ${
              pathname === '/parametres'
                ? 'bg-primary-subtle text-primary font-semibold'
                : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
            }`}
          >
            <Settings
              className={`w-4 h-4 shrink-0 ${
                pathname === '/parametres' ? 'text-primary' : 'text-text-muted'
              }`}
            />
            <span>Paramètres</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              handleClose();
              signOut({ callbackUrl: '/login' });
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-panel text-ui-sm font-medium text-text-secondary hover:bg-danger-bg hover:text-danger-text transition-colors cursor-pointer"
            aria-label="Se déconnecter"
          >
            <LogOut className="w-4 h-4 shrink-0 text-text-muted" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
