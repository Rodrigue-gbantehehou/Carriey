'use client';

import { useCvStore } from '@/store/cv';
import { useProfileStore } from '@/store/profile';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Download, Save, Loader2, ZoomIn, ZoomOut, CheckCircle2, PenTool, LayoutTemplate, FileText, X, Palette, Settings2, Check } from 'lucide-react';
import { PageFlow, PageNumberPlugin, mmToPx } from 'pageflow-js';
import { cvApi } from '@/lib/cv-api';
import { API_BASE } from '@/lib/api';

const LETTER_THEMES = [
  { id: 'classic', label: 'Classique' },
  { id: 'modern', label: 'Moderne' },
  { id: 'minimal', label: 'Épuré' }
];

export default function CoverLetterEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const cvs = useCvStore(state => state.cvs);
  const updateCv = useCvStore(state => state.updateCv);
  const profile = useProfileStore(state => state.profile);
  
  const [mounted, setMounted] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [scale, setScale] = useState(0.5);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  
  const cv = cvs.find(c => c.id === params.id);
  const { data: session } = useSession();

  const sourceRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

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
      if (!cv && session?.user?.accessToken) {
        setLocalLoading(true);
        try {
          const res = await fetch(`${API_BASE}/resumes/${params.id}`, {
            headers: { Authorization: `Bearer ${session.user.accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
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

  useEffect(() => {
    if (!mounted || localLoading || !sourceRef.current || !targetRef.current) return;
    let isCancelled = false;
    let timeoutId: NodeJS.Timeout;

    const runPageFlow = async () => {
      if (isCancelled || !sourceRef.current || !targetRef.current) return;
      try {
        const pf = new PageFlow({
          pageSize: 'A4',
          margin: { top: mmToPx(20), right: mmToPx(20), bottom: mmToPx(20), left: mmToPx(20) },
          pagination: { lookahead: 3, optimizeWhitespace: true },
        });

        targetRef.current.innerHTML = '';
        await pf.flow(sourceRef.current, targetRef.current);
      } catch (error) {
        console.error("PageFlow error:", error);
      }
    };

    timeoutId = setTimeout(() => {
      runPageFlow();
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [mounted, localLoading, formData, profile, cv?.template_id]); // Added template_id to trigger reflow

  const handleExportPdf = () => {
    window.print();
  };

  if (!mounted || localLoading) {
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

  const currentTemplate = cv.template_id || 'classic';

  const FormContent = () => (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Destinataire</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Entreprise</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              placeholder="Ex: Google France"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact (Optionnel)</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400"
              value={formData.recipientName}
              onChange={(e) => setFormData({...formData, recipientName: e.target.value})}
              placeholder="M. Jean Dupont"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Adresse</label>
            <textarea
              rows={2}
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors placeholder:text-gray-400"
              value={formData.recipientAddress}
              onChange={(e) => setFormData({...formData, recipientAddress: e.target.value})}
              placeholder="8 rue de Londres..."
            />
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-100" />

      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contenu</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Objet</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-medium"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Objet de la candidature"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Appel</label>
            <input
              type="text"
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              value={formData.salutation}
              onChange={(e) => setFormData({...formData, salutation: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Corps de texte</label>
            <textarea
              rows={10}
              className="w-full text-sm px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors leading-relaxed custom-scrollbar"
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              placeholder="Commencez à rédiger votre lettre..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Politesse</label>
            <textarea
              rows={2}
              className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
              value={formData.closing}
              onChange={(e) => setFormData({...formData, closing: e.target.value})}
            />
          </div>
        </div>
      </section>
      
      <div className="pt-4 lg:hidden">
         <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
          {savedSuccess ? 'Sauvegardé' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );

  const DesignContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Choix du modèle</h3>
        <div className="grid grid-cols-2 gap-3">
          {LETTER_THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={`relative aspect-[1/1.2] rounded-xl border-2 overflow-hidden flex flex-col transition-all bg-white group ${currentTemplate === t.id ? 'border-indigo-600 shadow-md shadow-indigo-100' : 'border-gray-100 hover:border-indigo-300'}`}
            >
              <div className="flex-1 bg-gray-50/50 p-2 border-b border-gray-50 flex items-center justify-center">
                {t.id === 'classic' && <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded flex flex-col p-1.5"><div className="w-1/2 h-1 bg-gray-300 mb-2"/><div className="w-1/3 h-1 bg-gray-300 ml-auto mb-2"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-3/4 h-1 bg-gray-200"/></div>}
                {t.id === 'modern' && <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded flex flex-col p-1.5 border-l-4 border-l-indigo-500"><div className="w-1/2 h-1 bg-gray-800 mb-2"/><div className="w-1/3 h-1 bg-gray-400 ml-auto mb-2"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-full h-1 bg-gray-200 mb-0.5"/><div className="w-3/4 h-1 bg-gray-200"/></div>}
                {t.id === 'minimal' && <div className="w-full h-full bg-white border border-gray-200 shadow-sm rounded flex flex-col p-1.5 items-center justify-center"><div className="w-1/2 h-1 bg-gray-400 mb-3"/><div className="w-full h-1 bg-gray-100 mb-0.5"/><div className="w-full h-1 bg-gray-100 mb-0.5"/><div className="w-3/4 h-1 bg-gray-100"/></div>}
              </div>
              {currentTemplate === t.id && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                  <Check className="w-2.5 h-2.5" />
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
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .pageflow-output, .pageflow-output * { visibility: visible; }
          .pageflow-output { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
          .pageflow-output .pf-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          @page { size: A4 portrait; margin: 0; }
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
            onClick={() => setIsMobileFormOpen(true)}
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
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Télécharger PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-6">
            <div className="flex p-1 bg-gray-100/80 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'design' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Palette className="w-4 h-4" /> Modèle
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <PenTool className="w-4 h-4" /> Contenu
              </button>
            </div>
            {activeTab === 'content' ? <FormContent /> : <DesignContent />}
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
                width: \`calc(210mm * \${scale})\`,
                transformOrigin: 'top center',
              }}
            >
              <div
                className="origin-top-left transition-transform duration-200"
                style={{
                  width: '210mm',
                  transform: \`scale(\${scale})\`,
                }}
              >
                {/* SOURCE: Hidden off-screen so PageFlow can measure it */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm' }}>
                  
                  <div ref={sourceRef} className="bg-white">
                    {currentTemplate === 'classic' && (
                      <div className="font-sans text-gray-900 leading-relaxed text-[11pt]">
                        {/* Header (Sender Info) */}
                        <div className="mb-14 border-b border-gray-300 pb-6">
                          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">{displayName}</h1>
                          <div className="text-gray-600 text-sm flex items-center gap-3 flex-wrap">
                            {profile?.contact_phone && <span>{profile.contact_phone}</span>}
                            {profile?.contact_phone && profile?.contact_email && <span>•</span>}
                            {profile?.contact_email && <span>{profile.contact_email}</span>}
                            {(profile?.contact_phone || profile?.contact_email) && profile?.location && <span>•</span>}
                            {profile?.location && <span>{profile.location}</span>}
                          </div>
                        </div>

                        {/* Recipient & Date */}
                        <div className="flex justify-between items-start mb-12">
                          <div className="w-1/2">
                            <p className="text-gray-500 text-sm mb-1">Le</p>
                            <p className="text-gray-900">{new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <div className="w-1/2 text-left">
                            <p className="font-bold text-gray-900 text-lg">{formData.companyName}</p>
                            {formData.recipientName && <p className="text-gray-800 font-medium mt-1">{formData.recipientName}</p>}
                            {formData.recipientAddress && (
                              <p className="text-gray-600 whitespace-pre-wrap mt-1">{formData.recipientAddress}</p>
                            )}
                          </div>
                        </div>

                        {/* Subject */}
                        {formData.subject && (
                          <div className="mb-10 font-bold text-gray-900">
                            Objet : {formData.subject}
                          </div>
                        )}

                        {/* Body */}
                        <div className="mb-6 font-medium text-gray-900">
                          {formData.salutation}
                        </div>
                        
                        <div className="whitespace-pre-wrap mb-10 text-justify text-gray-700 leading-[1.8]">
                          {formData.body}
                        </div>

                        <div className="mb-16 text-gray-700">
                          {formData.closing}
                        </div>

                        {/* Signature */}
                        <div className="text-right">
                          <p className="text-gray-500 text-sm mb-2">Cordialement,</p>
                          <p className="font-bold text-gray-900 text-lg">{displayName}</p>
                        </div>
                      </div>
                    )}

                    {currentTemplate === 'modern' && (
                      <div className="font-sans text-gray-900 leading-relaxed text-[11pt] pl-8 border-l-4 border-indigo-600">
                        {/* Header (Sender Info) */}
                        <div className="mb-12">
                          <h1 className="text-3xl font-bold text-indigo-900 mb-2 tracking-tight">{displayName}</h1>
                          <div className="text-gray-600 text-sm flex items-center gap-3 flex-wrap font-medium">
                            {profile?.contact_phone && <span>{profile.contact_phone}</span>}
                            {profile?.contact_phone && profile?.contact_email && <span className="w-1.5 h-1.5 rounded-full bg-indigo-200" />}
                            {profile?.contact_email && <span>{profile.contact_email}</span>}
                            {(profile?.contact_phone || profile?.contact_email) && profile?.location && <span className="w-1.5 h-1.5 rounded-full bg-indigo-200" />}
                            {profile?.location && <span>{profile.location}</span>}
                          </div>
                        </div>

                        {/* Recipient & Date */}
                        <div className="flex flex-col gap-6 mb-12">
                          <div className="text-gray-500 text-sm">
                            Le {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="bg-gray-50 p-6 rounded-lg self-end w-2/3 border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">À l'attention de</p>
                            <p className="font-bold text-indigo-900 text-lg">{formData.companyName}</p>
                            {formData.recipientName && <p className="text-gray-800 font-medium mt-1">{formData.recipientName}</p>}
                            {formData.recipientAddress && (
                              <p className="text-gray-600 whitespace-pre-wrap mt-2">{formData.recipientAddress}</p>
                            )}
                          </div>
                        </div>

                        {/* Subject */}
                        {formData.subject && (
                          <div className="mb-10 font-bold text-indigo-900 bg-indigo-50 py-3 px-4 rounded-lg inline-block">
                            Objet : {formData.subject}
                          </div>
                        )}

                        {/* Body */}
                        <div className="mb-6 font-semibold text-gray-900">
                          {formData.salutation}
                        </div>
                        
                        <div className="whitespace-pre-wrap mb-10 text-gray-700 leading-loose">
                          {formData.body}
                        </div>

                        <div className="mb-16 text-gray-700">
                          {formData.closing}
                        </div>

                        {/* Signature */}
                        <div className="text-left mt-8 pt-8 border-t border-gray-200 w-1/3">
                          <p className="font-bold text-indigo-900 text-lg">{displayName}</p>
                        </div>
                      </div>
                    )}

                    {currentTemplate === 'minimal' && (
                      <div className="font-serif text-gray-800 leading-relaxed text-[11pt] text-center">
                        {/* Header (Sender Info) */}
                        <div className="mb-16">
                          <h1 className="text-2xl tracking-widest uppercase text-gray-900 mb-4">{displayName}</h1>
                          <div className="text-gray-500 text-sm flex items-center justify-center gap-3 flex-wrap">
                            {profile?.contact_phone && <span>{profile.contact_phone}</span>}
                            {profile?.contact_email && <span>| {profile.contact_email}</span>}
                            {profile?.location && <span>| {profile.location}</span>}
                          </div>
                        </div>

                        {/* Date & Recipient */}
                        <div className="flex flex-col items-center mb-16 text-sm">
                          <div className="mb-8 italic text-gray-500">
                            Fait le {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-gray-900">{formData.companyName}</p>
                            {formData.recipientName && <p className="text-gray-800">{formData.recipientName}</p>}
                            {formData.recipientAddress && (
                              <p className="text-gray-500 whitespace-pre-wrap mt-1">{formData.recipientAddress}</p>
                            )}
                          </div>
                        </div>

                        {/* Subject */}
                        {formData.subject && (
                          <div className="mb-12 font-bold text-gray-900 uppercase text-xs tracking-wider border-b border-gray-300 pb-2 inline-block">
                            Objet : {formData.subject}
                          </div>
                        )}

                        <div className="text-left">
                          {/* Body */}
                          <div className="mb-8 font-medium text-gray-900">
                            {formData.salutation}
                          </div>
                          
                          <div className="whitespace-pre-wrap mb-10 text-justify text-gray-700 leading-[2] font-sans font-light">
                            {formData.body}
                          </div>

                          <div className="mb-16 text-gray-700 font-sans font-light">
                            {formData.closing}
                          </div>
                        </div>

                        {/* Signature */}
                        <div className="text-right mt-16 font-serif">
                          <p className="text-xl text-gray-900 italic">{displayName}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* TARGET: Where PageFlow injects the generated pages */}
                <div ref={targetRef} className="pageflow-output" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Form Modal */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col lg:hidden">
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-indigo-600" />
              Options
            </h2>
            <button onClick={() => setIsMobileFormOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex p-1 bg-white border border-gray-200 rounded-xl mb-6 shadow-sm">
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all \${activeTab === 'design' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Palette className="w-4 h-4" /> Modèle
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all \${activeTab === 'content' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <PenTool className="w-4 h-4" /> Contenu
              </button>
            </div>
            {activeTab === 'content' ? <FormContent /> : <DesignContent />}
          </div>
        </div>
      )}

    </div>
  );
}
