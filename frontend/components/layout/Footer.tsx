'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-text text-white py-6 sm:py-8 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-brand-cta rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">CVTor</span>
            </Link>
            <p className="text-gray-400 mb-8 max-w-sm text-sm font-medium leading-relaxed">
              Créer des CV professionnels qui attirent l&apos;attention des recruteurs. Propulsé par l&apos;IA et adapté aux réalités locales.
            </p>
            <div className="flex gap-4">
              {/*
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cta transition-colors cursor-pointer">
                <span className="text-xs font-bold">In</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cta transition-colors cursor-pointer">
                <span className="text-xs font-bold">Fb</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-cta transition-colors cursor-pointer">
                <span className="text-xs font-bold">Tw</span>
              </div>
              */}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link href="/modeles" className="hover:text-brand-cta transition-colors">Modèles de CV</Link></li>
              <li><Link href="/tarifs" className="hover:text-brand-cta transition-colors">Tarifs & Plans</Link></li>
              <li><Link href="/faq" className="hover:text-brand-cta transition-colors">Foire Aux Questions</Link></li>
              <li><Link href="/editor" className="hover:text-brand-cta transition-colors">Créer mon CV</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Support & Contact</h4>
            <ul className="space-y-4 text-gray-400 text-sm font-medium">
              <li><Link href="/contact" className="hover:text-brand-cta transition-colors">Nous contacter</Link></li>
              <li><Link href="/faq" className="hover:text-brand-cta transition-colors">Aide en ligne</Link></li>
              {/*
              <li><span className="block text-white/40">Abidjan, Côte d&apos;Ivoire</span></li>
              <li><span className="block text-white/40">contact@cvtor.pro</span></li>
              */}
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm font-medium">
            © 2026 CVTor
          </p>
          {/*
          <div className="flex gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
          </div>
          */}
        </div>
      </div>
    </footer>
  );
}
