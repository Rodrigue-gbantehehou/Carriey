'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  ChevronLeft,
  Info,
} from 'lucide-react';

import { useProfileStore } from '@/store/profile';
import { getProfileCompletion, getCompletionLabel } from '@/lib/profile-utils';
import {
  PageHeader,
  Button,
  Badge,
  ProfileCompletionRing,
} from '@/components/ui';

export default function AnalysePage() {
  const { profile } = useProfileStore();
  const score = getProfileCompletion(profile);
  const label = getCompletionLabel(score);

  // Analyse des forces structurelles
  const strengths: { title: string; desc: string }[] = [];
  if (profile?.title) {
    strengths.push({
      title: 'Titre professionnel précis',
      desc: `Le titre « ${profile.title} » positionne immédiatement votre profil pour les recruteurs et les algorithmes de recherche.`,
    });
  }
  if ((profile?.experiences?.length || 0) > 0) {
    strengths.push({
      title: 'Parcours documenté',
      desc: `Vous avez renseigné ${profile?.experiences?.length} expérience(s), offrant une chronologie crédible de votre carrière.`,
    });
  }
  if ((profile?.skills?.length || 0) >= 3) {
    strengths.push({
      title: 'Compétences identifiées',
      desc: `Vos ${profile?.skills?.length} compétences déclarées facilitent le ciblage de vos candidatures.`,
    });
  }
  if (profile?.bio && profile.bio.length > 50) {
    strengths.push({
      title: 'Présentation professionnelle détaillée',
      desc: 'Votre résumé permet de comprendre rapidement vos ambitions et votre valeur ajoutée.',
    });
  }
  if (strengths.length === 0) {
    strengths.push({
      title: 'Profil en cours de configuration',
      desc: 'Complétez les sections fondamentales pour faire ressortir vos atouts.',
    });
  }

  // Analyse des axes d'amélioration
  const weaknesses: { title: string; desc: string }[] = [];
  if (!profile?.title) {
    weaknesses.push({
      title: 'Titre manquant',
      desc: 'Définissez clairement votre métier ou poste ciblé (ex: Ingénieur DevOps, Chef de projet).',
    });
  }
  if ((profile?.experiences?.length || 0) === 0) {
    weaknesses.push({
      title: 'Expériences professionnelles non renseignées',
      desc: 'L’historique professionnel est le critère numéro 1 consulté par les employeurs.',
    });
  }
  if (!profile?.bio || profile.bio.length < 50) {
    weaknesses.push({
      title: 'Résumé professionnel trop succinct',
      desc: 'Rédigez 3 à 4 lignes pour présenter votre parcours et votre expertise clé.',
    });
  }
  if ((profile?.skills?.length || 0) < 4) {
    weaknesses.push({
      title: 'Volume de compétences insuffisant',
      desc: 'Ajoutez au moins 5 à 8 compétences techniques et comportementales.',
    });
  }
  if ((profile?.certifications?.length || 0) === 0) {
    weaknesses.push({
      title: 'Aucune certification ou diplôme récent',
      desc: 'Les certifications attestent de votre formation continue.',
    });
  }
  if (weaknesses.length === 0) {
    weaknesses.push({
      title: 'Profil structurellement complet',
      desc: 'Votre profil maître dispose de toutes les fondations nécessaires.',
    });
  }

  const recommendations = weaknesses
    .filter((w) => w.title !== 'Profil structurellement complet')
    .slice(0, 3);

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      <PageHeader
        title="Diagnostic du profil"
        description="Mesure de complétude et recommandations pour optimiser l'impact de vos documents."
        actions={
          <Link href="/accueil">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Retour à l&apos;accueil
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Score Card avec ProfileCompletionRing */}
        <div className="md:col-span-4 bg-background rounded-panel border border-border shadow-sm p-6 flex flex-col items-center text-center">
          <div className="mb-5">
            <ProfileCompletionRing
              value={score}
              size={130}
              strokeWidth={8}
              unit="/100"
            />
          </div>

          <h2 className="text-ui-lg font-semibold text-text-primary mb-2">
            {label}
          </h2>
          <p className="text-ui-sm text-text-secondary leading-relaxed">
            {score >= 80
              ? 'Votre profil présente une excellente structure et valorise efficacement vos compétences.'
              : score >= 50
              ? 'Vous disposez d’une bonne base. Quelques ajouts ciblés feront la différence.'
              : 'Complétez les sections manquantes pour rendre vos CV plus percutants.'}
          </p>

          <Link href="/profil" className="w-full mt-6">
            <Button variant="primary" fullWidth size="md">
              Compléter mon profil
            </Button>
          </Link>

          <div className="mt-5 w-full bg-background-subtle rounded-panel p-3 border border-border text-ui-xs text-text-muted leading-relaxed flex items-start gap-2 text-left">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Ce score reflète la complétude factuelle de votre profil maître, sans simulation artificielle.
            </span>
          </div>
        </div>

        {/* Détails : Forces, Améliorations & Recommandations */}
        <div className="md:col-span-8 space-y-6">
          {/* Points forts */}
          <div className="bg-background rounded-panel border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-ui-base font-semibold text-text-primary flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-text shrink-0" />
                Points forts identifiés
              </h3>
              <Badge variant="success" size="sm">
                {strengths.length} atout{strengths.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <ul className="space-y-4">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success-bg flex items-center justify-center shrink-0 mt-0.5 border border-success-text/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-text" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-ui-sm font-semibold text-text-primary">
                      {str.title}
                    </h4>
                    <p className="text-ui-xs text-text-secondary mt-0.5 leading-relaxed">
                      {str.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Axes d'amélioration */}
          <div className="bg-background rounded-panel border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-ui-base font-semibold text-text-primary flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-text shrink-0" />
                Axes d&apos;amélioration
              </h3>
              <Badge variant="warning" size="sm">
                {weaknesses.length} point{weaknesses.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <ul className="space-y-4">
              {weaknesses.map((wk, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-warning-bg flex items-center justify-center shrink-0 mt-0.5 border border-warning-text/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning-text" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-ui-sm font-semibold text-text-primary">
                      {wk.title}
                    </h4>
                    <p className="text-ui-xs text-text-secondary mt-0.5 leading-relaxed">
                      {wk.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions recommandées directes */}
          {recommendations.length > 0 && (
            <div className="bg-background-subtle rounded-panel border border-border p-6">
              <h3 className="text-ui-base font-semibold text-text-primary flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                Actions recommandées pour progresser
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <Link
                    key={idx}
                    href="/profil"
                    className="flex items-center justify-between bg-background p-4 rounded-panel border border-border hover:border-primary/40 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-ui-sm text-text-primary font-medium truncate">
                        {rec.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary shrink-0 ml-3 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
