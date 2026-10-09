'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { usePlans } from '@/lib/hooks/usePlans';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';

export default function TarifsPage() {
  const { getPlanByCode, loading } = usePlans();
  const freePlan = getPlanByCode('free');
  const proPlan = getPlanByCode('pro_14');
  const singlePlan = getPlanByCode('single');

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Decorative Header Background */}
      <section className="bg-background-subtle border-b border-border pt-24 pb-16">
        <PageContainer variant="public">
          <div className="text-center max-w-column mx-auto">
            <h1 className="text-ui-4xl font-bold text-text-primary tracking-tight mb-5 leading-[1.15]">
              Des tarifs <span className="text-primary">simples et transparents</span>
            </h1>
            <p className="text-ui-base text-text-secondary max-w-form mx-auto font-medium">
              Boostez votre carrière avec nos outils premium accessibles à tous.
              Aucun frais caché, annulez quand vous voulez.
            </p>
          </div>
        </PageContainer>
      </section>

      <main className="py-20 flex-1 bg-background">
        <PageContainer variant="public">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-public mx-auto">
              
              {/* Gratuit */}
              <div className="bg-background p-8 rounded-panel border border-border flex flex-col hover:border-primary/50 transition-colors">
                <h3 className="text-ui-lg font-bold text-text-primary mb-2">Gratuit</h3>
                <p className="text-ui-sm text-text-secondary mb-6">Les bases pour centraliser votre parcours.</p>
                <div className="text-ui-3xl font-bold text-text-primary mb-8">
                  {freePlan ? `${freePlan.price} ${freePlan.currency}` : '0 XOF'}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Profil professionnel central', 
                    'CV et Lettres (thèmes de base)', 
                    'Analyse d\'offre', 
                    'Générations limitées'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-ui-sm text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" passHref>
                  <Button variant="secondary" fullWidth>Commencer gratuitement</Button>
                </Link>
              </div>

              {/* Plus (PRO) */}
              <div className="bg-background p-8 rounded-panel border-2 border-primary flex flex-col relative md:-translate-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-ui-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Le plus populaire
                </div>
                <h3 className="text-ui-lg font-bold text-text-primary mb-2">Carriey PRO</h3>
                <p className="text-ui-sm text-text-secondary mb-6">L'outil ultime pour multiplier vos candidatures.</p>
                <div className="text-ui-3xl font-bold text-text-primary mb-8">
                  {proPlan ? `${proPlan.price} ${proPlan.currency}` : '1 500 XOF'}
                  <span className="text-ui-sm font-normal text-text-muted">/{proPlan ? `${proPlan.duration_days} jours` : 'mois'}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Tout du plan Gratuit', 
                    'Tous les modèles premium', 
                    'IA : Adaptation experte aux offres', 
                    'Export PDF Haute Qualité', 
                    'Profil public (Bientôt)'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-ui-sm text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register?plan=pro" passHref>
                  <Button variant="primary" fullWidth>Passer en PRO</Button>
                </Link>
              </div>

              {/* Pro / Entreprise (Achat Unique) */}
              <div className="bg-background p-8 rounded-panel border border-border flex flex-col hover:border-primary/50 transition-colors">
                <h3 className="text-ui-lg font-bold text-text-primary mb-2">Achat unique</h3>
                <p className="text-ui-sm text-text-secondary mb-6">Pour un besoin ponctuel et précis.</p>
                <div className="text-ui-3xl font-bold text-text-primary mb-8">
                  Dès {singlePlan ? `${singlePlan.price} ${singlePlan.currency}` : '2 000 XOF'}
                  <span className="text-ui-sm font-normal text-text-muted">/modèle</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Débloque ce modèle à vie', 
                    'Génération IA de base (lettre incluse)', 
                    'Export PDF illimité', 
                    'Profil professionnel central'
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-ui-sm text-text-primary">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> 
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/modeles" passHref>
                  <Button variant="secondary" fullWidth>Voir les modèles</Button>
                </Link>
              </div>

            </div>
          )}
        </PageContainer>
      </main>
    </div>
  );
}
