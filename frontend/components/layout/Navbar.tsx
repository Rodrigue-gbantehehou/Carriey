'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const logout = () => signOut({ callbackUrl: '/login' });

  if (['/login', '/register'].includes(pathname)) {
    return null;
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-cta rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-brand-text tracking-tight">CVTor</span>
          </Link>

          <div className="hidden sm:flex items-center gap-8">
            <Link
              href="/modeles"
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                pathname === '/modeles' ? 'text-brand-cta' : 'text-brand-text/60 hover:text-brand-text'
              }`}
            >
              Modèles
            </Link>
            <Link
              href="/faq"
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                pathname === '/faq' ? 'text-brand-cta' : 'text-brand-text/60 hover:text-brand-text'
              }`}
            >
              FAQ
            </Link>
            <Link
              href="/tarifs"
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                pathname === '/tarifs' ? 'text-brand-cta' : 'text-brand-text/60 hover:text-brand-text'
              }`}
            >
              Tarifs
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-bold uppercase tracking-wider transition-colors ${
                pathname === '/contact' ? 'text-brand-cta' : 'text-brand-text/60 hover:text-brand-text'
              }`}
            >
              Contact
            </Link>
            {user?.role && ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(user.role) && (
              <Link
                href="/admin"
                className="text-sm font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-brand-text">{user.email?.split('@')[0]}</span>
                <button onClick={logout} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors">
                  Déconnexion
                </button>
              </div>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-brand-text text-white font-bold rounded-full hover:bg-black transition-all text-sm"
              >
                Mon Espace
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-white text-brand-text border border-gray-200 font-bold rounded-full hover:bg-gray-50 transition-all text-sm"
              >
                Connexion
              </Link>
              <Link
                href="/onboarding"
                className="px-6 py-2.5 bg-brand-cta text-white font-bold rounded-full hover:bg-brand-cta-hover shadow-lg shadow-emerald-500/20 transition-all text-sm"
              >
                Créer mon CV
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-brand-text/60 hover:bg-gray-100 rounded-lg transition-colors"
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100 px-4 py-6 space-y-4 shadow-xl">
          <Link href="/modeles" className="block text-lg font-bold text-brand-text">Modèles</Link>
          <Link href="/faq" className="block text-lg font-bold text-brand-text">FAQ</Link>
          <Link href="/tarifs" className="block text-lg font-bold text-brand-text">Tarifs</Link>
          <Link href="/contact" className="block text-lg font-bold text-brand-text">Contact</Link>
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="w-full py-3 bg-brand-text text-white text-center font-bold rounded-xl">Mon Espace</Link>
                <button onClick={logout} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl">Déconnexion</button>
              </>
            ) : (
              <>
                <Link href="/login" className="w-full py-3 bg-gray-50 text-brand-text text-center font-bold rounded-xl border border-gray-100">Connexion</Link>
                <Link href="/onboarding" className="w-full py-3 bg-brand-cta text-white text-center font-bold rounded-xl shadow-lg shadow-emerald-500/20">Créer mon CV</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
