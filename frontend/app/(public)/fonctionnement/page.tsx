import { Metadata } from 'next'
import Link from 'next/link'
import config from '@/lib/config'
import { PageContainer } from '@/components/ui/PageContainer'
import { Button } from '@/components/ui/Button'
import { UserCircle, FileText, LayoutTemplate, Globe, Sparkles, Download, ArrowRight, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: `Comment ça marche | ${config.appName}`,
  description: 'Découvrez comment construire votre profil unique et générer vos CV, lettres de motivation et pages publiques instantanément.',
}

export default function FonctionnementPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* ── HERO ── */}
      <section className="pt-24 pb-16 border-b border-border bg-background-subtle">
        <PageContainer variant="public">
          <div className="max-w-column mx-auto text-center">
            <h1 className="text-ui-4xl font-bold text-text-primary mb-5">
              Un profil unique.<br />
              <span className="text-primary">Des possibilités infinies.</span>
            </h1>
            <p className="text-ui-base text-text-secondary mb-8 font-medium leading-relaxed max-w-2xl mx-auto">
              Découvrez comment {config.appName} réinvente votre recherche d'emploi. Renseignez vos informations une seule fois et générez tous vos documents de candidature en un clic.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register" passHref>
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Commencer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── STEPS ── */}
      <section className="py-20 bg-background">
        <PageContainer variant="public">
          <div className="space-y-24">
            
            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-12 h-12 bg-background-subtle border border-border rounded-full flex items-center justify-center text-ui-xl font-bold text-primary mb-6">
                  1
                </div>
                <h2 className="text-ui-3xl font-bold text-text-primary mb-4">Construisez votre Profil Master</h2>
                <p className="text-ui-base text-text-secondary leading-relaxed mb-6">
                  Fini le temps où vous deviez retaper vos expériences à chaque nouvelle candidature. Avec {config.appName}, vous créez une base de données centralisée de votre parcours.
                </p>
                <ul className="space-y-3">
                  {[
                    "Expériences professionnelles détaillées",
                    "Formations et diplômes",
                    "Compétences techniques et soft-skills",
                    "Langues et centres d'intérêt"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-text-primary font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-background-subtle border border-border rounded-panel p-8 flex items-center justify-center min-h-[300px]">
                <div className="w-20 h-20 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                  <UserCircle className="w-10 h-10 text-primary" />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="bg-background-subtle border border-border rounded-panel p-8 flex items-center justify-center min-h-[300px]">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-background border border-border rounded-panel flex items-center justify-center shadow-sm">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-ui-xs font-bold text-text-muted uppercase">CV</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-background border border-border rounded-panel flex items-center justify-center shadow-sm">
                      <LayoutTemplate className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-ui-xs font-bold text-text-muted uppercase">Lettre</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-background border border-border rounded-panel flex items-center justify-center shadow-sm">
                      <Globe className="w-8 h-8 text-primary" />
                    </div>
                    <span className="text-ui-xs font-bold text-text-muted uppercase">Page</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="w-12 h-12 bg-background-subtle border border-border rounded-full flex items-center justify-center text-ui-xl font-bold text-primary mb-6">
                  2
                </div>
                <h2 className="text-ui-3xl font-bold text-text-primary mb-4">Choisissez votre support</h2>
                <p className="text-ui-base text-text-secondary leading-relaxed mb-6">
                  Une fois votre profil complété, générez instantanément le document dont vous avez besoin. Sélectionnez l'un de nos nombreux modèles professionnels optimisés.
                </p>
                <ul className="space-y-3">
                  {[
                    "Modèles de CV optimisés ATS",
                    "Génération de lettres de motivation via IA",
                    "Création de pages publiques (Portfolio)",
                    "Designs adaptatifs et personnalisables"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-text-primary font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="w-12 h-12 bg-background-subtle border border-border rounded-full flex items-center justify-center text-ui-xl font-bold text-primary mb-6">
                  3
                </div>
                <h2 className="text-ui-3xl font-bold text-text-primary mb-4">Adaptez et exportez</h2>
                <p className="text-ui-base text-text-secondary leading-relaxed mb-6">
                  Chaque candidature est unique. Utilisez nos outils pour ajuster votre document en fonction de l'offre d'emploi ciblée, puis exportez-le dans la meilleure qualité.
                </p>
                <ul className="space-y-3">
                  {[
                    "Adaptation automatique des mots-clés par IA",
                    "Glisser-déposer pour réorganiser vos sections",
                    "Export PDF Haute Définition",
                    "Partage par lien public sécurisé"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-text-primary font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2 bg-background-subtle border border-border rounded-panel p-8 flex flex-col items-center justify-center min-h-[300px] gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-text-muted" />
                  <div className="w-14 h-14 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                    <Download className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </PageContainer>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-20 bg-background-subtle border-t border-border">
        <PageContainer variant="form-long">
          <div className="text-center">
            <h2 className="text-ui-3xl font-bold text-text-primary tracking-tight mb-5">
              Prêt à simplifier vos candidatures ?
            </h2>
            <p className="text-ui-base text-text-secondary mb-8">
              Rejoignez des milliers de professionnels qui gagnent un temps précieux avec {config.appName}.
            </p>
            <div className="flex justify-center">
              <Link href="/register" passHref>
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Créer mon profil gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}
