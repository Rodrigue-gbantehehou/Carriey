'use client';

import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { MasterProfile } from '@/types/profile';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { ArrowLeft, Download, LayoutTemplate, Palette, Check, Settings2, ZoomIn, ZoomOut, X, SlidersHorizontal } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import ExportModal from '@/components/app/shared/ExportModal';
import { ThemeThumbnail } from '@/components/app/cv/shared/ThemeThumbnail';

import { TEMPLATE_REGISTRY } from '@/components/app/cv/templates';
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
  const [scale, setScale] = useState(0.9); // Adjusted default zoom


  const cv = cvs.find(c => c.id === params.id);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: cv?.title || 'CV',
  });

  if (!mounted) return null;

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

  // --- Adapter Logic (MasterProfile -> Template Data Format) ---
  const adapterData = {
    profile: {
      name: profile?.username || 'Votre Nom', // We don't have first/last name fields yet in master profile, just username for now
      title: profile?.title || '',
      email: profile?.contact_email || '',
      phone: profile?.contact_phone || '',
      location: profile?.location || '',
      website: profile?.website || '',
      photo: (profile as any)?.photo_url || '',
    },
    experience: profile?.experiences
      ?.filter(exp => !(cv.disabledItems?.experiences || []).includes(exp.id))
      .map(exp => ({
        position: exp.title,
        company: exp.company,
        location: exp.location,
        start: exp.start_date,
        end: exp.current ? 'Présent' : exp.end_date,
        description: exp.description,
      })) || [],
    education: profile?.educations
      ?.filter(edu => !(cv.disabledItems?.educations || []).includes(edu.id))
      .map(edu => ({
        degree: edu.degree,
        institution: edu.school,
        location: edu.location,
        start: edu.start_date,
        end: edu.end_date,
        description: edu.description,
      })) || [],
    projects: profile?.projects
      ?.filter(proj => !(cv.disabledItems?.projects || []).includes(proj.id))
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
    languages: [],
    custom_sections: [],
  };

  const ActiveTemplateComponent = TEMPLATE_REGISTRY[cv.templateId] || TEMPLATE_REGISTRY.classique;

  // Fake config to satisfy the old template props
  const templateConfig = {
    templateName: cv.templateId,
    sections: [
      { type: 'profile', enabled: true },
      { type: 'summary', enabled: !!profile?.bio && !(cv.disabledSections || []).includes('about') },
      { type: 'experience', enabled: !!profile?.experiences?.length && !(cv.disabledSections || []).includes('experiences') },
      { type: 'education', enabled: !!profile?.educations?.length && !(cv.disabledSections || []).includes('educations') },
      { type: 'skills', enabled: !!profile?.skills?.length && !(cv.disabledSections || []).includes('skills') },
      { type: 'projects', enabled: !!profile?.projects?.length && !(cv.disabledSections || []).includes('projects') },
      { type: 'contact', enabled: true },
    ]
  };

  return (
    <div className="flex flex-col h-screen bg-[#F3F4F6] overflow-hidden">
      
      {/* Top Navbar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/mes-documents')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-indigo-600" />
            </div>
            <input 
              type="text" 
              value={cv.title}
              onChange={(e) => updateCv(cv.id, { title: e.target.value })}
              className="text-sm font-bold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 w-64 hover:bg-gray-50 transition-colors"
            />
          </div>
        </div>
        <div>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="pointer-events-auto inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-[#F3F4F6]">
        
        {/* Floating Action Button (Bottom Left) */}
        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="absolute bottom-8 left-8 z-20 w-14 h-14 bg-white rounded-full shadow-2xl shadow-indigo-600/20 border border-gray-100 flex items-center justify-center text-gray-700 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all group"
          title="Options du document"
        >
          <SlidersHorizontal className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
        </button>

        {/* Zoom Controls Overlay (Bottom Right) */}
        <div className="absolute bottom-8 right-8 z-20 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center p-1.5 text-gray-700">
          <button 
            onClick={() => setScale(s => Math.max(0.3, s - 0.1))} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-gray-500"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-900 w-14 text-center cursor-default select-none">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(s => Math.min(2, s + 0.1))} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none text-gray-500"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Backdrop overlay when settings are open */}
        {isSettingsOpen && (
          <div 
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] z-30 transition-opacity"
          />
        )}

        {/* Slide-over Settings Panel */}
        <div 
          className={`absolute top-0 bottom-0 left-0 w-[360px] bg-white shadow-2xl shadow-gray-900/20 z-40 transform transition-transform duration-300 ease-out flex flex-col ${isSettingsOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Panel Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 bg-white">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Options
            </h2>
            <button 
              onClick={() => setIsSettingsOpen(false)} 
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {showThemeSelector ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <button 
                  onClick={() => setShowThemeSelector(false)} 
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all border border-transparent hover:border-gray-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold text-gray-900">Choisir un modèle</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-white">
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { updateCv(cv.id, { templateId: t.id }); setShowThemeSelector(false); }}
                      className={`relative aspect-[1/1.4] rounded-xl border-2 overflow-hidden flex flex-col transition-all bg-white group ${cv.templateId === t.id ? 'border-indigo-600 shadow-md shadow-indigo-100' : 'border-gray-100 hover:border-indigo-300'}`}
                    >
                      <div className="flex-1 p-3 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                        <ThemeThumbnail templateId={t.id} />
                      </div>
                      {cv.templateId === t.id && (
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
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Tabs */}
              <div className="flex p-2 border-b border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setActiveTab('design')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'design' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Palette className="w-4 h-4" /> Design
                </button>
                <button 
                  onClick={() => setActiveTab('content')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Settings2 className="w-4 h-4" /> Contenu
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {activeTab === 'design' ? (
                  <div className="space-y-8">
                    {/* Modèle */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Modèle de CV</h3>
                      <div className="p-3 border border-gray-200 rounded-xl flex items-center gap-4 bg-gray-50/50">
                        <div className="w-12 h-16 bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden p-1 flex-shrink-0">
                          <ThemeThumbnail templateId={cv.templateId} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-bold text-gray-900">{THEMES.find(t => t.id === cv.templateId)?.label}</p>
                          <button 
                            onClick={() => setShowThemeSelector(true)} 
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline mt-1"
                          >
                            Changer de modèle
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Couleurs (Fake for V1 since styles might be hardcoded in templates) */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Couleur d'accentuation</h3>
                      <div className="flex flex-wrap gap-3">
                        {COLORS.map(c => (
                          <button
                            key={c.id}
                            className="w-10 h-10 rounded-full flex items-center justify-center ring-2 ring-offset-2 ring-transparent hover:scale-110 transition-all focus:outline-none"
                            style={{ backgroundColor: c.value }}
                            title={c.name}
                          >
                            {c.id === 'default' && <Check className="w-4 h-4 text-white" />}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3 italic">Bientôt disponible pour tous les modèles.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-500">
                      <Settings2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Sélection du contenu</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                      Dans la V2, vous pourrez cocher/décocher précisément les expériences et formations à inclure.
                    </p>
                    <button onClick={() => router.push('/profil')} className="text-sm font-semibold text-indigo-600 hover:underline">
                      Modifier mon Profil Global
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Canvas Scroll Area */}
        <div className="flex-1 overflow-auto flex items-start justify-center custom-scrollbar">
            
            {/* 
              We use a wrapper to hold the scaled space so the scrollbars work correctly.
              Since transform: scale doesn't affect the document flow layout dimensions,
              we manually scale the wrapper's dimensions.
            */}
            <div 
              className="flex items-center justify-center"
              style={{
                width: `calc(210mm * ${scale} + 100px)`, // Add padding
                minHeight: `calc(297mm * ${scale} + 100px)`,
                padding: '50px 0'
              }}
            >
              {/* A4 Page Container */}
              <div 
                className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] origin-center transition-transform duration-200"
                style={{ 
                  width: '210mm', 
                  minHeight: '297mm',
                  transform: `scale(${scale})`,
                }}
              >
                <div ref={printRef} className="print-container h-full">
                  <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-gray-500 font-semibold bg-white">Chargement du modèle...</div>}>
                    <ActiveTemplateComponent 
                      data={adapterData as any} 
                      config={templateConfig as any} 
                      apiBaseUrl={API_BASE} 
                    />
                  </Suspense>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        cv={cv} 
        onPrint={handlePrint} 
      />
      
      <style dangerouslySetInnerHTML={{__html: `
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
