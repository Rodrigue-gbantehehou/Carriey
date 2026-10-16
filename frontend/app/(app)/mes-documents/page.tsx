'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Plus, FileText, Clock, Trash2, Edit2, Search } from 'lucide-react';

import config from '@/lib/config';
import { useCvStore } from '@/store/cv';
import { useUiStore } from '@/store/ui';
import { cvApi } from '@/lib/cv-api';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPage } from '@/types/public-page';
import { ThemeThumbnail } from '@/components/app/cv/shared/ThemeThumbnail';
import { PageCard } from '@/components/app/public-page/shared/PageCard';
import { PaywallModal } from '@/components/app/shared/PaywallModal';
import {
  Button,
  Badge,
  PageHeader,
  EmptyState,
  ConfirmDialog,
  SkeletonCard,
} from '@/components/ui';

const TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'cv', label: 'CV' },
  { id: 'lettres', label: 'Lettres de motivation' },
  { id: 'pages', label: 'Profils publics' },
];

function MesDocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { cvs, setCvs, removeCv, setLoading, loading } = useCvStore();
  const { openCreateModal } = useUiStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  const [pages, setPages] = useState<PublicPage[]>([]);
  const [dbThemes, setDbThemes] = useState<any[]>([]);

  // Modals state
  const [deletingCv, setDeletingCv] = useState<any | null>(null);
  const [deletingPage, setDeletingPage] = useState<PublicPage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showProPaywall, setShowProPaywall] = useState(false);

  // Redirection automatique pour création directe via URL
  useEffect(() => {
    if (searchParams?.get('create') === 'page') {
      router.replace('/mes-documents/create/page-publique');
    }
  }, [searchParams, router]);

  // Chargement des données
  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      const token = session?.user?.accessToken;
      if (token) {
        setLoading(true);
        try {
          const [cvData, pagesData, templatesData] = await Promise.all([
            cvApi.getResumes(token).catch(() => []),
            publicPagesApi.list(token).catch(() => []),
            fetch(`${config.apiBaseUrl}/templates`)
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => []),
          ]);
          setCvs(cvData as any);
          setPages(pagesData as PublicPage[]);
          setDbThemes(templatesData);
        } catch (err) {
          console.error('Erreur lors de la récupération des documents', err);
          toast.error('Impossible de charger vos documents.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [session, setCvs, setLoading]);

  // Suppression CV
  const handleConfirmDeleteCv = async () => {
    if (!session?.user?.accessToken || !deletingCv) return;
    setIsDeleting(true);
    try {
      await cvApi.deleteResume(session.user.accessToken, deletingCv.id);
      removeCv(deletingCv.id);
      toast.success('Document supprimé avec succès.');
      setDeletingCv(null);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression du document.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Suppression Page publique
  const handleConfirmDeletePage = async () => {
    if (!session?.user?.accessToken || !deletingPage) return;
    setIsDeleting(true);
    try {
      await publicPagesApi.delete(session.user.accessToken, deletingPage.id);
      setPages((prev) => prev.filter((p) => p.id !== deletingPage.id));
      toast.success('Page publique supprimée.');
      setDeletingPage(null);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la suppression de la page.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle activation Page publique
  const handleTogglePage = async (page: PublicPage) => {
    if (!session?.user?.accessToken) return;
    try {
      const updated = await publicPagesApi.update(
        session.user.accessToken,
        page.id,
        { is_active: !page.is_active }
      );
      setPages((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success(
        updated.is_active ? 'Page mise en ligne' : 'Page rendue privée'
      );
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  // Séparation CVs et Lettres
  const actualCvs = useMemo(
    () => cvs.filter((c) => c.doc_type !== 'cover_letter'),
    [cvs]
  );
  const coverLetters = useMemo(
    () => cvs.filter((c) => c.doc_type === 'cover_letter'),
    [cvs]
  );

  // Filtrage combiné : Onglet actif + Recherche textuelle
  const filterByQuery = (title?: string) => {
    if (!searchQuery.trim()) return true;
    return (title || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());
  };

  const filteredCvs = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'cv') return [];
    return actualCvs.filter((c) => filterByQuery(c.title));
  }, [activeTab, actualCvs, searchQuery]);

  const filteredLetters = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'lettres') return [];
    return coverLetters.filter((c) => filterByQuery(c.title));
  }, [activeTab, coverLetters, searchQuery]);

  const filteredPages = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'pages') return [];
    return pages.filter(
      (p) => filterByQuery(p.title) || filterByQuery(p.slug)
    );
  }, [activeTab, pages, searchQuery]);

  const totalFiltered =
    filteredCvs.length + filteredLetters.length + filteredPages.length;

  if (!mounted) return null;

  return (
    <div className="animate-fade-in pb-12">
      <PaywallModal
        isOpen={showProPaywall}
        onClose={() => setShowProPaywall(false)}
        title="Fonctionnalité PRO"
        description="Le ciblage de documents par IA est réservé aux abonnés carriey PRO."
      />

      {/* Confirmation suppression CV / Lettre */}
      <ConfirmDialog
        isOpen={!!deletingCv}
        onClose={() => setDeletingCv(null)}
        onConfirm={handleConfirmDeleteCv}
        title="Supprimer ce document ?"
        description={
          <>
            Voulez-vous vraiment supprimer &quot;
            <span className="font-medium text-text-primary">
              {deletingCv?.title || 'ce document'}
            </span>
            &quot; ? Cette action est irréversible.
          </>
        }
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Confirmation suppression Page publique */}
      <ConfirmDialog
        isOpen={!!deletingPage}
        onClose={() => setDeletingPage(null)}
        onConfirm={handleConfirmDeletePage}
        title="Supprimer la page publique ?"
        description={
          <>
            Voulez-vous vraiment supprimer la page &quot;
            <span className="font-medium text-text-primary">
              {deletingPage?.title}
            </span>
            &quot; ? L&apos;adresse publique associée ne sera plus accessible.
          </>
        }
        confirmLabel="Supprimer"
        variant="danger"
        isLoading={isDeleting}
      />

      <PageHeader
        title="Mes documents"
        description="Gérez tous les documents générés et synchronisés à partir de votre profil central."
        actions={
          <Button
            type="button"
            variant="primary"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nouveau document
          </Button>
        }
        className="mb-8"
      />

      {/* Toolbar : Onglets & Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1 bg-background-subtle border border-border p-1 rounded-panel overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-button text-ui-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-background text-text-primary shadow-sm border border-border'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Barre de recherche connectée */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un document..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-field text-ui-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Affichage des chargements */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : totalFiltered === 0 ? (
        /* État vide réutilisable */
        <EmptyState
          title={
            searchQuery
              ? 'Aucun résultat trouvé'
              : activeTab === 'all'
              ? 'Aucun document'
              : `Aucun document dans "${
                  TABS.find((t) => t.id === activeTab)?.label
                }"`
          }
          description={
            searchQuery
              ? `Aucun document ne correspond à la recherche "${searchQuery}".`
              : 'Créez votre premier document professionnel personnalisé à partir de votre profil.'
          }
          icon={<FileText className="w-10 h-10" />}
          action={
            searchQuery
              ? {
                  label: 'Réinitialiser la recherche',
                  onClick: () => setSearchQuery(''),
                  variant: 'secondary',
                }
              : {
                  label: 'Créer un document',
                  onClick: openCreateModal,
                  variant: 'primary',
                }
          }
          className="my-8"
        />
      ) : (
        /* Grille des documents */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* 1. Rendu des CVs */}
          {filteredCvs.map((cv: any) => {
            const previewImg = dbThemes.find(
              (t) => t.slug === cv.template_id || t.id === cv.template_id
            )?.preview_image;

            return (
              <div
                key={cv.id}
                className="group bg-background rounded-panel border border-border overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col"
                onClick={() => router.push(`/mes-documents/cv/${cv.id}`)}
              >
                <div className="aspect-[1/1.4] bg-background-subtle border-b border-border relative overflow-hidden flex items-center justify-center p-3">
                  <div className="w-full h-full bg-background shadow-sm rounded-sm relative border border-border transition-transform group-hover:scale-[1.01] overflow-hidden">
                    {previewImg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          previewImg.startsWith('http')
                            ? previewImg
                            : `${config.staticBaseUrl}/previews/${previewImg
                                .split('/')
                                .pop()}`
                        }
                        alt="Aperçu CV"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-2 w-full h-full">
                        <ThemeThumbnail
                          templateId={cv.template_id || 'classique'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Bouton d'édition au survol */}
                  <div className="absolute inset-0 bg-text-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                    <span className="px-3.5 py-1.5 bg-background text-text-primary rounded-button text-ui-sm font-medium shadow-md flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" />
                      Éditer
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3
                      className="font-semibold text-text-primary text-ui-sm line-clamp-1 flex-1"
                      title={cv.title}
                    >
                      {cv.title}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingCv(cv);
                      }}
                      className="text-text-muted hover:text-danger-text p-1 rounded-field hover:bg-danger-bg transition-colors"
                      title="Supprimer"
                      aria-label="Supprimer ce CV"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-ui-xs font-medium mt-auto pt-2 border-t border-border/50">
                    <Badge variant="primary" size="sm">
                      CV
                    </Badge>
                    <div className="flex items-center gap-1 text-text-muted">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(
                        new Date(cv.updated_at || cv.created_at),
                        { addSuffix: true, locale: fr }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 2. Rendu des Lettres de motivation */}
          {filteredLetters.map((lettre: any) => (
            <div
              key={lettre.id}
              className="group bg-background rounded-panel border border-border overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-200 cursor-pointer flex flex-col"
              onClick={() => router.push(`/mes-documents/lettre/${lettre.id}`)}
            >
              <div className="aspect-[1/1.4] bg-background-subtle border-b border-border relative overflow-hidden flex items-center justify-center p-3">
                <div className="w-full h-full bg-background shadow-sm rounded-sm relative border border-border p-4 flex flex-col overflow-hidden">
                  <div className="w-1/3 h-1.5 bg-border rounded-full mb-5 ml-auto" />
                  <div className="w-1/4 h-1.5 bg-border rounded-full mb-6" />
                  <div className="w-full h-1 bg-border rounded-full mb-2" />
                  <div className="w-full h-1 bg-border rounded-full mb-2" />
                  <div className="w-5/6 h-1 bg-border rounded-full mb-2" />
                  <div className="w-4/6 h-1 bg-border rounded-full mb-5" />
                  <div className="w-full h-1 bg-border rounded-full mb-2" />
                  <div className="w-5/6 h-1 bg-border rounded-full mb-2" />
                </div>

                <div className="absolute inset-0 bg-text-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <span className="px-3.5 py-1.5 bg-background text-text-primary rounded-button text-ui-sm font-medium shadow-md flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5" />
                    Éditer
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3
                    className="font-semibold text-text-primary text-ui-sm line-clamp-1 flex-1"
                    title={lettre.title}
                  >
                    {lettre.title}
                  </h3>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingCv(lettre);
                    }}
                    className="text-text-muted hover:text-danger-text p-1 rounded-field hover:bg-danger-bg transition-colors"
                    title="Supprimer"
                    aria-label="Supprimer cette lettre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-ui-xs font-medium mt-auto pt-2 border-t border-border/50">
                  <Badge variant="info" size="sm">
                    Lettre
                  </Badge>
                  <div className="flex items-center gap-1 text-text-muted">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(
                      new Date(lettre.updated_at || lettre.created_at),
                      { addSuffix: true, locale: fr }
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 3. Rendu des Profils Publics */}
          {filteredPages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              previewImage={
                dbThemes.find(
                  (t) => t.slug === page.theme || t.id === page.theme
                )?.preview_image
              }
              onEdit={() =>
                router.push(`/mes-documents/page-publique/${page.id}`)
              }
              onDelete={() => setDeletingPage(page)}
              onToggle={() => handleTogglePage(page)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MesDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-secondary">
          Chargement de vos documents...
        </div>
      }
    >
      <MesDocumentsContent />
    </Suspense>
  );
}
