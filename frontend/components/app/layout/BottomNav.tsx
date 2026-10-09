"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, FileText, Globe } from 'lucide-react';

const NAV = [
  { href: '/accueil',      label: 'Accueil',   icon: Home },
  { href: '/profil',       label: 'Profil',    icon: User },
  { href: '/mes-documents', label: 'Documents', icon: FileText },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-border safe-area-bottom pb-4 pt-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex items-stretch">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-medium transition-colors ${
                active ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-text-muted'}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
