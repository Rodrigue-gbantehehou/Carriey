'use client';

import Link from 'next/link';
import Image from 'next/image';
import config from '@/lib/config';

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 py-8 sm:py-10 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <Image src={config.appLogo} alt={config.appName} width={36} height={36} className="object-contain transition-transform group-hover:scale-105" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">{config.appName}</span>
            </Link>
            <p className="text-gray-500 mb-8 max-w-sm text-sm font-medium leading-relaxed">
              Votre parcours professionnel, centralisé. Créez des documents qui reflètent votre vraie valeur.
            </p>
            <div className="flex gap-4">
              {/**/}
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cta transition-colors cursor-pointer">
                <span className="text-xs font-bold">In</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cta transition-colors cursor-pointer">
                <span className="text-xs font-bold">Fb</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cta transition-colors cursor-pointer">
                <span className="text-xs font-bold">Tw</span>
              </div>

            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li><Link href="/modeles" className="hover:text-indigo-600 transition-colors">Modèles de CV</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-600 transition-colors">Tarifs & Plans</Link></li>
              <li><Link href="/faq" className="hover:text-indigo-600 transition-colors">Foire Aux Questions</Link></li>
              <li><Link href="/register" className="hover:text-indigo-600 transition-colors">Créer mon profil</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-widest">Support & Contact</h4>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li><Link href="/contact" className="hover:text-indigo-600 transition-colors">Nous contacter</Link></li>
              <li><Link href="/faq" className="hover:text-indigo-600 transition-colors">Aide en ligne</Link></li>
              {/*
              <li><span className="block text-gray-400">Abidjan, Côte d&apos;Ivoire</span></li>
              <li><span className="block text-gray-400">contact@carriey.com</span></li>
              */}
            </ul>
          </div>
        </div>

        <div className="pt-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} {config.appName}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium justify-center">
            <Link href="/legal/cgu" className="hover:text-indigo-600 transition-colors">CGU</Link>
            <Link href="/legal/privacy" className="hover:text-indigo-600 transition-colors">Confidentialité</Link>
            <Link href="/legal/mentions-legales" className="hover:text-indigo-600 transition-colors">Mentions Légales</Link>
            <Link href="/legal/data-retention" className="hover:text-indigo-600 transition-colors">Conservation</Link>
            <Link href="/legal/data-deletion" className="hover:text-indigo-600 transition-colors">Suppression</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
