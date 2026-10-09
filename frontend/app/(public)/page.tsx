"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import TemplatePreview from '@/components/public/TemplatePreview';
import config from '@/lib/config';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import {
  ChevronRight, FileText, UserCircle, Globe,
  LayoutTemplate, GraduationCap, Briefcase, Rocket, Globe2, CheckCircle2, ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/templates`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setTemplates(data.length > 0 ? [...data, ...data] : []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;

    const scroll = (time: number) => {
      if (!isCarouselHovered && carouselRef.current && templates.length > 0) {
        if (time - lastTime > 16) {
          carouselRef.current.scrollLeft += 1;
          if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
            carouselRef.current.scrollLeft = 0;
          }
          lastTime = time;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isCarouselHovered, templates]);

  const fallbackThemes = [
    { name: 'Moderne' },
    { name: 'Élégant' },
    { name: 'Minimal' },
    { name: 'Créatif' },
    { name: 'Corporate' },
    { name: 'Tokyo' }
  ];

  const carouselItems = templates.length > 0
    ? templates.map((t, i) => ({
      name: t.name,
      originalTemplate: t
    }))
    : fallbackThemes.map(t => ({ ...t, originalTemplate: null }));

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      {/* 2. Hero Section */}
      <main className="relative flex items-center py-20 border-b border-border overflow-hidden bg-background-subtle">
        {/* Visible grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <PageContainer variant="public">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* Left: Copy */}
            <div className="max-w-form animate-fade-in">
              <h1 className="text-ui-3xl lg:text-ui-4xl font-bold text-text-primary leading-tight mb-6">
                Votre parcours professionnel en <br />
                <span className="text-primary">Un seul endroit.</span>
              </h1>
              <p className="text-ui-base text-text-secondary mb-8">
                Créez votre profil professionnel une fois et utilisez-le pour construire des documents adaptés à chaque opportunité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" passHref>
                  <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />}>
                    Créer mon profil gratuitement
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Concept Visual (Restored and tokenized) */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col items-center">
                {/* Profile Node (SaaS Window style) */}
                <div className="w-64 bg-background rounded-panel border border-border overflow-hidden relative z-10 mb-5 shadow-lg">
                  {/* Window Header */}
                  <div className="bg-background-subtle border-b border-border px-3 py-2.5 flex items-center gap-1.5">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-border"></div>
                      <div className="w-2 h-2 rounded-full bg-border"></div>
                      <div className="w-2 h-2 rounded-full bg-border"></div>
                    </div>
                    <div className="mx-auto text-[9px] font-semibold text-text-muted tracking-widest uppercase">Profil Professionnel</div>
                  </div>

                  {/* Window Content (Abstract UI Skeleton) */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-background-subtle border border-border rounded-panel flex items-center justify-center text-primary shadow-sm shrink-0">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 bg-border rounded w-2/3"></div>
                        <div className="h-2 bg-background-subtle border border-border rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="h-2 bg-border rounded w-1/4 mb-2"></div>
                        <div className="h-6 bg-background-subtle rounded-panel border border-border w-full"></div>
                      </div>
                      <div>
                        <div className="h-2 bg-border rounded w-1/4 mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-4 w-10 bg-background-subtle rounded border border-border"></div>
                          <div className="h-4 w-12 bg-background-subtle rounded border border-border"></div>
                          <div className="h-4 w-10 bg-background-subtle rounded border border-border"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Connecting Arrows */}
                <div className="relative w-full h-14 flex justify-center mb-2 z-0">
                  <svg width="220" height="56" viewBox="0 0 220 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0">
                    <path d="M110 0 V 20" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M30 20 H 190" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M30 20 V 56" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M110 20 V 56" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M190 20 V 56" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Arrowheads */}
                    <path d="M27 52 L 30 56 L 33 52" fill="#94A3B8" />
                    <path d="M107 52 L 110 56 L 113 52" fill="#94A3B8" />
                    <path d="M187 52 L 190 56 L 193 52" fill="#94A3B8" />
                  </svg>
                </div>

                {/* Output Nodes */}
                <div className="flex gap-4 relative z-10 w-[220px] justify-between">
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 bg-background border border-border rounded-panel shadow-sm flex items-center justify-center text-primary transition-transform group-hover:-translate-y-1">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wide">CV</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 bg-background border border-border rounded-panel shadow-sm flex items-center justify-center text-primary transition-transform group-hover:-translate-y-1">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wide">Lettre</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 bg-background border border-border rounded-panel shadow-sm flex items-center justify-center text-primary transition-transform group-hover:-translate-y-1">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wide">Profil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </main>

      {/* 3. Comment ça fonctionne (3 étapes) */}
      <section id="fonctionnement" className="py-16 bg-background border-b border-border">
        <PageContainer variant="public">
          <div className="text-center max-w-column mx-auto mb-12">
            <h2 className="text-ui-2xl font-bold text-text-primary mb-4">
              Comment ça fonctionne
            </h2>
            <p className="text-ui-base text-text-secondary">
              Trois étapes simples pour reprendre le contrôle de votre carrière.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-background-subtle border border-border rounded-full flex items-center justify-center mb-6 text-ui-xl font-bold text-primary">
                1
              </div>
              <h3 className="text-ui-lg font-bold text-text-primary mb-3">Construisez votre profil</h3>
              <p className="text-ui-sm text-text-secondary">
                Ajoutez votre expérience, vos formations, vos compétences et vos réalisations une seule fois.
              </p>
            </div>
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-background-subtle border border-border rounded-full flex items-center justify-center mb-6 text-ui-xl font-bold text-primary">
                2
              </div>
              <h3 className="text-ui-lg font-bold text-text-primary mb-3">Choisissez votre support</h3>
              <p className="text-ui-sm text-text-secondary">
                Générez instantanément CV, lettre de motivation ou page publique selon vos besoins.
              </p>
            </div>
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-background-subtle border border-border rounded-full flex items-center justify-center mb-6 text-ui-xl font-bold text-primary">
                3
              </div>
              <h3 className="text-ui-lg font-bold text-text-primary mb-3">Adaptez et exportez</h3>
              <p className="text-ui-sm text-text-secondary">
                Ajustez le contenu pour une offre précise, choisissez un thème et exportez en PDF.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 7. Les thèmes */}
      <section id="modeles" className="py-16 bg-background-subtle border-b border-border overflow-hidden">
        <PageContainer variant="public">
          <div className="text-center max-w-column mx-auto mb-10">
            <h2 className="text-ui-2xl font-bold text-text-primary mb-4">
              Votre contenu. Votre style.
            </h2>
            <p className="text-ui-base text-text-secondary">
              Changez de présentation en un clic sans jamais retaper vos informations.
            </p>
          </div>

          <div
            ref={carouselRef}
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            onTouchStart={() => setIsCarouselHovered(true)}
            onTouchEnd={() => setIsCarouselHovered(false)}
            className="flex gap-6 overflow-x-auto pb-4 pt-4 no-scrollbar cursor-pointer"
          >
            {carouselItems.map((theme, i) => (
              <div key={i} className={`flex-shrink-0 w-[240px] sm:w-[280px] bg-background rounded-panel border border-border flex flex-col`}>
                <div className="relative w-full aspect-[1/1.414] overflow-hidden rounded-t-panel border-b border-border bg-gray-50">
                  {theme.originalTemplate ? (
                    <TemplatePreview template={theme.originalTemplate} />
                  ) : (
                    <div className="p-4 opacity-50">
                      <div className="w-1/3 h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
                      <div className="w-5/6 h-2 bg-gray-200 rounded mb-4"></div>
                      <div className="w-1/2 h-2 bg-gray-300 rounded mb-2"></div>
                    </div>
                  )}
                </div>
                <div className="p-3 text-center text-ui-sm font-semibold text-text-primary">
                  {theme.name}
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* 8. Pour qui ? */}
      <section className="py-16 bg-background border-b border-border">
        <PageContainer variant="public">
          <h2 className="text-ui-2xl font-bold text-text-primary text-center mb-10">
            Quel que soit votre profil.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: 'Étudiant', desc: 'Premier CV ou recherche de stage.' },
              { icon: Briefcase, title: 'Professionnel', desc: 'Mettez votre expérience à jour.' },
              { icon: Rocket, title: 'En reconversion', desc: 'Présentez votre nouveau parcours.' },
              { icon: UserCircle, title: 'Indépendant', desc: 'Présentez vos compétences et projets.' },
              { icon: Globe2, title: 'À la recherche d\'opportunités', desc: 'Adaptez votre candidature à chaque offre.' }
            ].map((persona, i) => (
              <div key={i} className="bg-background-subtle p-6 rounded-panel border border-border flex flex-col gap-3">
                <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center text-primary">
                  <persona.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary mb-1">{persona.title}</h3>
                  <p className="text-ui-sm text-text-secondary">{persona.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* 10. Tarification */}
      <section id="tarifs" className="py-16 bg-background-subtle border-b border-border">
        <PageContainer variant="public">
          <div className="text-center max-w-column mx-auto mb-12">
            <h2 className="text-ui-2xl font-bold text-text-primary mb-4">
              Des tarifs simples et transparents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-public mx-auto">
            {/* Gratuit */}
            <div className="bg-background p-8 rounded-panel border border-border flex flex-col">
              <h3 className="text-ui-lg font-bold text-text-primary mb-2">Gratuit</h3>
              <p className="text-ui-sm text-text-secondary mb-6">Les bases pour centraliser votre parcours.</p>
              <div className="text-ui-3xl font-bold text-text-primary mb-8">0 XOF</div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Profil professionnel central', 'CV et Lettres (thèmes de base)', 'Générations limitées'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-ui-sm text-text-primary">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" passHref>
                <Button variant="secondary" fullWidth>Commencer</Button>
              </Link>
            </div>

            {/* Plus */}
            <div className="bg-background p-8 rounded-panel border-2 border-primary flex flex-col relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-ui-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommandé
              </div>
              <h3 className="text-ui-lg font-bold text-text-primary mb-2">Carriey PRO</h3>
              <p className="text-ui-sm text-text-secondary mb-6">Multipliez vos candidatures.</p>
              <div className="text-ui-3xl font-bold text-text-primary mb-8">
                3 500 XOF<span className="text-ui-sm font-normal text-text-muted">/mois</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Tout du plan Gratuit', 'Tous les modèles premium', 'Adaptation experte aux offres', 'Export PDF illimité'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-ui-sm text-text-primary">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" passHref>
                <Button variant="primary" fullWidth>Découvrir</Button>
              </Link>
            </div>

            {/* Pro / Entreprise */}
            <div className="bg-background p-8 rounded-panel border border-border flex flex-col">
              <h3 className="text-ui-lg font-bold text-text-primary mb-2">Achat unique</h3>
              <p className="text-ui-sm text-text-secondary mb-6">Pour un besoin ponctuel.</p>
              <div className="text-ui-3xl font-bold text-text-primary mb-8">
                900 XOF<span className="text-ui-sm font-normal text-text-muted">/modèle</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Débloque ce modèle à vie', 'Génération IA incluse', 'Export PDF illimité'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-ui-sm text-text-primary">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" passHref>
                <Button variant="secondary" fullWidth>Découvrir</Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 11. FAQ */}
      <section id="faq" className="py-16 bg-background border-b border-border">
        <PageContainer variant="form-long">
          <h2 className="text-ui-2xl font-bold text-text-primary text-center mb-10">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Carriey est-il gratuit ?",
                a: "Oui, les fonctionnalités essentielles du profil sont accessibles gratuitement."
              },
              {
                q: "Dois-je refaire mon CV à chaque candidature ?",
                a: "Non. Votre profil reste central et peut servir à produire plusieurs versions."
              },
              {
                q: "Puis-je modifier les documents générés ?",
                a: "Oui, vous avez le contrôle total pour éditer chaque document avant l'export."
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-border pb-4">
                <h4 className="text-ui-sm font-semibold text-text-primary mb-2">{faq.q}</h4>
                <p className="text-ui-sm text-text-secondary">{faq.a}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* 12. Dernier CTA */}
      <section className="py-24 bg-background-subtle text-center">
        <PageContainer variant="public">
          <div className="max-w-form mx-auto">
            <h2 className="text-ui-2xl font-bold text-text-primary mb-4">Votre parcours mérite plus qu'un seul CV.</h2>
            <p className="text-ui-base text-text-secondary mb-8">Créez votre profil gratuitement et commencez à construire vos documents professionnels.</p>
            <Link href="/register" passHref>
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}