"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { useCvStore } from '@/store/cv';
import { useUiStore } from '@/store/ui';
import { FileText, Plus, Target, User, Upload, MoreHorizontal, Edit2 } from 'lucide-react';
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
  const { profile, setProfile } = useProfileStore();
  const { cvs } = useCvStore();
  const { openCreateModal } = useUiStore();
  const [about, setAbout] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const firstName = session?.user?.name?.split(' ')[0] || profile?.username || 'vous';
  const completion = getCompletionPercent(profile, about);
  
  const recentDocs = [...cvs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem('cariey_draft_profile');
    const draft = raw ? JSON.parse(raw) : null;
    if (draft) {
      setProfile({
        id: draft.id || '1', user_id: draft.user_id || 'user_1',
        username: draft.username || '', title: draft.title || '',
        bio: draft.bio || '', contact_email: draft.contact_email || '',
        contact_phone: draft.contact_phone || '', location: draft.location || '',
        website: draft.website || '', linkedin_url: draft.linkedin_url || '', github_url: draft.github_url || '',
        visibility: draft.visibility || 'public',
        experiences: draft.experiences || [], educations: draft.educations || [],
        skills: draft.skills || [], projects: draft.projects || [],
        certifications: draft.certifications || [],
      });
      setAbout(draft.bio || '');
    }
  }, [setProfile]);

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      
      {/* Page Header (identical to mes-documents) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonjour {firstName} 👋</h1>
          <p className="text-sm text-gray-500 mt-1">
            Que voulez-vous faire aujourd'hui ?
          </p>
        </div>
      </div>

      {/* Block 1: Profile */}
      <section>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Votre profil est complété à {completion} %</p>
          
          <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-6 max-w-2xl">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
          
          <Link
            href="/profil"
            className="inline-flex items-center justify-center text-sm font-semibold text-white bg-indigo-600 px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
          >
            Continuer mon profil
          </Link>
        </div>
      </section>

      {/* Separator */}
      <hr className="border-gray-200" />

      {/* Block 2: Actions */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">Actions rapides</h2>
          <p className="text-sm text-gray-500 mt-1">Créez, adaptez ou importez vos documents.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={openCreateModal}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-center group bg-white shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Créer un CV</p>
            </div>
          </button>
          
          <button 
            onClick={() => alert('Bientôt disponible !')}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-center group bg-white shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Adapter à une offre</p>
            </div>
          </button>
          
          <Link 
            href="/profil"
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-center group bg-white shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Voir mon profil</p>
            </div>
          </Link>
          
          <button 
            onClick={() => alert('Bientôt disponible !')}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-gray-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-center group bg-white shadow-sm"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Importer un CV</p>
            </div>
          </button>
        </div>
      </section>

      {/* Separator */}
      <hr className="border-gray-200" />

      {/* Block 3: Recent Documents */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Documents récents</h2>
            <p className="text-sm text-gray-500 mt-1">Vos derniers CV et lettres de motivation.</p>
          </div>
          <Link href="/mes-documents" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Tout voir
          </Link>
        </div>
        
        {recentDocs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">Vous n'avez pas encore de documents.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {recentDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{doc.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => router.push(`/mes-documents/${doc.id}`)}
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                      Modifier
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      
    </div>
  );
}
