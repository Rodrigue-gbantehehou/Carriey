"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useCvStore } from '@/store/cv';
import { FileText, Plus, Briefcase, TrendingUp, ChevronRight, Clock, CheckCircle2, Circle } from 'lucide-react';
import { PaywallModal } from '@/components/app/shared/PaywallModal';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    <div className="space-y-6 animate-fade-in pb-12">
      <PaywallModal
        isOpen={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        title="Fonctionnalité PRO"
        description="Le ciblage de CV par IA est réservé aux abonnés carriey PRO. Passez au plan PRO pour générer un CV parfaitement ciblé sur chaque offre d'emploi en 1 clic."
      />

      {/* Hero Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-white/5 flex flex-col justify-center px-8 md:px-12 py-12 bg-[#F8F9FE]">
        {/* L'image de fond doit être placée dans public/img/hero-banner.jpg */}
        <Image 
          src="/img/hero-banner.jpg" 
          alt="Hero Banner" 
          fill 
          className="object-cover object-right" 
          priority 
          unoptimized
        />
        <div className="relative z-10 max-w-lg">
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#111827] mb-2 tracking-tight leading-tight">
            Bonjour {firstName} 👋
          </h1>
          <p className="text-[#6B7280] text-[15px] mb-6 font-medium">
            Heureux de te revoir, voici le résumé de tes avancements.
          </p>
          <Link href="/candidatures/nouvelle" className="inline-flex items-center justify-center bg-white text-[#111827] text-sm font-bold px-6 py-3 rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            Continuer de postuler
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progression */}
        <div className="lg:col-span-1">
          
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] h-full">
            <h3 className="text-[17px] font-bold text-[#111827] mb-6">Ma progression</h3>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 flex items-center justify-center">
                <span className="text-lg font-extrabold text-[#111827]">{completion}%</span>
              </div>
              <div>
                <p className="text-[#111827] font-bold text-sm">Profil complété</p>
                <p className="text-[#6B7280] text-xs mt-0.5">Continuez pour atteindre 100%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className={`mt-0.5 flex-shrink-0 ${profile?.title ? 'text-indigo-600' : 'text-gray-300'}`}>
                  <CheckCircle2 className="w-5 h-5" fill="currentColor" stroke="white" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${profile?.title ? 'text-[#111827]' : 'text-gray-400'}`}>Titre professionnel</p>
                  <p className="text-xs text-gray-400 mt-0.5">Défini le poste recherché</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`mt-0.5 flex-shrink-0 ${about ? 'text-indigo-600' : 'text-gray-300'}`}>
                  <CheckCircle2 className="w-5 h-5" fill="currentColor" stroke="white" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${about ? 'text-[#111827]' : 'text-gray-400'}`}>À propos de vous</p>
                  <p className="text-xs text-gray-400 mt-0.5">Rédigez une courte bio</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`mt-0.5 flex-shrink-0 ${(profile?.experiences?.length || 0) > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
                  <CheckCircle2 className="w-5 h-5" fill="currentColor" stroke="white" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${(profile?.experiences?.length || 0) > 0 ? 'text-[#111827]' : 'text-gray-400'}`}>Expériences ajoutées</p>
                  <p className="text-xs text-gray-400 mt-0.5">Votre parcours pro</p>
                </div>
              </div>
            </div>

            <Link href="/profil" className="mt-8 block text-center w-full bg-[#F3F4F6] text-[#374151] text-sm font-bold py-3.5 rounded-full hover:bg-gray-200 transition-colors">
              Compléter mon profil
            </Link>
          </div>
        </div>

        {/* Right Column: Docs & Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          <h3 className="text-[17px] font-bold text-[#111827]">Mes documents</h3>
          
          {/* Docs Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#EEF2FF] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] group cursor-pointer border border-transparent hover:border-indigo-100 transition-colors">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="bg-white/60 text-indigo-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">En cours</span>
              </div>
              <div className="relative z-10 mt-6">
                <h4 className="text-lg font-extrabold text-[#111827]">CV Simple</h4>
                <p className="text-sm text-[#6B7280] font-medium mt-1 group-hover:text-indigo-600 transition-colors">Générer avec l'IA &rarr;</p>
              </div>
            </div>

            <div className="bg-[#FDF4FF] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px] group cursor-pointer border border-transparent hover:border-fuchsia-100 transition-colors">
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-fuchsia-100 rounded-full blur-3xl opacity-50"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText className="w-6 h-6 text-fuchsia-600" />
                </div>
                <span className="bg-white/60 text-fuchsia-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">À créer</span>
              </div>
              <div className="relative z-10 mt-6">
                <h4 className="text-lg font-extrabold text-[#111827]">Lettre de motivation</h4>
                <p className="text-sm text-[#6B7280] font-medium mt-1 group-hover:text-fuchsia-600 transition-colors">Générer avec l'IA &rarr;</p>
              </div>
            </div>
          </div>

          {/* Bottom stats: Score IA & Candidatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            
            {/* Score IA */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex items-center justify-between group">
              <div>
                <h4 className="text-[15px] font-bold text-[#111827] mb-1">Mon score IA</h4>
                <p className="text-[#6B7280] text-xs font-medium">Analysé par Carriey</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#111827]">{completion}</span>
                  <span className="text-sm font-bold text-gray-400">/100</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-indigo-600 font-black text-xl group-hover:scale-110 transition-transform">
                IA
              </div>
            </div>

            {/* Candidatures */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex items-center justify-between group cursor-pointer hover:border-gray-200 transition-colors">
              <div>
                <h4 className="text-[15px] font-bold text-[#111827] mb-1">Candidatures</h4>
                <p className="text-[#6B7280] text-xs font-medium">En cours ou terminées</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#111827]">0</span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-gray-400 group-hover:bg-[#111827] group-hover:text-white transition-colors">
                <Briefcase className="w-7 h-7" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
