'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  FileText,
  ChevronRight,
  CheckCircle2,
  Circle,
  MapPin,
  Eye,
  PenLine,
  Globe,
  Wrench,
  User,
  Sparkles,
  Mailbox,
  Clock,
  ExternalLink,
} from 'lucide-react';

import { useProfileStore } from '@/store/profile';
import { useCvStore } from '@/store/cv';
import { useUiStore } from '@/store/ui';
import { PaywallModal } from '@/components/app/shared/PaywallModal';
import { getProfileCompletion, getCompletionLabel } from '@/lib/profile-utils';
import {
  Button,
  Badge,
  EmptyState,
  ProfileCompletionRing,
} from '@/components/ui';

export default function AccueilPage() {
  const { data: session } = useSession();
  const { profile, setProfile, setLoading } = useProfileStore();
  const { cvs } = useCvStore();
  const { openCreateModal } = useUiStore();

  const [about, setAbout] = useState('');
  const [mounted, setMounted] = useState(false);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [showProPaywall, setShowProPaywall] = useState(false);

  const firstName =
    profile?.first_name ||
    session?.user?.name?.split(' ')[0] ||
    profile?.username ||
    'vous';
  const fullName = session?.user?.name || profile?.username || 'Utilisateur';

  const completion = useMemo(
    () => getProfileCompletion(profile, about),
    [profile, about]
  );
  const completionLabel = useMemo(
    () => getCompletionLabel(completion),
    [completion]
  );

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      if (session?.user?.accessToken) {
        setLoading(true);
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) {
            setProfile(data);
            setAbout(data.bio || '');
          }

          const { candidaturesApi } = await import('@/lib/candidature-api');
          const cands = await candidaturesApi.list(session.user.accessToken);
          setCandidatures(cands || []);
        } catch (err) {
          console.error('Erreur chargement données dashboard', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [session, setProfile, setLoading]);

  if (!mounted) return null;

  // Calcul des statistiques de candidatures réelles
  const stats = {
    en_cours: candidatures.filter((c) =>
      ['brouillon', 'preparation', 'envoyee'].includes(
        c.status?.toLowerCase()
      )
    ).length,
    acceptees: candidatures.filter((c) =>
      ['acceptee', 'entretien', 'offre'].includes(c.status?.toLowerCase())
    ).length,
    attente: candidatures.filter(
      (c) => c.status?.toLowerCase() === 'envoyee'
    ).length,
    refusees: candidatures.filter(
      (c) => c.status?.toLowerCase() === 'refusee'
    ).length,
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      <PaywallModal
        isOpen={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        title="Fonctionnalité PRO"
        description="Le ciblage automatique de CV et l'accès aux modèles premium sont réservés aux abonnés Carriey PRO."
      />

      {/* 1. Hero Banner */}
      <div className="relative w-full rounded-panel overflow-hidden border border-border bg-background-subtle flex flex-col justify-center px-6 md:px-10 py-8 md:py-10 min-h-[170px] md:min-h-[200px]">
        <div className="absolute inset-0 z-0 opacity-20 sm:opacity-90">
          <Image
            src="/img/hero-banner.jpg"
            alt=""
            fill
            className="object-cover object-right"
            unoptimized
            priority
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 max-w-xs sm:max-w-md md:max-w-lg">
          <p className="text-text-secondary text-ui-sm font-medium mb-1">
            Bonjour,
          </p>
          <div className="text-ui-2xl sm:text-ui-3xl font-bold text-text-primary mb-2 tracking-tight leading-tight">
            {firstName} 👋
          </div>
          <p className="text-text-secondary text-ui-sm font-normal leading-relaxed">
            Votre profil centralisé alimente l&apos;ensemble de vos documents et
            présences professionnelles.
          </p>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* ================= COLONNE GAUCHE (8 colonnes) ================= */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {/* Carte Profil Maître */}
          <div className="bg-background rounded-panel border border-border shadow-sm p-5 md:p-6">
            <div className="flex flex-col sm:flex-row gap-5 md:gap-6 items-center sm:items-start text-center sm:text-left">
              <Link
                href="/profil"
                className="relative group shrink-0"
                title="Modifier ma photo"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-panel bg-background-subtle border border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                  {profile?.photo_url || session?.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile?.photo_url || session?.user?.image || ''}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 md:w-12 md:h-12 text-text-muted" />
                  )}
                </div>
                <div className="absolute inset-0 bg-text-primary/30 rounded-panel opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PenLine className="w-4 h-4 text-white" />
                </div>
              </Link>

              <div className="flex-1 w-full min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                  <div className="min-w-0">
                    <h2 className="text-ui-xl font-semibold text-text-primary flex items-center justify-center sm:justify-start gap-2">
                      <span className="truncate">{fullName}</span>
                      <CheckCircle2
                        className="w-4 h-4 text-success-text shrink-0"
                        fill="currentColor"
                        stroke="white"
                      />
                    </h2>
                    <p className="text-text-secondary text-ui-sm mt-1">
                      {profile?.title || 'Titre professionnel non renseigné'}
                    </p>
                  </div>

                  <Link href="/profil">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<PenLine className="w-3.5 h-3.5 text-primary" />}
                    >
                      Modifier le profil
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-y-2 gap-x-6 mt-4 text-ui-xs text-text-muted justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-text-muted" />
                    <span>{profile?.location || 'Localisation non renseignée'}</span>
                  </div>
                  {profile?.username ? (
                    <Link
                      href={`/${profile.username}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>carriey.me/{profile.username}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Profil privé</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section : Mes documents & Créations */}
          <div className="bg-background rounded-panel border border-border shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-panel bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-ui-base font-semibold text-text-primary">
                    Mes documents
                  </h2>
                  <p className="text-ui-xs text-text-muted mt-0.5 hidden sm:block">
                    Générez et adaptez vos documents à partir de votre profil.
                  </p>
                </div>
              </div>
              <Link
                href="/mes-documents"
                className="text-ui-xs font-medium text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Gérer tous les documents <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 4 Cartes d'action harmonisées */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Carte CV */}
              <div className="bg-background rounded-panel p-4 border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-primary-subtle text-primary rounded-panel flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <Badge variant="primary" size="sm">
                      {cvs.length} créé{cvs.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-text-primary text-ui-sm">
                    Curriculum Vitae
                  </h3>
                  <p className="text-ui-xs text-text-secondary mt-1 leading-snug">
                    Exportez et personnalisez vos CV ciblés.
                  </p>
                </div>
                <Link
                  href="/mes-documents"
                  className="w-full text-center bg-background-subtle border border-border text-text-primary text-ui-xs font-medium py-2 rounded-button hover:bg-primary hover:text-white hover:border-primary transition-colors mt-3"
                >
                  Voir mes CV →
                </Link>
              </div>

              {/* Carte Lettre de motivation */}
              <div className="bg-background rounded-panel p-4 border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-info-bg text-info-text rounded-panel flex items-center justify-center">
                      <Mailbox className="w-4 h-4" />
                    </div>
                    <Badge variant="info" size="sm">
                      Lettre
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-text-primary text-ui-sm">
                    Lettre de motivation
                  </h3>
                  <p className="text-ui-xs text-text-secondary mt-1 leading-snug">
                    Rédigez des lettres percutantes adaptées à l&apos;offre.
                  </p>
                </div>
                <Link
                  href="/mes-documents/create/lettre"
                  className="w-full text-center bg-background-subtle border border-border text-text-primary text-ui-xs font-medium py-2 rounded-button hover:bg-primary hover:text-white hover:border-primary transition-colors mt-3"
                >
                  Nouvelle lettre →
                </Link>
              </div>

              {/* Carte Page publique */}
              <div className="bg-background rounded-panel p-4 border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-success-bg text-success-text rounded-panel flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <Badge variant="success" size="sm">
                      En ligne
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-text-primary text-ui-sm">
                    Profil public
                  </h3>
                  <p className="text-ui-xs text-text-secondary mt-1 leading-snug">
                    Partagez votre présence web avec un lien unique.
                  </p>
                </div>
                <Link
                  href="/mes-documents/create/page-publique"
                  className="w-full text-center bg-background-subtle border border-border text-text-primary text-ui-xs font-medium py-2 rounded-button hover:bg-primary hover:text-white hover:border-primary transition-colors mt-3"
                >
                  Gérer ma page →
                </Link>
              </div>

              {/* Carte Modèles de CV */}
              <div className="bg-background rounded-panel p-4 border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-warning-bg text-warning-text rounded-panel flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <Badge variant="warning" size="sm">
                      Designs
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-text-primary text-ui-sm">
                    Modèles de CV
                  </h3>
                  <p className="text-ui-xs text-text-secondary mt-1 leading-snug">
                    Découvrez des mises en page professionnelles prêtes à l&apos;emploi.
                  </p>
                </div>
                <Link
                  href="/themes"
                  className="w-full text-center bg-background-subtle border border-border text-text-primary text-ui-xs font-medium py-2 rounded-button hover:bg-primary hover:text-white hover:border-primary transition-colors mt-3"
                >
                  Explorer les modèles →
                </Link>
              </div>
            </div>
          </div>

          {/* Section : Mes candidatures */}
          <div className="bg-background rounded-panel border border-border shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-panel bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-ui-base font-semibold text-text-primary">
                    Mes candidatures
                  </h2>
                  <p className="text-ui-xs text-text-muted mt-0.5 hidden sm:block">
                    Suivez vos démarches de recrutement en temps réel.
                  </p>
                </div>
              </div>
              <Link
                href="/candidatures"
                className="text-ui-xs font-medium text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Accéder au suivi <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {[
                {
                  label: 'En cours',
                  value: stats.en_cours,
                  variant: 'info' as const,
                  icon: Circle,
                },
                {
                  label: 'Acceptées',
                  value: stats.acceptees,
                  variant: 'success' as const,
                  icon: CheckCircle2,
                },
                {
                  label: 'En attente',
                  value: stats.attente,
                  variant: 'warning' as const,
                  icon: Circle,
                },
                {
                  label: 'Refusées',
                  value: stats.refusees,
                  variant: 'danger' as const,
                  icon: Circle,
                },
              ].map(({ label, value, variant, icon: Icon }) => (
                <div
                  key={label}
                  className="bg-background border border-border rounded-panel p-4 flex flex-col justify-between shadow-sm hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-ui-xs font-medium text-text-secondary">
                      {label}
                    </span>
                    <Badge variant={variant} size="sm" dot>
                      {value}
                    </Badge>
                  </div>
                  <p className="text-ui-2xl font-bold text-text-primary tracking-tight">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= COLONNE DROITE (4 colonnes) ================= */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* Complétion du profil avec ProfileCompletionRing */}
          <div className="bg-background rounded-panel border border-border shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-panel bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h2 className="text-ui-base font-semibold text-text-primary">
                  Complétude du profil
                </h2>
              </div>
              <Link
                href="/analyse"
                className="text-ui-xs font-medium text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Diagnostic <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <ProfileCompletionRing
                value={completion}
                size={70}
                strokeWidth={9}
                unit="%"
              />
              <div className="min-w-0">
                <p className="text-text-primary font-semibold text-ui-sm">
                  {completionLabel}
                </p>
                <p className="text-text-secondary text-ui-xs mt-1 leading-snug">
                  {completion < 100
                    ? 'Complétez les sections recommandées pour maximiser l’impact de vos CV.'
                    : 'Votre profil maître est parfaitement complété.'}
                </p>
                <Link
                  href="/profil"
                  className="inline-flex items-center gap-1 text-ui-xs font-medium text-primary hover:underline mt-2"
                >
                  Compléter mon profil →
                </Link>
              </div>
            </div>
          </div>

          {/* Mes compétences — État vide sincère sans placeholders factices */}
          <div className="bg-background rounded-panel border border-border shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-panel bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <h2 className="text-ui-base font-semibold text-text-primary">
                  Mes compétences
                </h2>
              </div>
              <Link
                href="/profil"
                className="text-ui-xs font-medium text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                Modifier <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {profile?.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 10).map((skill: any, i: number) => (
                  <Badge key={i} variant="primary" size="sm">
                    {skill.name || skill.label || skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Aucune compétence renseignée"
                description="Ajoutez vos compétences clés pour les synchroniser automatiquement sur vos CV."
                action={{
                  label: 'Ajouter des compétences',
                  href: '/profil',
                  variant: 'secondary',
                }}
                className="min-h-[130px] p-4 text-center"
              />
            )}
          </div>

          {/* Profil public partageable */}
          {profile?.username && (
            <div className="bg-background rounded-panel border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-panel bg-primary-subtle text-primary flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <h2 className="text-ui-base font-semibold text-text-primary">
                  Présence en ligne
                </h2>
              </div>
              <p className="text-ui-xs text-text-secondary mb-4 leading-relaxed">
                Votre profil professionnel est accessible publiquement à
                l&apos;adresse suivante :
              </p>
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-button text-ui-sm font-medium hover:bg-primary-hover transition-colors w-full"
              >
                <ExternalLink className="w-4 h-4" />
                Voir mon profil public
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
