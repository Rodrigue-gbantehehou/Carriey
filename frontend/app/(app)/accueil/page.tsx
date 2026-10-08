"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useCvStore } from '@/store/cv';
import { useUiStore } from '@/store/ui';
import { FileText, Plus, Target, User, Briefcase, TrendingUp, ChevronRight, Award, Clock, Sparkles, X } from 'lucide-react';
import { AIAssistant } from '@/components/app/shared/AIAssistant';
import { PaywallModal } from '@/components/app/shared/PaywallModal';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

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
  const { openCreateModal } = useUiStore();
  const [about, setAbout] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

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
    <div className="px-6 py-8 space-y-10 max-w-5xl mx-auto animate-fade-in">

      {/* PaywallModal — s'ouvre si l'utilisateur n'est pas PRO */}
      <PaywallModal
        isOpen={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        title="Fonctionnalité PRO"
        description="Le ciblage de CV par IA est réservé aux abonnés carriey PRO. Passez au plan PRO pour générer un CV parfaitement ciblé sur chaque offre d'emploi en 1 clic."
      />

      {/* Header compact */}
      <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bonjour {firstName} 👋</h1>
        <p className="text-base text-gray-500 mt-1">
          Voici votre tableau de bord personnel.
        </p>
      </div>

      {/* Completion Card (Dense) */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-6 shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden animate-slide-up hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all duration-500" style={{ animationDelay: '0.2s' }}>
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-indigo-200 text-xs font-bold tracking-widest mb-1.5 uppercase">Profil professionnel</p>
              <p className="text-2xl font-bold">Complété à {completion}%</p>
            </div>
            <Link href="/profil" className="bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md rounded-2xl p-3 shadow-sm">
              <ChevronRight className="w-5 h-5 text-white" />
            </Link>
          </div>

          <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Actions (Grid 2x2) */}
      <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-xs font-bold text-gray-400 mb-4 px-1 uppercase tracking-widest">Actions rapides</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/candidatures/nouvelle"
            className="flex flex-col items-start gap-3 p-5 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-600/10 hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Nouvelle candidature</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Adapter CV & Lettre par IA</p>
            </div>
          </Link>

          <Link
            href="/candidatures"
            className="flex flex-col items-start gap-3 p-5 rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-md shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Candidatures</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Suivre l'avancement</p>
            </div>
          </Link>

          <Link
            href="/statistiques"
            className="flex flex-col items-start gap-3 p-5 rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-md shadow-sm hover:border-orange-300 hover:shadow-xl hover:shadow-orange-600/10 hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-sm">Statistiques</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Voir les métriques</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Activity / Docs */}
      <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Récemment modifiés</h2>
          <Link href="/mes-documents" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Voir tout</Link>
        </div>

        <div className="space-y-3">
          {recentDocs.length > 0 ? (
            recentDocs.map((doc) => (
              <Link href={`/mes-documents/cv/${doc.id}`} key={doc.id} className="group flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-lg hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                  <FileText className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base truncate">{doc.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-500 truncate font-medium">
                      Modifié il y a {formatDistanceToNow(new Date(doc.updated_at || doc.created_at || Date.now()), { addSuffix: false, locale: fr })}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors mr-1" />
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileText className="w-6 h-6 text-gray-300 mb-2" />
              <p className="text-xs font-medium text-gray-500">Aucun document récent</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
