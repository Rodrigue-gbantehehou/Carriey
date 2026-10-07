'use client';
import config from '@/lib/config';

import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Download, Save, Loader2, ZoomIn, ZoomOut, CheckCircle2, PenTool, Palette, Settings2, Check, Sparkles, Briefcase, AlignLeft, FileText, X } from 'lucide-react';
import { cvApi } from '@/lib/cv-api';
import { API_BASE } from '@/lib/api';
import { AIAssistant } from '@/components/app/shared/AIAssistant';
import ExportModal from '@/components/app/shared/ExportModal';
import { LetterTemplateRenderer } from '@/components/app/letter/LetterTemplateRenderer';
import { LetterForm } from '@/components/app/letter/editor/LetterForm';
import { AILetterGenerator } from '@/components/app/letter/editor/AILetterGenerator';



export default function CoverLetterEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const cvs = useCvStore(state => state.cvs);
  const updateCv = useCvStore(state => state.updateCv);
  const profile = useProfileStore(state => state.profile);
  
  const [mounted, setMounted] = useState(false);
  const [localLoading, setLocalLoading] = useState(true); // Always start true unless we are sure we don't need to fetch
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  const [dbThemes, setDbThemes] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/templates`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const letterThemes = data.filter((t: any) => t.template_type === 'cover_letter');
        if (letterThemes.length > 0) {
            setDbThemes(letterThemes);
        }
      })
      .catch(() => {});
  }, []);
  
  const cv = cvs.find(c => c.id === params.id);
  const { data: session, status } = useSession();

  // Form State
  const [formData, setFormData] = useState({
    title: 'Lettre de motivation',
    recipientName: '',
    companyName: '',
    recipientAddress: '',
    subject: '',
    salutation: 'Madame, Monsieur,',
    body: '',
    closing: "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
  });

  useEffect(() => {
    setMounted(true);
    const fetchCv = async () => {
      if (cv) {
        setLocalLoading(false);
        return;
      }
      
      if (status === 'unauthenticated') {
        setLocalLoading(false);
        return;
      }

      if (!cv && session?.user?.accessToken) {
        setLocalLoading(true);
        try {
          const res = await fetch(`${API_BASE}/resumes/${params.id}`, {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            const document = Array.isArray(data) ? data[0] : data;
            if (document) {
              const currentCvs = useCvStore.getState().cvs;
              if (!currentCvs.find(c => c.id === document.id)) {
                useCvStore.getState().addCv(document);
              }
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLocalLoading(false);
        }
      }
    };
    fetchCv();

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

  useEffect(() => {
    if (cv) {
      setFormData({
        title: cv.title || 'Lettre de motivation',
        recipientName: cv.content?.recipient?.name || '',
        companyName: cv.content?.recipient?.company || '',
        recipientAddress: cv.content?.recipient?.address || '',
        subject: cv.content?.subject || '',
        salutation: cv.content?.salutation || 'Madame, Monsieur,',
        body: cv.content?.body || '',
        closing: cv.content?.closing || "Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.",
      });
    }
  }, [cv]);

  const handleSave = async () => {
    if (!session?.user?.accessToken || !cv) return;
    setIsSaving(true);
    try {
      const updated = await cvApi.updateResume(session.user.accessToken, cv.id, {
        title: formData.title,
        content: {
          recipient: {
            name: formData.recipientName,
            company: formData.companyName,
            address: formData.recipientAddress,
          },
          subject: formData.subject,
          salutation: formData.salutation,
          body: formData.body,
          closing: formData.closing,
        }
      });
      updateCv(updated.id, updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectTheme = async (themeId: string) => {
    if (!cv) return;
    updateCv(cv.id, { template_id: themeId });
    if (session?.user?.accessToken) {
      try {
        await cvApi.updateResume(session.user.accessToken, cv.id, { template_id: themeId });
      } catch (err) {
        console.error('Erreur lors de la sauvegarde du thème', err);
      }
    }
  };



  const handleExportAction = async (format: string, quality: string) => {
    if (!cv) return;
    if (format === 'pdf') {
      try {
        const { exportPdf } = await import('@/lib/api');
        
        const mappedTemplate = currentTemplate;
        
        const res = await exportPdf(
          { templateName: mappedTemplate } as any,
          { profile, formData, doc_type: 'cover_letter' } as any,
          undefined,
          undefined,
          session?.user?.accessToken,
          undefined,
          'trial',
          cv.template_id,
          "sandbox-bypass-id"
        );
        if (res.url) {
          try {
            const fileRes = await fetch(res.url);
            const blob = await fileRes.blob();
            const localUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = localUrl;
            link.setAttribute('download', `${formData.title || 'Lettre'}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(localUrl);
          } catch (e) {
            // Fallback if CORS fails
            window.open(res.url, '_blank');
          }
        }
      } catch (err) {
        console.error("Erreur lors de l'export PDF:", err);
        alert("Une erreur est survenue lors de la génération du PDF.");
      }
      setIsExportModalOpen(false);
    } else if (format === 'docx') {
      try {
        const { exportDocx } = await import('@/lib/api');
        
        const mappedTemplate = currentTemplate;
                               
        const res = await exportDocx(
          { templateName: mappedTemplate } as any,
          { profile, formData, doc_type: 'cover_letter' } as any,
          undefined,
          undefined,
          session?.user?.accessToken,
          undefined,
          'trial',
          cv.template_id,
          "sandbox-bypass-id"
        );
        if (res.url) {
          const link = document.createElement('a');
          link.href = res.url;
          link.setAttribute('download', `${formData.title || 'Lettre'}.docx`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error("Erreur lors de l'export DOCX:", err);
        alert("Une erreur est survenue lors de la génération du fichier Word.");
      }
      setIsExportModalOpen(false);
    }
  };

  if (!mounted || localLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lettre introuvable</h2>
        <button onClick={() => router.push('/mes-documents')} className="text-indigo-600 font-semibold hover:underline">
          Retour à mes documents
        </button>
      </div>
    );
  }

  const displayName = profile?.first_name || profile?.last_name
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : profile?.username || 'Votre Nom';

  const rawTemplate = cv.template_id || 'classique';
  const currentTemplate = rawTemplate;

  const currentThemeObj = dbThemes.find(t => t.slug === currentTemplate || t.id === currentTemplate);
  const resolvedFolder = currentThemeObj?.folder_name || undefined;

  const FormContent = () => (
    <LetterForm 
      formData={formData} 
      setFormData={setFormData} 
      onSave={handleSave} 
      isSaving={isSaving} 
      savedSuccess={savedSuccess} 
    />
  );

  const DesignContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Choix du modèle</h3>
        <div className="grid grid-cols-2 gap-3">
          {dbThemes.map(t => (
            <button
              key={t.slug || t.id}
              onClick={() => handleSelectTheme(t.slug || t.id)}
              className={`relative aspect-[1/1.2] rounded-xl border-2 overflow-hidden flex flex-col transition-all bg-white group ${currentTemplate === (t.slug || t.id) ? 'border-indigo-600 shadow-md shadow-indigo-100' : 'border-gray-100 hover:border-indigo-300'}`}
            >
              <div className="flex-1 bg-gray-50/50 p-2 border-b border-gray-50 flex items-center justify-center">
                {t.preview_image ? (
                  <img 
                    src={t.preview_image.startsWith('http') ? t.preview_image : `${config.staticBaseUrl}/previews/${t.preview_image.split('/').pop()}`}
                    alt={t.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <>
                    {(t.slug === 'classique' || t.slug === 'classic') && <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded flex flex-col p-1.5"><div className="w-1/2 h-1 bg-gray-300 mb-2"/><div className="w-1/3 h-1 bg-gray-300 ml-auto mb-2"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-3/4 h-1 bg-gray-200"/></div>}
                    {(t.slug === 'moderne' || t.slug === 'modern') && <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded flex flex-col p-1.5 border-l-4 border-l-indigo-500"><div className="w-1/2 h-1 bg-gray-800 mb-2"/><div className="w-1/3 h-1 bg-gray-400 ml-auto mb-2"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-3/4 h-1 bg-gray-200"/></div>}
                    {(t.slug === 'minimal') && <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded flex flex-col p-1.5 items-center justify-center"><div className="w-1/2 h-1 bg-gray-400 mb-3"/><div className="w-full h-1 bg-gray-100 mb-0.5"/><div className="w-full h-1 bg-gray-100 mb-0.5"/><div className="w-3/4 h-1 bg-gray-100"/></div>}
                    {!['classique', 'classic', 'moderne', 'modern', 'minimal'].includes(t.slug) && <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded flex flex-col p-1.5"><div className="w-1/2 h-1 bg-gray-400 mb-2"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-3/4 h-1 bg-gray-200"/></div>}
                  </>
                )}
              </div>
              {currentTemplate === (t.slug || t.id) && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              <div className="p-2 text-center bg-white">
                <span className="text-xs font-semibold text-gray-900">{t.name || t.label}</span>
              </div>
            </button>
          ))}
          {dbThemes.length === 0 && (
            <div className="col-span-2 p-4 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-xl">
              Aucun modèle disponible pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const AIContent = () => (
    <AILetterGenerator 
      session={session}
      cv={cv}
      formData={formData}
      setFormData={setFormData}
      updateCv={updateCv}
      setActiveTab={() => {
        setIsAIModalOpen(false);
        setIsFormModalOpen(true);
      }}
    />
  );

  const renderModal = (isOpen: boolean, onClose: () => void, title: string, icon: React.ReactNode, children: React.ReactNode) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center p-0 sm:p-4">
        <div className="hidden sm:block absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white w-full h-[100dvh] sm:h-auto sm:w-[600px] sm:max-h-[90vh] flex flex-col sm:rounded-2xl shadow-2xl z-10 overflow-hidden animate-in fade-in sm:zoom-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {icon}
              {title}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto bg-gray-50 flex-1 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const renderSidebarMenu = () => (
    <div className="space-y-4">
      {/* Design Button */}
      <button 
        onClick={() => setIsDesignModalOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-indigo-600 shadow-sm border border-gray-200 flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Choix du modèle</p>
            <p className="text-xs text-gray-500 font-medium group-hover:underline">{currentThemeObj?.name || 'Classique'}</p>
          </div>
        </div>
      </button>

      {/* Edit Button */}
      <button 
        onClick={() => setIsFormModalOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-indigo-600 shadow-sm border border-gray-200 flex items-center justify-center">
            <PenTool className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900">Éditer la lettre</p>
            <p className="text-xs text-gray-500 font-medium group-hover:underline">Modifier le contenu</p>
          </div>
        </div>
      </button>

      {/* AI Button */}
      <button 
        onClick={() => setIsAIModalOpen(true)}
        className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-indigo-600 shadow-sm border border-indigo-200 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-indigo-900">Assistant IA</p>
            <p className="text-xs text-indigo-600 font-medium group-hover:underline">Générer avec l'IA</p>
          </div>
        </div>
      </button>
    </div>
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .a4-print-container, .a4-print-container * { visibility: visible; }
          .a4-print-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            margin: 0; 
            padding: 0; 
            box-shadow: none !important;
            transform: none !important;
          }
          @page { size: A4 portrait; margin: 20mm; }
        }
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <button onClick={() => router.push('/mes-documents')} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux documents
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="text-2xl font-bold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 w-full max-w-xs sm:max-w-md hover:bg-gray-50 transition-colors placeholder:text-gray-400"
              placeholder="Titre de la lettre..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            <Settings2 className="w-4 h-4" /> Options
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="hidden lg:inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-full font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
            {savedSuccess ? 'Sauvegardé' : 'Enregistrer'}
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 relative z-[60]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6 z-[60]">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              Personnalisation
            </h2>
            {renderSidebarMenu()}
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
              className="relative mt-8 mb-8 flex-shrink-0 transition-all duration-200"
              style={{
                width: `calc(210mm * ${scale})`,
                height: `calc(297mm * ${scale})`,
              }}
            >
              <div
                className="a4-print-container origin-top-left transition-transform duration-200 bg-white shadow-xl border border-gray-200 absolute top-0 left-0 overflow-hidden"
                style={{
                  width: '210mm',
                  height: '297mm',
                  transform: `scale(${scale})`,
                  padding: '20mm',
                }}
              >
                <LetterTemplateRenderer templateName={currentTemplate} data={{ profile, formData }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Settings Modal */}
      {isSettingsOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex flex-col p-0">
          <div className="relative bg-white w-full h-[100dvh] flex flex-col z-10 overflow-hidden animate-in fade-in duration-200">
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-indigo-600" /> Personnalisation
              </h2>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {renderSidebarMenu()}
            </div>
          </div>
        </div>
      )}

      {/* Tool Modals */}
      {renderModal(isDesignModalOpen, () => setIsDesignModalOpen(false), "Choix du modèle", <Palette className="w-5 h-5 text-indigo-600" />, DesignContent())}
      {renderModal(isFormModalOpen, () => setIsFormModalOpen(false), "Éditer la lettre", <PenTool className="w-5 h-5 text-indigo-600" />, FormContent())}
      {renderModal(isAIModalOpen, () => setIsAIModalOpen(false), "Assistant IA", <Sparkles className="w-5 h-5 text-indigo-600" />, AIContent())}

      {cv && (
        <ExportModal 
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          cv={cv}
          onExport={handleExportAction}
        />
      )}
    </div>
  );
}
