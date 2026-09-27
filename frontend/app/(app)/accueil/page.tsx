"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useCvStore } from '@/store/cv';
import { useUiStore } from '@/store/ui';
import { FileText, Plus, Target, User, Briefcase, TrendingUp, ChevronRight, Award, Clock, Sparkles, X } from 'lucide-react';
import { AIAssistant } from '@/components/app/shared/AIAssistant';
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

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCreatingTailoredCv, setIsCreatingTailoredCv] = useState(false);

  const handleAiSubmit = async (jobDescription: string) => {
    if (!session?.user?.accessToken) return;
    setIsAiModalOpen(false);
    setIsCreatingTailoredCv(true);
    
    try {
      const { aiApi } = await import('@/lib/ai-api');
      const { cvApi } = await import('@/lib/cv-api');
      const tailoredData = await aiApi.tailorCv(session.user.accessToken, jobDescription);
      
      const payload = {
        title: `CV Ciblé - ${new Date().toLocaleDateString()}`,
        template_id: 'classique',
        doc_type: 'cv',
        content: {
          usage: 'spontanee',
          disabledSections: tailoredData.disabledSections || [],
          disabledItems: tailoredData.disabledItems || {},
          overrides: {
            summary: tailoredData.summary,
            experiences: tailoredData.experiences
          }
        }
      };
      
      const newCv = await cvApi.createResume(session.user.accessToken, payload);
      useCvStore.getState().addCv(newCv);
      router.push(`/mes-documents/cv/${newCv.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du CV ciblé.");
    } finally {
      setIsCreatingTailoredCv(false);
    }
  };

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
    <div className="px-4 py-5 space-y-6">
      
      {/* Header compact */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bonjour {firstName} 👋</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Voici votre tableau de bord.
        </p>
      </div>

      {/* Completion Card (Dense) */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-4 shadow-lg shadow-indigo-600/20 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-indigo-100 text-xs font-medium mb-1">PROFIL PROFESSIONNEL</p>
              <p className="text-lg font-bold">Complété à {completion}%</p>
            </div>
            <Link href="/profil" className="bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md rounded-full p-2">
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
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-3 px-1 uppercase tracking-wider">Actions rapides</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={openCreateModal}
            className="flex flex-col items-start gap-2 p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-xs">Créer CV</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Générer un document</p>
            </div>
          </button>
          
          <button 
            onClick={() => setIsAiModalOpen(true)}
            disabled={isCreatingTailoredCv}
            className="flex flex-col items-start gap-2 p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md transition-all active:scale-95 disabled:opacity-70"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              {isCreatingTailoredCv ? (
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Target className="w-4 h-4" />
              )}
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-xs">Cibler offre</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Adapter par IA</p>
            </div>
          </button>
          
          <Link 
            href="/candidatures"
            className="flex flex-col items-start gap-2 p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-blue-300 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-xs">Candidatures</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Suivre l'avancement</p>
            </div>
          </Link>
          
          <Link 
            href="/stats"
            className="flex flex-col items-start gap-2 p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-orange-300 hover:shadow-md transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-xs">Statistiques</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">Voir les métriques</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Activity / Docs */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Récemment</h2>
          <Link href="/mes-documents" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Voir tout</Link>
        </div>
        
        <div className="space-y-2.5">
          {recentDocs.length > 0 ? (
            recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{doc.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] text-gray-500 truncate">
                      Modifié il y a {formatDistanceToNow(new Date(doc.updated_at || doc.created_at || Date.now()), { addSuffix: false, locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <FileText className="w-6 h-6 text-gray-300 mb-2" />
              <p className="text-xs font-medium text-gray-500">Aucun document récent</p>
            </div>
          )}
        </div>
      </section>
      
      {/* AIAssistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAiModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Créer un CV ciblé
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Collez l'annonce ou la description de l'offre d'emploi ci-dessous. L'IA va analyser votre Master Profile, générer une accroche et adapter vos expériences.
            </p>
            <AIAssistant
              onGenerate={handleAiSubmit}
              placeholder="Ex: Développeur React avec 5 ans d'expérience..."
              buttonText="Générer mon CV sur-mesure"
            />
          </div>
        </div>
      )}
    </div>
  );
}
