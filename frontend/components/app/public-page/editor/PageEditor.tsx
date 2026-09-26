import { useState } from 'react';
import { Settings2, Layout, Palette, Sparkles } from 'lucide-react';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPage, PublicPageCreate, SectionsConfig, Theme } from '@/types/public-page';
import { SlugInput } from '../shared/SlugInput';
import { THEMES, SECTION_LABELS, EXPIRY_OPTIONS, getExpiresAt, inputClass } from '../shared/constants';

export function PageEditor({ initialPage, token, onSave, onClose }: {
  initialPage?: PublicPage;
  token: string;
  onSave: (p: PublicPage) => void;
  onClose: () => void;
}) {
  const isEdit = !!initialPage;
  const [tab, setTab] = useState<'info' | 'sections' | 'ai' | 'design'>('info');
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(initialPage?.title || '');
  const [slug, setSlug] = useState(initialPage?.slug || '');
  const [expiry, setExpiry] = useState(initialPage?.expires_at ? 'keep' : '');
  const [sections, setSections] = useState<SectionsConfig>(initialPage?.sections as SectionsConfig || {
    bio: true, experiences: true, education: true, skills: true,
    projects: true, certifications: true, languages: true, links: true,
  });
  const [theme, setTheme] = useState<Theme>(initialPage?.theme || 'modern');
  const [accent, setAccent] = useState(initialPage?.accent_color || '#6366f1');
  const [showPhoto, setShowPhoto] = useState(initialPage?.show_photo ?? true);
  const [showContact, setShowContact] = useState(initialPage?.show_contact ?? true);
  const [customBio, setCustomBio] = useState(initialPage?.custom_bio || '');
  const [seoDescription, setSeoDescription] = useState(initialPage?.seo_description || '');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title || !slug) return;
    setSaving(true);
    setSaveError(null);
    try {
      let finalExpiresAt: string | null = null;
      if (expiry === 'keep') {
        finalExpiresAt = initialPage?.expires_at || null;
      } else if (expiry) {
        finalExpiresAt = getExpiresAt(expiry);
      }

      const payload: PublicPageCreate = {
        title,
        slug,
        sections,
        expires_at: finalExpiresAt,
        theme,
        accent_color: accent,
        show_photo: showPhoto,
        show_contact: showContact,
        custom_bio: customBio,
        seo_description: seoDescription,
      };
      let saved: PublicPage;
      if (isEdit) {
        saved = await publicPagesApi.update(token, initialPage.id, payload);
      } else {
        saved = await publicPagesApi.create(token, payload);
      }
      onSave(saved);
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail || err?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const { aiApi } = await import('@/lib/ai-api');
      const res = await aiApi.generatePublicBio(token, "Recruteurs et professionnels");
      setCustomBio(res.custom_bio || '');
      setSeoDescription(res.seo_description || '');
    } catch (err: any) {
      alert("Erreur lors de la génération IA");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleGenerateTitleAndSlug = async () => {
    setTitleSuggestions([]);
    try {
      const { aiApi } = await import('@/lib/ai-api');
      const res = await aiApi.generateSlugSuggestions(token);
      setTitleSuggestions(res.titles || []);
    } catch {
      // silently fail
    }
  };

  const tabs = [
    { id: 'info', label: 'Infos', icon: <Settings2 className="w-3.5 h-3.5" /> },
    { id: 'sections', label: 'Contenu', icon: <Layout className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'IA & SEO', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'design', label: 'Design', icon: <Palette className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="space-y-4 pb-6">
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${tab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Info ── */}
      {tab === 'info' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Nom interne <span className="text-red-400">*</span></label>
              <button type="button" onClick={handleGenerateTitleAndSlug}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                <Sparkles className="w-3 h-3" /> Suggérer avec l'IA
              </button>
            </div>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: CV Dev Senior, Portfolio Freelance…" className={inputClass} autoFocus />
            {titleSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] text-gray-400 self-center">Suggestions :</span>
                {titleSuggestions.map(s => (
                  <button key={s} type="button"
                    onClick={() => { setTitle(s); setTitleSuggestions([]); }}
                    className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <SlugInput value={slug} onChange={setSlug} token={token} excludeId={initialPage?.id} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Durée de vie</label>
            <div className="grid grid-cols-4 gap-2">
              {initialPage?.expires_at && (
                <button key="keep" onClick={() => setExpiry('keep')}
                  className={`text-xs font-semibold py-2 rounded-xl border transition-all col-span-4 ${expiry === 'keep' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                  Garder la date d'expiration actuelle
                </button>
              )}
              {EXPIRY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setExpiry(opt.value)}
                  className={`text-xs font-semibold py-2 rounded-xl border transition-all ${expiry === opt.value ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Sections ── */}
      {tab === 'sections' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <span className="text-xs text-gray-500">Activer/désactiver les sections à afficher</span>
            <div className="flex gap-2">
              <button onClick={() => setSections(Object.fromEntries(Object.keys(sections).map(k => [k, true])) as unknown as SectionsConfig)} className="text-[10px] font-bold text-indigo-600 hover:underline">Tout</button>
              <button onClick={() => setSections(Object.fromEntries(Object.keys(sections).map(k => [k, false])) as unknown as SectionsConfig)} className="text-[10px] font-bold text-gray-400 hover:underline">Aucun</button>
            </div>
          </div>
          {(Object.entries(sections) as [keyof SectionsConfig, boolean][]).map(([key, val]) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 cursor-pointer transition-all group">
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">{SECTION_LABELS[key]}</span>
              <div className={`relative w-10 h-5.5 rounded-full transition-colors ${val ? 'bg-indigo-600' : 'bg-gray-200'}`}
                style={{ width: 40, height: 22 }}
                onClick={() => setSections({ ...sections, [key]: !val })}>
                <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${val ? 'left-[18px]' : 'left-[2px]'}`}
                  style={{ width: 18, height: 18, top: 2, left: val ? 20 : 2 }} />
              </div>
            </label>
          ))}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setShowPhoto(!showPhoto)}>
              <span className="text-sm font-medium text-gray-700">Afficher ma photo</span>
              <div className={`relative rounded-full transition-colors ${showPhoto ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: 40, height: 22 }}>
                <div className="absolute bg-white rounded-full shadow transition-all" style={{ width: 18, height: 18, top: 2, left: showPhoto ? 20 : 2 }} />
              </div>
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 cursor-pointer" onClick={() => setShowContact(!showContact)}>
              <span className="text-sm font-medium text-gray-700">Afficher mes coordonnées</span>
              <div className={`relative rounded-full transition-colors ${showContact ? 'bg-indigo-600' : 'bg-gray-200'}`} style={{ width: 40, height: 22 }}>
                <div className="absolute bg-white rounded-full shadow transition-all" style={{ width: 18, height: 18, top: 2, left: showContact ? 20 : 2 }} />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Tab: AI & SEO ── */}
      {tab === 'ai' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Super-pouvoirs IA
            </h3>
            <p className="text-xs text-indigo-700 leading-relaxed">
              L'IA analyse votre profil complet pour rédiger une bio d'accroche ("Elevator Pitch") percutante qui s'affichera sur votre page, et génère le texte optimisé pour le référencement Google.
            </p>
            <button 
              onClick={handleGenerateAi}
              disabled={isGeneratingAi}
              className="mt-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all text-sm w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isGeneratingAi ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Génération...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Générer avec l'IA</>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio d'accroche (Pitch)</label>
            <textarea 
              value={customBio} 
              onChange={e => setCustomBio(e.target.value)} 
              placeholder="Texte d'introduction affiché en haut de la page..." 
              className="w-full text-sm border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-28"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">Laissez vide pour utiliser la bio par défaut du profil.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description SEO (Google)</label>
            <textarea 
              value={seoDescription} 
              onChange={e => setSeoDescription(e.target.value)} 
              placeholder="Description courte de votre profil (max 160 caractères)..." 
              className="w-full text-sm border-gray-200 border rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none h-16"
              maxLength={160}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-gray-400">Invisible sur la page, utilisé par les moteurs de recherche.</span>
              <span className={`text-[10px] font-medium ${seoDescription.length > 155 ? 'text-red-500' : 'text-gray-400'}`}>
                {seoDescription.length}/160
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Design ── */}
      {tab === 'design' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Thème</label>
            <div className="grid grid-cols-2 gap-3">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${theme === t.id ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`h-10 rounded-lg mb-2 ${t.preview}`} />
                  <p className="text-sm font-bold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur d&apos;accent</label>
            <div className="flex items-center gap-3">
              <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5" />
              <div className="flex gap-2 flex-wrap">
                {['#6366f1','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#3b82f6','#1f2937'].map(c => (
                  <button key={c} onClick={() => setAccent(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${accent === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="pt-2 border-t border-gray-100">
        {saveError && (
          <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {saveError}
          </div>
        )}
        <button onClick={handleSave} disabled={saving || !title || !slug}
          className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isEdit ? 'Enregistrer les modifications' : 'Créer la page'}
        </button>
      </div>
    </div>
  );
}
