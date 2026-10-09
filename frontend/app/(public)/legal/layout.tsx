'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Scale, Shield, Database, Trash2, FileText, ChevronRight } from 'lucide-react';
import config from '@/lib/config';
import Image from 'next/image';

const LEGAL_PAGES = [
  { href: '/legal/cgu', label: 'Conditions Générales d\'Utilisation', icon: Scale },
  { href: '/legal/privacy', label: 'Politique de confidentialité', icon: Shield },
  { href: '/legal/mentions-legales', label: 'Mentions Légales', icon: FileText },
  { href: '/legal/data-retention', label: 'Conservation des données', icon: Database },
  { href: '/legal/data-deletion', label: 'Politique de suppression', icon: Trash2 },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4 px-3">
                Documentation légale
              </h3>
              <nav className="space-y-1">
                {LEGAL_PAGES.map((page) => {
                  const isActive = pathname === page.href;
                  const Icon = page.icon;
                  return (
                    <Link
                      key={page.href}
                      href={page.href}
                      className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        {page.label}
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-indigo-600" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-indigo max-w-4xl prose-headings:font-bold prose-h1:text-3xl prose-h1:tracking-tight prose-h1:text-gray-900 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-indigo-600">
              {children}
            </div>
            
            <div className="mt-16 pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Vous avez des questions concernant ces documents ? <Link href="/contact" className="text-indigo-600 hover:underline">Contactez notre équipe légale</Link>.
              </p>
            </div>
          </main>
          
        </div>
      </div>
    </div>
  );
}
