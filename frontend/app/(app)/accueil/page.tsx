"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useCvStore } from '@/store/cv';
import { FileText, Plus, Briefcase, TrendingUp, ChevronRight, Clock } from 'lucide-react';
import { PaywallModal } from '@/components/app/shared/PaywallModal';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/ui/PageHeader';

function getCompletionPercent(profile: any, about: string): number {
  const checks = [
    !!profile?.title,
    !!profile?.username,
    !!profile?.contact_email,
    !!about || !!profile?.bio,
    (profile?.experiences?.length || 0) > 0,
    (profile?.educations?.length || 0) > 0,
    (profile?.skills?.length || 0) > 0,
    (profile?.projects?.length || 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default function AccueilPage() {
  const { data: session } = useSession();
  const { profile, setProfile, setLoading } = useProfileStore();
  const { cvs } = useCvStore();
  const [about, setAbout] = useState('');
  const [mounted, setMounted] = useState(false);

  const [showProPaywall, setShowProPaywall] = useState(false);

  const firstName = profile?.first_name || session?.user?.name?.split(' ')[0] || profile?.username || 'vous';
  const completion = getCompletionPercent(profile, about);

  const recentDocs = [...cvs].sort((a, b) => new Date(b.updated_at || b.created_at || Date.now()).getTime() - new Date(a.updated_at || a.created_at || Date.now()).getTime()).slice(0, 3);

  useEffect(() => {
    setMounted(true);

    const fetchProfile = async () => {
      if (session?.user?.accessToken) {
        setLoading(true);
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) {
            setProfile(data);
            setAbout(data.bio || '');
          }
        } catch (err) {
          console.error("Error fetching profile", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [session, setProfile, setLoading]);

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-12">

      {/* PaywallModal — s'ouvre si l'utilisateur n'est pas PRO */}
      <PaywallModal
        isOpen={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        title="Fonctionnalité PRO"
        description="Le ciblage de CV par IA est réservé aux abonnés carriey PRO. Passez au plan PRO pour générer un CV parfaitement ciblé sur chaque offre d'emploi en 1 clic."
      />

      {/* Header */}
      <PageHeader
        title={`Bonjour ${firstName} 👋`}
        description="Voici votre tableau de bord personnel."
      />

      {/* Completion Card */}
      <div className="bg-white rounded-panel p-6 border border-border shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-text-muted text-ui-xs font-bold tracking-widest mb-1.5 uppercase">Profil professionnel</p>
              <p className="text-text-primary text-ui-2xl font-bold">Complété à {completion}%</p>
            </div>
            <Link href="/profil" className="p-2 border border-border rounded-panel text-text-secondary hover:text-primary hover:border-primary/20 hover:bg-primary-subtle transition-colors">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="h-2 rounded-full bg-background-subtle overflow-hidden border border-border/50">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions (Grid) */}
      <section>
        <h2 className="text-ui-xs font-bold text-text-muted mb-4 px-1 uppercase tracking-widest">Actions rapides</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/candidatures/nouvelle"
            className="flex flex-col items-start gap-3 p-5 rounded-panel border border-border bg-background shadow-sm hover:bg-background-subtle transition-colors group"
          >
            <div className="w-10 h-10 rounded-panel bg-primary-subtle text-primary border border-border flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-text-primary text-ui-sm">Nouvelle candidature</p>
              <p className="text-ui-xs text-text-secondary mt-0.5 leading-relaxed">Adapter CV & Lettre par IA</p>
            </div>
          </Link>

          <Link
            href="/candidatures"
            className="flex flex-col items-start gap-3 p-5 rounded-panel border border-border bg-background shadow-sm hover:bg-background-subtle transition-colors group"
          >
            <div className="w-10 h-10 rounded-panel bg-background text-primary border border-border flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-text-primary text-ui-sm">Candidatures</p>
              <p className="text-ui-xs text-text-secondary mt-0.5 leading-relaxed">Suivre l'avancement</p>
            </div>
          </Link>

          <Link
            href="/statistiques"
            className="flex flex-col items-start gap-3 p-5 rounded-panel border border-border bg-background shadow-sm hover:bg-background-subtle transition-colors group"
          >
            <div className="w-10 h-10 rounded-panel bg-background text-primary border border-border flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-text-primary text-ui-sm">Statistiques</p>
              <p className="text-ui-xs text-text-secondary mt-0.5 leading-relaxed">Voir les métriques</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Activity / Docs */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-ui-xs font-bold text-text-muted uppercase tracking-widest">Récemment modifiés</h2>
          <Link href="/mes-documents" className="text-ui-sm font-bold text-primary hover:underline transition-colors">Voir tout</Link>
        </div>

        <div className="space-y-3">
          {recentDocs.length > 0 ? (
            recentDocs.map((doc) => (
              <Link href={`/mes-documents/cv/${doc.id}`} key={doc.id} className="group flex items-center gap-4 p-4 bg-background rounded-panel border border-border shadow-sm hover:bg-background-subtle transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-panel bg-background border border-border flex items-center justify-center flex-shrink-0 group-hover:text-primary">
                  <FileText className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary text-ui-base truncate">{doc.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <p className="text-ui-xs text-text-secondary truncate font-medium">
                      Modifié il y a {formatDistanceToNow(new Date(doc.updated_at || doc.created_at || Date.now()), { addSuffix: false, locale: fr })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors mr-1" />
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-background-subtle rounded-panel border border-dashed border-border">
              <FileText className="w-6 h-6 text-text-muted mb-2" />
              <p className="text-ui-xs font-medium text-text-secondary">Aucun document récent</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
