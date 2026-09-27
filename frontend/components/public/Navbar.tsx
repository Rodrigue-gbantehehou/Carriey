'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import config from '@/lib/config';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const logout = () => signOut({ callbackUrl: '/login' });

  // Ne pas afficher la navbar sur les pages d'auth
  if (['/login', '/register', '/forgot-password'].includes(pathname)) {
    return null;
  }

  const navLinks = [
    { name: 'Fonctionnement', href: '/#fonctionnement' },
    { name: 'Modèles', href: '/#modeles' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src={config.appLogo} alt={config.appName} width={36} height={36} className="object-contain transition-transform group-hover:scale-105" priority />
            <span className="text-xl font-bold text-gray-900 tracking-tight">{config.appName}</span>
          </Link>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-semibold transition-colors ${
                pathname === link.href ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user?.role && ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(user.role) && (
            <Link
              href="/admin"
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right: Auth & Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">{user.name || user.email?.split('@')[0]}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Link href="/accueil" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    Mon Profil
                  </Link>
                  <span className="text-gray-300 text-xs">•</span>
                  <button onClick={logout} className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">
                    Déconnexion
                  </button>
                </div>
              </div>
              <Link
                href="/accueil"
                className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all text-sm"
              >
                Mon Espace
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2.5 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all text-sm"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all text-sm"
              >
                Commencer gratuitement
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden flex-1 justify-end">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-6 shadow-xl absolute w-full left-0">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="block text-lg font-semibold text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" className="w-full py-3 bg-gray-900 text-white text-center font-semibold rounded-xl">Mon Espace</Link>
                  <Link href="/profil" className="w-full py-3 bg-indigo-50 text-indigo-700 text-center font-semibold rounded-xl">Mon Profil</Link>
                  <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 text-center font-semibold rounded-xl">Déconnexion</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full py-3 bg-white text-gray-900 text-center font-semibold rounded-xl border border-gray-200">Connexion</Link>
                  <Link href="/register" className="w-full py-3 bg-indigo-600 text-white text-center font-semibold rounded-xl">Commencer</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
