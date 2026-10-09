'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import config from '@/lib/config';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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
    { name: 'Tarifs', href: '/#tarifs' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="max-w-public mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex flex-1 items-center justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src={config.appLogo} alt={config.appName} width={36} height={36} className="object-contain transition-transform group-hover:scale-105" priority />
            <span className="text-ui-xl font-bold text-text-primary tracking-tight">{config.appName}</span>
          </Link>
        </div>

        {/* Center: Links */}
        <div className="hidden md:flex items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-ui-sm font-semibold transition-colors ${
                pathname === link.href ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user?.role && ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(user.role) && (
            <Link
              href="/admin"
              className="text-ui-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right: Auth & Actions */}
        <div className="hidden md:flex flex-1 items-center justify-end gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profil" passHref>
                <Button>Mon Profil</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" passHref>
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link href="/register" passHref>
                <Button>Commencer gratuitement</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden flex-1 justify-end">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-muted hover:bg-background-subtle rounded-lg transition-colors"
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
        <div className="md:hidden bg-background border-b border-border px-4 py-6 shadow-xl absolute w-full left-0">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="block text-ui-lg font-semibold text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-6 border-t border-border flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/profil" passHref><Button fullWidth>Mon Profil</Button></Link>
                  <Button variant="danger" fullWidth onClick={logout}>Déconnexion</Button>
                </>
              ) : (
                <>
                  <Link href="/login" passHref><Button variant="secondary" fullWidth>Connexion</Button></Link>
                  <Link href="/register" passHref><Button fullWidth>Commencer</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

