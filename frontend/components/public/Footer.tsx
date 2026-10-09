'use client';

import Link from 'next/link';
import Image from 'next/image';
import config from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-background text-text-primary py-8 sm:py-10 border-t border-border">
      <div className="max-w-public mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <Image src={config.appLogo} alt={config.appName} width={36} height={36} className="object-contain transition-transform group-hover:scale-105" />
              <span className="text-ui-xl font-bold text-text-primary tracking-tight">{config.appName}</span>
            </Link>
            <p className="text-text-secondary mb-8 max-w-sm text-ui-sm font-medium leading-relaxed">
              Votre parcours professionnel, centralisé. Créez des documents qui reflètent votre vraie valeur.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6 text-ui-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-text-secondary text-ui-sm font-medium">
              <li><Link href="/#modeles" className="hover:text-primary transition-colors">Modèles de CV</Link></li>
              <li><Link href="/#tarifs" className="hover:text-primary transition-colors">Tarifs & Plans</Link></li>
              <li><Link href="/#faq" className="hover:text-primary transition-colors">Foire Aux Questions</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Créer mon profil</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text-primary mb-6 text-ui-sm uppercase tracking-widest">Support & Contact</h4>
            <ul className="space-y-4 text-text-secondary text-ui-sm font-medium">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Nous contacter</Link></li>
              <li><Link href="/#faq" className="hover:text-primary transition-colors">Aide en ligne</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-5 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-muted text-ui-sm font-medium">
            © {new Date().getFullYear()} {config.appName}
          </p>
          <div className="flex flex-wrap gap-4 text-ui-sm text-text-secondary font-medium justify-center">
            <Link href="/legal/cgu" className="hover:text-primary transition-colors">CGU</Link>
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
            <Link href="/legal/mentions-legales" className="hover:text-primary transition-colors">Mentions Légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
