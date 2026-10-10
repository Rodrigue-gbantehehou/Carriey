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
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-[#0A0D1E] border-r border-white/5 h-screen sticky top-0 font-sans">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <Link href="/accueil" className="flex items-center gap-3 group select-none">
          <Image src={config.appLogo} alt={config.appName} width={32} height={32} className="object-contain" priority />
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-none">{config.appName}</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 block">Votre identité. Votre avenir.</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                active
                  ? 'bg-primary text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* CTA Card (Like Mockup) */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-br from-primary/80 to-indigo-900 rounded-2xl p-5 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h4 className="text-white font-bold text-sm mb-2 relative z-10">Construis la carrière qui te ressemble</h4>
          <p className="text-indigo-100 text-[11px] mb-4 relative z-10 leading-relaxed">
            Structure ton identité, développe tes compétences et progresse à ton rythme.
          </p>
          <Link href="/candidatures/nouvelle" className="block text-center bg-white text-primary text-xs font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-colors relative z-10">
            Nouvelle candidature &rarr;
          </Link>
        </div>
      </div>

      {/* Bottom: settings + user */}
      <div className="border-t border-white/5 px-4 py-4 space-y-2 bg-[#0A0D1E]">
        <Link
          href="/parametres"
          className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
            pathname === '/parametres' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-white" />
          Paramètres
        </Link>

        {/* User */}
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
  );
}
