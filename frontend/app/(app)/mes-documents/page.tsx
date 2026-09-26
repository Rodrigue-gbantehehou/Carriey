'use client';

import { useCvStore } from '@/store/cv';
import { useUiStore } from '@/store/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, FileText, Clock, Trash2, Edit2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { ThemeThumbnail } from '@/components/app/cv/shared/ThemeThumbnail';
import { useSession } from 'next-auth/react';
import { cvApi } from '@/lib/cv-api';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPage } from '@/types/public-page';
import { PageCard } from '@/components/app/public-page/shared/PageCard';

const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'cv', label: 'CV' },
  { id: 'lettres', label: 'Lettres' },
  { id: 'portfolios', label: 'Portfolios' },
  { id: 'pages', label: 'Profils publics' },
  { id: 'autres', label: 'Autres' },
];

export default function MesDocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { cvs, setCvs, removeCv, setLoading, loading } = useCvStore();
  const { openCreateModal } = useUiStore();
  const [activeTab, setActiveTab] = useState('all');
  const [mounted, setMounted] = useState(false);

  // Pages state
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [confirmDeletePage, setConfirmDeletePage] = useState<PublicPage | null>(null);

  // Vérifier s'il faut ouvrir l'éditeur de page via URL
  useEffect(() => {
    if (searchParams?.get('create') === 'page') {
      router.replace('/mes-documents/create/page-publique');
    }
  }, [searchParams, router]);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      const token = session?.user?.accessToken;
      if (token) {
        setLoading(true);
        try {
          const [cvData, pagesData] = await Promise.all([
            cvApi.getResumes(token).catch(() => []),
            publicPagesApi.list(token).catch(() => [])
          ]);
          setCvs(cvData as any);
          setPages(pagesData as PublicPage[]);
        } catch (err) {
          console.error("Erreur lors de la récupération des documents", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [session, setCvs, setLoading]);

  // CV Handlers
  const handleDeleteCv = async (e: React.MouseEvent, id: string) => {
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

  // Pages Handlers

  const doDeletePage = async () => {
    if (!session?.user?.accessToken || !confirmDeletePage) return;
    await publicPagesApi.delete(session.user.accessToken, confirmDeletePage.id);
    setPages(prev => prev.filter(p => p.id !== confirmDeletePage.id));
    setConfirmDeletePage(null);
  };

  const handleTogglePage = async (page: PublicPage) => {
    if (!session?.user?.accessToken) return;
    const updated = await publicPagesApi.update(session.user.accessToken, page.id, { is_active: !page.is_active });
    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const actualCvs = cvs.filter(c => c.doc_type !== 'cover_letter');
  const coverLetters = cvs.filter(c => c.doc_type === 'cover_letter');

  const filteredCvs = activeTab === 'all' || activeTab === 'cv' ? actualCvs : [];
  const filteredLetters = activeTab === 'all' || activeTab === 'lettres' ? coverLetters : [];
  const filteredPages = activeTab === 'all' || activeTab === 'pages' ? pages : [];
  const isEmpty = filteredCvs.length === 0 && filteredPages.length === 0 && filteredLetters.length === 0;

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

      {isEmpty ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center bg-gray-50/50 mt-10">
          <div className="mx-auto w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {activeTab === 'all' ? 'Aucun document' : `Aucun document de type "${TABS.find(t => t.id === activeTab)?.label}"`}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            {activeTab === 'all' || activeTab === 'cv' || activeTab === 'pages' || activeTab === 'lettres'
              ? "Vous n'avez pas encore généré de document de ce type. Créez-en un maintenant depuis votre profil !"
              : "Cette fonctionnalité arrive très bientôt dans une prochaine mise à jour de CARIEY."}
          </p>
          {(activeTab === 'all' || activeTab === 'cv' || activeTab === 'pages' || activeTab === 'lettres') && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Créer mon premier document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          
          {/* Rendu des CVs */}
          {filteredCvs.map((cv: any) => (
            <div
              key={cv.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:border-indigo-200 transition-all cursor-pointer flex flex-col"
              onClick={() => router.push(`/mes-documents/cv/${cv.id}`)}
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
                    onClick={(e) => handleDeleteCv(e, cv.id)}
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

          {/* Rendu des Lettres de motivation */}
          {filteredLetters.map((lettre: any) => (
            <div
              key={lettre.id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:border-violet-200 transition-all cursor-pointer flex flex-col"
              onClick={() => router.push(`/mes-documents/lettre/${lettre.id}`)}
            >
              <div className="aspect-[1/1.4] bg-gray-100 border-b border-gray-100 relative overflow-hidden flex items-center justify-center p-4">
                <div className="w-full h-full bg-white shadow-sm rounded-sm p-4 relative border border-gray-100 transition-transform group-hover:scale-[1.02] flex flex-col">
                  {/* Miniature abstraite de lettre */}
                  <div className="w-1/3 h-1.5 bg-gray-200 rounded-full mb-6 ml-auto" />
                  <div className="w-1/4 h-1.5 bg-gray-200 rounded-full mb-8" />
                  <div className="w-full h-1 bg-gray-100 rounded-full mb-2" />
                  <div className="w-full h-1 bg-gray-100 rounded-full mb-2" />
                  <div className="w-5/6 h-1 bg-gray-100 rounded-full mb-2" />
                  <div className="w-4/6 h-1 bg-gray-100 rounded-full mb-6" />
                  <div className="w-full h-1 bg-gray-100 rounded-full mb-2" />
                  <div className="w-5/6 h-1 bg-gray-100 rounded-full mb-2" />
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
                  <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1" title={lettre.title}>
                    {lettre.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteCv(e, lettre.id)}
                    className="text-gray-400 hover:text-red-500 p-1.5 -mr-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-medium mt-auto">
                  <div className="flex items-center gap-1.5 text-violet-600 bg-violet-50 px-2 py-1 rounded-md">
                    <span className="uppercase tracking-wider text-[10px] font-bold">LETTRE</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDistanceToNow(new Date(lettre.updated_at || lettre.created_at), { addSuffix: true, locale: fr })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Rendu des Profils Publics */}
          {filteredPages.map(page => (
            <PageCard
              key={page.id}
              page={page}
              onEdit={() => router.push(`/mes-documents/page-publique/${page.id}`)}
              onDelete={() => setConfirmDeletePage(page)}
              onToggle={() => handleTogglePage(page)}
            />
          ))}

        </div>
      )}

      {/* Delete Confirmation Modal for Pages */}
      {confirmDeletePage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeletePage(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-black text-gray-900 mb-2">Supprimer la page ?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Voulez-vous vraiment supprimer &quot;{confirmDeletePage.title}&quot; ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeletePage(null)} className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                Annuler
              </button>
              <button onClick={doDeletePage} className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
