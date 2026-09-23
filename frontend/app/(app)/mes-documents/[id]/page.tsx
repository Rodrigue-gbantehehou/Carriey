'use client';

import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { MasterProfile } from '@/types/profile';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { ArrowLeft, Download, LayoutTemplate, Palette, Check, Settings2, ZoomIn, ZoomOut, X, SlidersHorizontal } from 'lucide-react';
import { PageFlow, PageNumberPlugin, mmToPx } from 'pageflow-js';
import ExportModal from '@/components/app/shared/ExportModal';
import { ThemeThumbnail } from '@/components/app/cv/shared/ThemeThumbnail';
import DndList from '@/components/app/cv/editor/DndList';

import { CVTemplateRenderer, TEMPLATE_REGISTRY, getDefaultSections } from '@/components/app/cv/templates';
import { THEMES } from '@/config/themes';
import { API_BASE } from '@/lib/api';

const COLORS = [
  { id: 'default', name: 'Défaut', value: '#4F46E5' }, // Indigo (brand)
  { id: 'blue', name: 'Bleu', value: '#2563EB' },
  { id: 'emerald', name: 'Émeraude', value: '#059669' },
  { id: 'rose', name: 'Rose', value: '#E11D48' },
  { id: 'amber', name: 'Ambre', value: '#D97706' },
  { id: 'slate', name: 'Ardoise', value: '#475569' },
];

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
      title: profile?.title || '',
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
        description: exp.description,
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
      groups: profile?.skills?.length ? [{ items: profile.skills.map(s => s.name) }] : []
    },
    summary: profile?.bio || '',
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
    custom_sections: profile?.custom_sections || [],
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
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowThemeSelector(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-gray-900">Choisir un modèle</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t.id)}
                className={`relative aspect-[1/1.4] rounded-xl border-2 overflow-hidden flex flex-col transition-all bg-white group ${resolvedTemplateName === t.id.toLowerCase() ? 'border-indigo-600 shadow-md shadow-indigo-100' : 'border-gray-100 hover:border-indigo-300'}`}
              >
                <div className="flex-1 p-2 flex items-center justify-center border-b border-gray-50 bg-gray-50/50">
                  <ThemeThumbnail templateId={t.id} />
                </div>
                {cv.template_id === t.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="p-2 text-center bg-white">
                  <span className="text-xs font-semibold text-gray-900">{t.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
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
                  <div className="flex flex-wrap gap-3 opacity-60 pointer-events-none">
                    {COLORS.map(c => (
                      <div
                        key={c.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-offset-1 ring-transparent"
                        style={{ backgroundColor: c.value }}
                      >
                        {c.id === 'default' && <Check className="w-3 h-3 text-white" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ordre des Sections */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ordre des Sections</h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Glissez-déposez pour réorganiser. Certains templates à 2 colonnes séparent automatiquement les sections.
                  </p>
                  <DndList 
                    sections={dndSections} 
                    onMove={handleMoveSection} 
                  />
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Sélection du contenu</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Dans la V2, vous pourrez gérer quelles expériences spécifiques s'affichent.
                  </p>
                  <button onClick={() => router.push('/profil')} className="text-sm font-semibold text-indigo-600 hover:underline">
                    Aller modifier le Profil
                  </button>
                </div>
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
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              Personnalisation
            </h2>
            {renderSidebarContent()}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl p-4 sm:p-8 flex flex-col items-center min-h-[600px] border border-gray-200 relative overflow-auto custom-scrollbar" style={{ background: 'radial-gradient(circle, #d1d5db 1px, #f8f9fa 1px)', backgroundSize: '20px 20px' }}>

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 flex items-center p-1">
              <button
                onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-gray-500"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-gray-900 w-12 text-center cursor-default select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale(s => Math.min(2, s + 0.1))}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-gray-500"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Document Container */}
            <div
              className="relative mt-8 mb-8"
              style={{
                width: `calc(210mm * ${scale})`,
                transformOrigin: 'top center',
              }}
            >
              <div
                className="origin-top-left transition-transform duration-200"
                style={{
                  width: '210mm',
                  transform: `scale(${scale})`,
                }}
              >

                {/* SOURCE: Hidden off-screen so PageFlow can measure it */}
                <div
                  ref={sourceRef}
                  className="print-container absolute opacity-0 pointer-events-none"
                  style={{ width: '210mm', left: '-9999px', top: 0 }}
                >
                  <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-gray-500 font-semibold bg-white">Chargement du modèle...</div>}>
                    <CVTemplateRenderer
                      templateName={cv.template_id}
                      data={adapterData as any}
                      config={templateConfig as any}
                      apiBaseUrl={API_BASE}
                    />
                  </Suspense>
                </div>

                {/* TARGET: Where PageFlow injects the generated pages */}
                <div ref={targetRef} className="pageflow-output" />

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Settings Bottom Sheet */}
      {isSettingsOpen && (
        <>
          <div
            onClick={() => setIsSettingsOpen(false)}
            className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          />
          <div
            className={`lg:hidden fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${isSettingsOpen ? 'translate-y-0' : 'translate-y-full'}`}
          >
            <div className="flex justify-center py-3 bg-white rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100">
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
        </>
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cv={cv}
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
