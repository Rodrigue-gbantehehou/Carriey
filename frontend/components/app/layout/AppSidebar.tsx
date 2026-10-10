"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import config from '@/lib/config';
import {
  Home, User, FileText, Briefcase, Palette, Settings, LogOut,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useEffect } from 'react';

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

  return (
    <aside className="hidden lg:flex flex-col w-[260px] flex-shrink-0 bg-[#0B0F24] border-r border-white/5 h-screen sticky top-0 font-sans">
      {/* Logo */}
      <div className="px-6 py-4 border-b border-white/5">
        <Link href="/accueil" className="flex items-center gap-3 group select-none">
          <Image src={config.appLogo} alt={config.appName} width={32} height={32} className="object-contain" priority />
          <span className="text-xl font-bold tracking-tight text-white block leading-none">{config.appName}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {NAV.map(({ href, label, icon: Icon }) => {
          // Exception: on considère "actif" si l'URL correspond exactement, pour éviter les faux positifs avec les "#"
          const active = pathname === href || (href !== '#' && pathname.startsWith(href + '/'));
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-full text-xs font-semibold transition-all group ${
                active
                  ? 'bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {label}
            </Link>
          );
        })}

        <div>
            <Link
              href="/parametres"
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

      {/* CTA Card (Like Mockup) */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-b from-[#2e4099] to-[#121c54] rounded-2xl border border-white/5 relative overflow-hidden shadow-xl flex flex-col">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
          
          {/* Full-width illustration */}
          <div className="w-full h-24 relative z-10 mb-2">
            {/* L'image doit être placée dans public/img/sidebar-cta.jpg */}
            <Image 
                src="/img/sidebar-cta.jpg" 
                alt="Illustration Carriey" 
                fill 
                className="object-cover object-top" 
                unoptimized 
            />
          </div>

          <div className="px-5 pb-5 relative z-10 flex flex-col items-center text-center">
            <h4 className="text-white font-bold text-[13px] mb-1.5 leading-tight">Construis ta carrière</h4>
            <p className="text-[#a5b4fc] text-[10px] mb-3 leading-snug font-medium">
              Structure ton identité et développe tes compétences.
            </p>
            <Link href="/candidatures/nouvelle" className="w-full block bg-white text-[#1e1b4b] text-[11px] font-bold py-2 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
              Découvrir &rarr;
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
