'use client';

import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { ArrowLeft, Download, LayoutTemplate, Palette, Check, Settings2, ZoomIn, ZoomOut, X, SlidersHorizontal, ListOrdered } from 'lucide-react';
import { PageFlow, PageNumberPlugin, mmToPx } from 'pageflow-js';
import ExportModal from '@/components/app/shared/ExportModal';
import { ThemeThumbnail } from '@/components/app/cv/shared/ThemeThumbnail';
import DndList from '@/components/app/cv/editor/DndList';

import { TEMPLATE_REGISTRY, getDefaultSections } from '@/components/app/cv/templates';
import { THEMES } from '@/config/themes';
import { API_BASE } from '@/lib/api';

import { ThemeSelector } from '@/components/app/cv/editor/ThemeSelector';
import { ColorPicker } from '@/components/app/cv/editor/ColorPicker';
import { CVPreview } from '@/components/app/cv/editor/CVPreview';
import { ContentSelectorModal } from '@/components/app/cv/editor/ContentSelectorModal';

export default function CvEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const cvs = useCvStore(state => state.cvs);
  const updateCv = useCvStore(state => state.updateCv);
  const profile = useProfileStore(state => state.profile);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'content'>('design');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Controls the floating sidebar
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [scale, setScale] = useState(0.5); // Adjusted default zoom to 50%


  const cv = cvs.find(c => c.id === params.id);
  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Fetch CV if it's missing from store
    const fetchCv = async () => {
      if (!cv && session?.user?.accessToken) {
        setLocalLoading(true);
        try {
          const res = await fetch(`${API_BASE}/resumes/${params.id}`, {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            // Data is a single CV object, but setCvs expects an array.
            // If the store is empty, we just set it with this single CV.
            useCvStore.getState().setCvs(Array.isArray(data) ? data : [data]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLocalLoading(false);
        }
      }
    };
    fetchCv();

    // Fetch profile if it's missing from store
    const fetchProfile = async () => {
      if (!profile && session?.user?.accessToken) {
        try {
          const { profileApi } = await import('@/lib/profile-api');
          const data = await profileApi.getProfile(session.user.accessToken);
          if (data) {
            useProfileStore.getState().setProfile(data);
          }
        } catch (err) {
          console.error('Failed to load profile in editor', err);
        }
      }
    };
    fetchProfile();
  }, [cv, profile, session, params.id]);

  // --- Computed values (safe with null cv) ---
  const displayName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile?.username || 'Votre Nom';

  const adapterData = cv ? {
    profile: {
      name: displayName,
      title: cv.content?.overrides?.title !== undefined ? cv.content.overrides.title : profile?.title || '',
      email: profile?.contact_email || '',
      phone: profile?.contact_phone || '',
      location: profile?.location || '',
      website: profile?.website || '',
      photo: (profile as any)?.photo_url ? require('@/lib/photo-url').getPhotoUrl((profile as any).photo_url) : '',
    },
    experience: profile?.experiences
      ?.filter(exp => !(cv.content?.disabledItems?.experiences || []).includes(exp.id))
      .map(exp => ({
        position: exp.title,
        company: exp.company,
        location: exp.location,
        start: exp.start_date,
        end: exp.current ? 'Présent' : exp.end_date,
        description: cv.content?.overrides?.experiences?.[exp.id]?.description || exp.description,
      })) || [],
    education: profile?.educations
      ?.filter(edu => !(cv.content?.disabledItems?.educations || []).includes(edu.id))
      .map(edu => ({
        degree: edu.degree,
        institution: edu.school,
        location: edu.location,
        start: edu.start_date,
        end: edu.end_date,
        description: edu.description,
      })) || [],
    projects: profile?.projects
      ?.filter(proj => !(cv.content?.disabledItems?.projects || []).includes(proj.id))
      .map(proj => ({
        name: proj.name,
        description: proj.description || '',
        link: proj.url,
        dates: proj.start_date ? `${proj.start_date} - ${proj.end_date || 'Présent'}` : undefined,
      })) || [],
    skills: {
      groups: profile?.skills?.length ? [{ items: profile.skills.filter(s => !(cv.content?.disabledItems?.skills || []).includes(s.id)).map(s => s.name) }] : []
    },
    summary: cv.content?.overrides?.summary || profile?.bio || '',
    languages: profile?.languages
      ?.filter(lang => !(cv.content?.disabledItems?.languages || []).includes(lang.id))
      .map(lang => ({
        name: lang.name,
        level: lang.level || '',
      })) || [],
    certifications: profile?.certifications
      ?.filter(cert => !(cv.content?.disabledItems?.certifications || []).includes(cert.id))
      .map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
        url: cert.url,
      })) || [],
    custom_sections: profile?.custom_sections?.map(cs => ({
      ...cs,
      items: cs.items?.filter(item => !(cv.content?.disabledItems?.[`custom_${cs.id}`] || []).includes(item.id)) || []
    })) || [],
  } : null;

  const rawTemplateId = (cv?.template_id || 'classique').toLowerCase();
  const resolvedTemplateName = TEMPLATE_REGISTRY[rawTemplateId] ? rawTemplateId : 'classique';

  const templateConfig = cv ? {
    templateName: resolvedTemplateName,
    sections: (() => {
      // Si l'utilisateur a sauvegardé un ordre on l'utilise, sinon on prend le défaut
      let baseSections = cv.config?.sections && cv.config.sections.length > 0 
        ? cv.config.sections 
        : getDefaultSections(resolvedTemplateName);
        
      const disabledList = cv.content?.disabledSections || [];
      const isTypeDisabled = (type: string) => {
        if (type === 'summary') return disabledList.includes('about') || !profile?.bio;
        if (type === 'experience') return disabledList.includes('experiences');
        if (type === 'education') return disabledList.includes('educations');
        return disabledList.includes(type);
      };

      // Ensure custom sections are included in the array if they are not already there
      const customSections = (profile?.custom_sections || []).map((cs: any) => ({
        type: `custom_${cs.id}`,
        label: cs.title,
        enabled: !disabledList.includes(`custom_${cs.id}`),
        column: cs.column || 'right',
      }));

      // Filter out custom sections that are already in baseSections to prevent duplicates
      const existingTypes = new Set(baseSections.map((s: any) => s.type));
      const missingCustomSections = customSections.filter((cs: any) => !existingTypes.has(cs.type));

      return [...baseSections, ...missingCustomSections].map((s: any) => ({
        ...s,
        enabled: !isTypeDisabled(s.type)
      }));
    })()
  } : null;

  // --- PageFlow Execution ---
  useEffect(() => {
    if (!mounted || localLoading || !sourceRef.current || !targetRef.current) return;

    let isCancelled = false;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;

    const runPageFlow = async () => {
      if (isCancelled || !sourceRef.current || !targetRef.current) return;

      try {

        const pf = new PageFlow({
          pageSize: 'A4',
          margin: { top: 0, right: 0, bottom: mmToPx(1), left: 0 },
          atomic: ['.header', '.item-group', '.skill-item', '.about-text', '.meta-item', '.exp-meta', '.exp-header'],
          keepWithNext: ['.section-title', '.exp-meta', '.exp-header'],
          pagination: { lookahead: 3, optimizeWhitespace: true },
          plugins: [
            new PageNumberPlugin({ position: 'bottom-right' })
          ]
        });

        targetRef.current.innerHTML = '';
        await pf.flow(sourceRef.current, targetRef.current);

      } catch (error) {
        console.error("PageFlow error:", error);
      }
    };

    // Listen for 'pageflow:css-ready' dispatched by <RemoteStyles> when CSS finishes loading
    const handleCssReady = () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      runPageFlow();
    };

    sourceRef.current.addEventListener('pageflow:css-ready', handleCssReady);

    // Fallback: run after 2s if RemoteStyles never fires (e.g. template has no remote CSS)
    fallbackTimeout = setTimeout(() => {
      runPageFlow();
    }, 2000);

    return () => {
      isCancelled = true;
      sourceRef.current?.removeEventListener('pageflow:css-ready', handleCssReady);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [mounted, localLoading, adapterData, templateConfig]);



  const handleExportAction = async (format: string, quality: string) => {
    if (!cv) return;
    if (format === 'pdf') {
      try {
        const { exportPdf } = await import('@/lib/api');

        // Mock template object as required by exportPdf
        const templateObj = {
          id: cv.template_id,
          templateName: cv.template_id,
          name: cv.template_id,
          description: '',
          price: 0,
          thumbnail: '',
          category: 'all'
        };

        const res = await exportPdf(
          templateObj as any,
          adapterData as any,
          undefined,
          templateConfig as any,
          session?.user?.accessToken,
          undefined,
          'trial',
          cv.template_id,
          "sandbox-bypass-id"
        );

        if (res.url) {
          // Trigger file download
          const link = document.createElement('a');
          link.href = res.url;
          link.setAttribute('download', `${cv.title || 'CV'}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error("Erreur lors de l'export PDF:", err);
        alert("Une erreur est survenue lors de la génération du PDF.");
      }
    } else {
      alert("L'export Word sera bientôt disponible !");
    }
  };



  if (!mounted || localLoading) return null;

  if (!cv) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CV introuvable</h1>
        <button onClick={() => router.push('/mes-documents')} className="text-indigo-600 hover:underline">
          Retour à mes documents
        </button>
      </div>
    );
  }

  const handleSelectTheme = async (themeId: string) => {
    if (!cv) return;
    updateCv(cv.id, { template_id: themeId });
    setShowThemeSelector(false);
    if (session?.user?.accessToken) {
      try {
        const { cvApi } = await import('@/lib/cv-api');
        await cvApi.updateResume(session.user.accessToken, cv.id, { template_id: themeId });
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du thème', err);
      }
    }
  };

  const handleMoveSection = async (fromIndex: number, toIndex: number) => {
    if (!templateConfig || !cv) return;
    const newSections = [...templateConfig.sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);

    // Save locally
    updateCv(cv.id, { config: { ...cv.config, sections: newSections } });

    // Save to DB
    if (session?.user?.accessToken) {
      try {
        const { cvApi } = await import('@/lib/cv-api');
        // On ne sauvegarde que l'ordre des types et colonnes pour ne pas polluer avec d'autres états transitoires
        const safeSectionsToSave = newSections.map(s => ({
            type: s.type,
            column: s.column,
            enabled: s.enabled
        }));
        await cvApi.updateResume(session.user.accessToken, cv.id, { config: { ...cv.config, sections: safeSectionsToSave } });
      } catch (err) {
        console.error('Erreur lors de la sauvegarde de l\'ordre des sections', err);
      }
    }
  };

  const getFrenchLabel = (type: string, label?: string) => {
    if (label) return label;
    const labels: Record<string, string> = {
      profile: 'Profil',
      photo: 'Photo',
      identity: 'Identité',
      contact: 'Contact',
      skills: 'Compétences',
      languages: 'Langues',
      interests: 'Centres d\'intérêt',
      summary: 'Résumé',
      experience: 'Expériences',
      education: 'Formations',
      certifications: 'Certifications',
      projects: 'Projets',
      references: 'Références'
    };
    return labels[type] || type;
  };

  const dndSections = templateConfig?.sections.map(s => ({
    label: getFrenchLabel(s.type, s.label),
    type: s.type
  })) || [];

  const renderSidebarContent = () => (
    <>
      {showThemeSelector ? (
        <ThemeSelector 
          currentTemplateId={cv.template_id}
          resolvedTemplateName={resolvedTemplateName}
          onSelectTheme={handleSelectTheme}
          onClose={() => setShowThemeSelector(false)}
        />
      ) : (
        <div className="flex flex-col">
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100/80 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'design' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Palette className="w-4 h-4" /> Design
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Settings2 className="w-4 h-4" /> Contenu
            </button>
          </div>

          {/* Panel Content */}
          <div>
            {activeTab === 'design' ? (
              <div className="space-y-6">
                {/* Modèle */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Modèle actuel</h3>
                  <div className="p-3 border border-gray-200 rounded-xl flex items-center gap-4 bg-gray-50/50 hover:border-indigo-200 transition-colors cursor-pointer group" onClick={() => setShowThemeSelector(true)}>
                    <div className="w-12 h-16 bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden p-1 flex-shrink-0">
                      <ThemeThumbnail templateId={cv.template_id} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold text-gray-900">{THEMES.find(t => t.id === cv.template_id)?.label || 'Classique'}</p>
                      <p className="text-xs font-medium text-indigo-600 mt-1 group-hover:underline">Changer de modèle</p>
                    </div>
                  </div>
                </div>

                {/* Couleurs */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Couleur (Bientôt)</h3>
                  <ColorPicker />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ordre des Sections */}
                <div>
                  <button 
                    onClick={() => setIsOrderModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white text-gray-700 shadow-sm border border-gray-200 flex items-center justify-center">
                        <ListOrdered className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900">Ordre des Sections</p>
                        <p className="text-xs text-gray-500 font-medium group-hover:underline">Réorganiser les blocs</p>
                      </div>
                    </div>
                  </button>

                  {isOrderModalOpen && (
                    <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4">
                      <div className="hidden sm:block absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOrderModalOpen(false)} />
                      <div className="relative bg-white w-full h-[100dvh] sm:h-auto sm:max-w-md sm:max-h-[90vh] flex flex-col sm:rounded-2xl shadow-2xl z-10 overflow-hidden animate-in fade-in sm:zoom-in duration-200">
                        
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ListOrdered className="w-5 h-5 text-indigo-600" />
                            Réorganiser les sections
                          </h3>
                          <button onClick={() => setIsOrderModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50">
                          <p className="text-sm text-gray-500 mb-6">
                            Glissez-déposez pour réorganiser. L'ordre peut être ajusté différemment selon le modèle choisi.
                          </p>
                          <DndList 
                            sections={dndSections} 
                            onMove={handleMoveSection} 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <ContentSelectorModal cvId={cv.id} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button onClick={() => router.push('/mes-documents')} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux documents
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-indigo-600" />
            </div>
            <input
              type="text"
              value={cv.title}
              onChange={(e) => updateCv(cv.id, { title: e.target.value })}
              className="text-2xl font-bold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 w-full max-w-xs sm:max-w-md hover:bg-gray-50 transition-colors placeholder:text-gray-400"
              placeholder="Titre du document..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Options
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 relative z-[60]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6 z-[60]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              Personnalisation
            </h2>
            {renderSidebarContent()}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-8 h-[calc(100vh-120px)] sticky top-6">
          <CVPreview
            scale={scale}
            setScale={setScale}
            sourceRef={sourceRef}
            targetRef={targetRef}
            templateId={cv.template_id}
            adapterData={adapterData}
            templateConfig={templateConfig}
          />
        </div>
      </div>

      {/* Mobile Settings Modal (Personnalisation) */}
      {isSettingsOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-col p-0">
          <div className="relative bg-white w-full h-[100dvh] flex flex-col z-10 overflow-hidden animate-in fade-in duration-200">
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-600" /> Personnalisation
              </h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cv={cv!}
        onExport={handleExportAction}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
