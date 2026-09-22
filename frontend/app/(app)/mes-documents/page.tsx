'use client';

import { useCvStore } from '@/store/cv';
import { useUiStore } from '@/store/ui';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Clock, Trash2, Edit2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { ThemeThumbnail } from '@/components/app/cv/shared/ThemeThumbnail';
import { useSession } from 'next-auth/react';
import { cvApi } from '@/lib/cv-api';

const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'cv', label: 'CV' },
  { id: 'lettres', label: 'Lettres' },
  { id: 'portfolios', label: 'Portfolios' },
  { id: 'autres', label: 'Autres' },
];

export default function MesDocumentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cvs, setCvs, removeCv, setLoading, loading } = useCvStore();
  const { openCreateModal } = useUiStore();
  const [activeTab, setActiveTab] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchCvs = async () => {
      if (session?.user?.accessToken) {
        setLoading(true);
        try {
          const data = await cvApi.getResumes(session.user.accessToken);
          setCvs(data);
        } catch (err) {
          console.error("Erreur lors de la récupération des documents", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCvs();
  }, [session, setCvs, setLoading]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer ce document ?')) {
      try {
        if (session?.user?.accessToken) {
          await cvApi.deleteResume(session.user.accessToken, id);
        }
        removeCv(id);
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filteredDocs = activeTab === 'all' || activeTab === 'cv' ? cvs : [];

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez tous les documents générés à partir de votre profil.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Créer un document
        </button>
      </div>

      {/* Toolbar & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl overflow-x-auto hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Search placeholder */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full sm:w-64"
          />
        </div>
      </div>

      {filteredDocs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center bg-gray-50/50 mt-10">
          <div className="mx-auto w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {activeTab === 'all' ? 'Aucun document' : `Aucun document de type "${TABS.find(t => t.id === activeTab)?.label}"`}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            {activeTab === 'all' || activeTab === 'cv' 
              ? "Vous n'avez pas encore généré de document. Créez-en un maintenant depuis votre profil !"
              : "Cette fonctionnalité arrive très bientôt dans une prochaine mise à jour de CARIEY."}
          </p>
          {(activeTab === 'all' || activeTab === 'cv') && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Créer mon premier CV
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {filteredDocs.map((cv) => (
            <div
              key={cv.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:border-indigo-200 transition-all cursor-pointer flex flex-col"
              onClick={() => router.push(`/mes-documents/${cv.id}`)}
            >
              <div className="aspect-[1/1.4] bg-gray-100 border-b border-gray-100 relative overflow-hidden flex items-center justify-center p-4">
                <div className="w-full h-full bg-white shadow-sm rounded-sm p-2 relative border border-gray-100 transition-transform group-hover:scale-[1.02]">
                  <ThemeThumbnail templateId={cv.template_id || 'classique'} />
                </div>
                
                {/* Overlay with edit button */}
                <div className="absolute inset-0 bg-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <span className="px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <Edit2 className="w-4 h-4" />
                    Éditer
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1" title={cv.title}>
                    {cv.title}
                  </h3>
                  <button
                    onClick={(e) => handleDelete(e, cv.id)}
                    className="text-gray-400 hover:text-red-500 p-1.5 -mr-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-medium mt-auto">
                  <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    <span className="uppercase tracking-wider text-[10px] font-bold">CV</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(cv.updated_at || cv.created_at), { addSuffix: true, locale: fr })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
