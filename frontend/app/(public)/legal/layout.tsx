'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Scale, Shield, Database, Trash2, FileText, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';

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
    <div className="min-h-screen bg-background">
      <PageContainer variant="public">
        <div className="flex flex-col lg:flex-row gap-12 py-12 lg:py-16">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-ui-xs font-semibold text-text-primary uppercase tracking-wider mb-4 px-3">
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
                      className={`group flex items-center justify-between px-3 py-2.5 text-ui-sm font-medium rounded-panel transition-colors ${
                        isActive
                          ? 'bg-background-subtle text-primary border border-border'
                          : 'text-text-secondary hover:bg-background-subtle hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`} />
                        {page.label}
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-primary" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="prose max-w-column prose-headings:font-bold prose-h1:text-ui-3xl prose-h1:tracking-tight prose-h1:text-text-primary prose-h2:text-ui-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-text-secondary prose-p:leading-relaxed prose-li:text-text-secondary prose-strong:text-text-primary prose-a:text-primary">
              {children}
            </div>
            
            <div className="mt-16 pt-8 border-t border-border">
              <p className="text-ui-sm text-text-muted">
                Vous avez des questions concernant ces documents ? <Link href="/contact" className="text-primary hover:underline">Contactez notre équipe légale</Link>.
              </p>
            </div>
          </main>
          
        </div>
      </PageContainer>
    </div>
  );
}
