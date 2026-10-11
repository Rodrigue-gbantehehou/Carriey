"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useCvStore } from '@/store/cv';
import { 
  FileText, Briefcase, ChevronRight, CheckCircle2, Circle, 
  MapPin, Globe, Eye, PenLine, FileUp, Sparkles, User, File, Trophy, Mailbox, Settings
} from 'lucide-react';
import { PaywallModal } from '@/components/app/shared/PaywallModal';

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
    (profile?.certifications?.length || 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100) || 0;
}

export default function AccueilPage() {
  const { data: session } = useSession();
  const { profile, setProfile, setLoading } = useProfileStore();
  const { cvs } = useCvStore();
  const [about, setAbout] = useState('');
  const [mounted, setMounted] = useState(false);
  const [candidatures, setCandidatures] = useState<any[]>([]);
  const [showProPaywall, setShowProPaywall] = useState(false);

  const firstName = profile?.first_name || session?.user?.name?.split(' ')[0] || profile?.username || 'vous';
  const fullName = session?.user?.name || profile?.username || 'Utilisateur';
  const completion = getCompletionPercent(profile, about);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      if (session?.user?.accessToken) {
        setLoading(true);
        try {
          // Fetch Profile
          const { profileApi } = await import('@/lib/profile-api');
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) {
            setProfile(data);
            setAbout(data.bio || '');
          }
          
          // Fetch Candidatures
          const { candidaturesApi } = await import('@/lib/candidature-api');
          const cands = await candidaturesApi.list(session.user.accessToken);
          setCandidatures(cands || []);
          
        } catch (err) {
          console.error("Error fetching data", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [session, setProfile, setLoading]);

  if (!mounted) return null;

  const stats = {
    en_cours: candidatures.filter(c => ['brouillon', 'preparation'].includes(c.status?.toLowerCase())).length,
    acceptees: candidatures.filter(c => ['acceptee', 'entretien'].includes(c.status?.toLowerCase())).length,
    refusees: candidatures.filter(c => c.status?.toLowerCase() === 'refusee').length,
    attente: candidatures.filter(c => c.status?.toLowerCase() === 'envoyee').length,
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      <PaywallModal
        isOpen={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        title="Fonctionnalité PRO"
        description="Le ciblage de CV par IA est réservé aux abonnés carriey PRO."
      />

      {/* 1. Hero Banner */}
      <div className="relative w-full rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm border border-transparent bg-gradient-to-r from-[#EAE6F8] via-[#E2EDFB] to-[#C3F0EE] flex flex-col justify-center px-6 md:px-10 py-8 md:py-12 min-h-[200px] md:min-h-[240px]">
        {/* Placeholder pour l'image de fond qui sera hero-banner.jpg */}
        <div className="absolute inset-0 z-0 opacity-20 sm:opacity-100">
            <Image src="/img/hero-banner.jpg" alt="Hero Banner" fill className="object-cover object-right" unoptimized priority />
        </div>
        
        <div className="relative z-10 max-w-xs sm:max-w-md md:max-w-lg">
          <p className="text-[#1E1B4B] text-base md:text-lg italic mb-1 font-medium">Bonjour</p>
          <h1 className="text-2xl sm:text-3xl md:text-[40px] font-extrabold text-[#111827] mb-2 md:mb-3 tracking-tight leading-none flex items-center gap-2">
            {firstName} <span className="text-xl sm:text-2xl md:text-3xl">👋</span>
          </h1>
          <p className="text-[#1E1B4B] text-sm md:text-[15px] font-medium leading-relaxed max-w-sm">
            Ton profil est la clé de nouvelles opportunités. Continue d'avancer, tu es sur la bonne voie !
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row gap-5 md:gap-6 items-center sm:items-start text-center sm:text-left">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                  {profile?.photo_url || session?.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile?.photo_url || session?.user?.image || ""} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 md:w-12 md:h-12 text-indigo-300" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 md:bottom-1 md:right-1 p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-indigo-600 hover:bg-gray-50 transition-colors">
                  <PenLine className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
              
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-[#111827] flex items-center justify-center sm:justify-start gap-2">
                      {fullName} <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" fill="currentColor" stroke="white" />
                    </h2>
                    <p className="text-gray-600 font-medium text-xs md:text-sm mt-1">{profile?.title || 'Professionnel Identity & Career'}</p>
                  </div>
                  <Link href="/profil" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs md:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
                    <PenLine className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600" />
                    Modifier mon profil
                  </Link>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-y-2 gap-x-4 md:gap-x-6 mt-4 md:mt-5 text-[11px] md:text-xs font-medium text-gray-500 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> {profile?.location || 'Non renseigné'}</div>
                  <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> Disponible pour de nouvelles opportunités</div>
                  <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" /> Visible par tous</div>
                </div>
              </div>
            </div>
          </div>


          {/* Mes documents */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-extrabold text-[#111827]">Mes documents</h3>
                  <p className="text-[11px] md:text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">Crée, génère et gère tous tes documents professionnels.</p>
                </div>
              </div>
              <Link href="/mes-documents" className="text-[11px] md:text-sm font-bold text-indigo-600 hover:underline flex items-center whitespace-nowrap">
                Voir tous <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Link>
            </div>

            {/* Sur Web (lg+), on force 4 colonnes pour reproduire la maquette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              
              <div className="bg-[#EFFFF6] rounded-2xl p-4 lg:p-4 border border-transparent hover:border-green-200 transition-all flex flex-col justify-between group cursor-pointer min-h-[160px] lg:min-h-[190px]">
                <div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 text-white rounded-[10px] flex items-center justify-center shadow-sm mb-3 lg:mb-4">
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#111827] flex flex-wrap items-center gap-1.5 text-sm lg:text-[15px]">CV <span className="bg-green-200 text-green-800 text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap">{cvs.length || 0} créés</span></h4>
                  <p className="text-[10px] text-gray-600 font-medium mt-1">Crée et personnalise ton CV professionnel.</p>
                </div>
                <Link href="/mes-documents" className="w-full text-center bg-green-500 text-white text-[10px] lg:text-xs font-bold py-2 rounded-full shadow-sm hover:bg-green-600 transition-colors mt-3">
                  Gérer mes CV &rarr;
                </Link>
              </div>

              <div className="bg-[#F8F5FF] rounded-2xl p-4 lg:p-4 border border-transparent hover:border-purple-200 transition-all flex flex-col justify-between group cursor-pointer min-h-[160px] lg:min-h-[190px]">
                <div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-500 text-white rounded-[10px] flex items-center justify-center shadow-sm mb-3 lg:mb-4">
                    <Mailbox className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#111827] text-sm lg:text-[15px] leading-tight">Lettre de motivation</h4>
                  <p className="text-[10px] text-gray-600 font-medium mt-1">Rédige des lettres percutantes avec l'aide de l'IA.</p>
                </div>
                <Link href="/candidatures/nouvelle" className="w-full text-center bg-purple-100 text-purple-700 text-[10px] lg:text-xs font-bold py-2 rounded-full shadow-sm hover:bg-purple-200 transition-colors mt-3">
                  Créer une lettre &rarr;
                </Link>
              </div>

              <div className="bg-[#FFF8EE] rounded-2xl p-4 lg:p-4 border border-transparent hover:border-orange-200 transition-all flex flex-col justify-between group cursor-pointer min-h-[160px] lg:min-h-[190px]">
                <div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-orange-500 text-white rounded-[10px] flex items-center justify-center shadow-sm mb-3 lg:mb-4">
                    <FileUp className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#111827] text-sm lg:text-[15px]">Documents</h4>
                  <p className="text-[10px] text-gray-600 font-medium mt-1">Regroupe et télécharge tous tes documents.</p>
                </div>
                <Link href="/mes-documents" className="w-full text-center bg-orange-100 text-orange-700 text-[10px] lg:text-xs font-bold py-2 rounded-full shadow-sm hover:bg-orange-200 transition-colors mt-3">
                  Voir mes documents &rarr;
                </Link>
              </div>

              <div className="bg-[#F0F7FF] rounded-2xl p-4 lg:p-4 border border-transparent hover:border-blue-200 transition-all flex flex-col justify-between group cursor-pointer min-h-[160px] lg:min-h-[190px]">
                <div>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 text-white rounded-[10px] flex items-center justify-center shadow-sm mb-3 lg:mb-4">
                    <Trophy className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <h4 className="font-extrabold text-[#111827] text-sm lg:text-[15px]">Modèles premium</h4>
                  <p className="text-[10px] text-gray-600 font-medium mt-1">Accède à des modèles de qualité supérieure.</p>
                </div>
                <button onClick={() => setShowProPaywall(true)} className="w-full text-center bg-blue-100 text-blue-700 text-[10px] lg:text-xs font-bold py-2 rounded-full shadow-sm hover:bg-blue-200 transition-colors mt-3">
                  Découvrir les modèles &rarr;
                </button>
              </div>

            </div>
          </div>

          {/* Mes candidatures */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
             <div className="flex items-center justify-between mb-5 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Mailbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-extrabold text-[#111827]">Mes candidatures</h3>
                  <p className="text-[11px] md:text-xs text-gray-500 font-medium mt-0.5 hidden sm:block">Suis tes candidatures et ajuste ton profil.</p>
                </div>
              </div>
              <Link href="/candidatures" className="text-[11px] md:text-sm font-bold text-indigo-600 hover:underline flex items-center whitespace-nowrap">
                Voir toutes <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-3 lg:p-4 flex flex-col xl:flex-row items-center justify-center xl:justify-start gap-2 lg:gap-3 shadow-sm text-center xl:text-left">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><Circle className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                <div><p className="text-lg lg:text-xl font-black text-[#111827]">{stats.en_cours}</p><p className="text-[9px] lg:text-[10px] font-bold text-blue-500 uppercase mt-0.5">En cours</p></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3 lg:p-4 flex flex-col xl:flex-row items-center justify-center xl:justify-start gap-2 lg:gap-3 shadow-sm text-center xl:text-left">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0"><CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                <div><p className="text-lg lg:text-xl font-black text-[#111827]">{stats.acceptees}</p><p className="text-[9px] lg:text-[10px] font-bold text-green-500 uppercase mt-0.5">Acceptées</p></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3 lg:p-4 flex flex-col xl:flex-row items-center justify-center xl:justify-start gap-2 lg:gap-3 shadow-sm text-center xl:text-left">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0"><Circle className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                <div><p className="text-lg lg:text-xl font-black text-[#111827]">{stats.refusees}</p><p className="text-[9px] lg:text-[10px] font-bold text-red-500 uppercase mt-0.5">Refusées</p></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-3 lg:p-4 flex flex-col xl:flex-row items-center justify-center xl:justify-start gap-2 lg:gap-3 shadow-sm text-center xl:text-left">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0"><Circle className="w-4 h-4 lg:w-5 lg:h-5" /></div>
                <div><p className="text-lg lg:text-xl font-black text-[#111827]">{stats.attente}</p><p className="text-[9px] lg:text-[10px] font-bold text-purple-500 uppercase mt-0.5">En attente</p></div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          
          {/* Ma progression (Checklist) */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-[17px] font-bold text-[#111827]">Ma progression</h3>
              </div>
              <Link href="/profil" className="text-[11px] md:text-xs font-bold text-indigo-600 hover:underline flex items-center whitespace-nowrap">Voir le détail <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-[64px] h-[64px] md:w-[72px] md:h-[72px] rounded-full border-[6px] border-gray-100 border-t-blue-500 border-r-blue-500 flex items-center justify-center relative flex-shrink-0">
                <span className="text-lg md:text-xl font-black text-[#111827]">{completion}%</span>
              </div>
              <div>
                <p className="text-[#111827] font-bold text-sm">Profil complet</p>
                <p className="text-gray-500 text-[11px] mt-0.5 font-medium leading-tight">Continue, tu es sur la bonne voie !</p>
              </div>
            </div>
          </div>

          {/* Mon score IA */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3 mb-5 md:mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base md:text-[17px] font-bold text-[#111827]">Mon score IA</h3>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 md:w-32 md:h-32 relative mb-5 md:mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#F3F4F6" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={`${283 - (283 * 89) / 100}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-black text-[#111827]">89<span className="text-sm md:text-base text-gray-400">/100</span></span>
                </div>
              </div>

              <h4 className="font-bold text-[#111827] text-sm md:text-base mb-1">Bon niveau !</h4>
              <p className="text-[11px] md:text-xs text-gray-500 font-medium leading-relaxed mb-5 md:mb-6">
                Ton profil est bien structuré, quelques améliorations peuvent encore le renforcer.
              </p>

              <Link href="/analyse" className="inline-block text-center px-6 py-2.5 bg-[#EEF2FF] text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors w-full">
                Voir l'analyse &rarr;
              </Link>
            </div>
          </div>

          {/* Mes compétences */}
          <div className="bg-white rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-5 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-[17px] font-bold text-[#111827]">Mes compétences</h3>
              </div>
              <Link href="/profil" className="text-[11px] md:text-xs font-bold text-indigo-600 hover:underline flex items-center whitespace-nowrap">Voir toutes <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile?.skills && profile.skills.length > 0 ? (
                profile.skills.slice(0, 10).map((skill: any, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-[#F0F7FF] text-[#1E3A8A] text-[10px] md:text-[11px] font-bold rounded-full border border-blue-100">
                    {skill.name || skill.label || skill}
                  </span>
                ))
              ) : (
                ['Communication', 'Leadership', 'Gestion de projet', 'Analyse', 'Rédaction'].map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-500 text-[10px] md:text-[11px] font-bold rounded-full border border-gray-100">
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

