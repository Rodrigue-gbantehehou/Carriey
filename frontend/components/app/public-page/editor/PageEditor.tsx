import { useState } from 'react';
import { Settings2, Layout, Palette, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPage, PublicPageCreate, SectionsConfig, Theme } from '@/types/public-page';
import { SlugInput } from '../shared/SlugInput';
import { THEMES, SECTION_LABELS, EXPIRY_OPTIONS, getExpiresAt, inputClass } from '../shared/constants';
import config from '@/lib/config';
import { useEffect } from 'react';

export function PageEditor({ initialPage, initialTheme, token, onSave, onClose }: {
  initialPage?: PublicPage;
  initialTheme?: string;
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
  const [theme, setTheme] = useState<Theme>((initialPage?.theme || initialTheme || 'modern') as Theme);
  const [accent, setAccent] = useState(initialPage?.accent_color || '#6366f1');
  const [showPhoto, setShowPhoto] = useState(initialPage?.show_photo ?? true);
  const [showContact, setShowContact] = useState(initialPage?.show_contact ?? true);
  const [customBio, setCustomBio] = useState(initialPage?.custom_bio || '');
  const [seoDescription, setSeoDescription] = useState(initialPage?.seo_description || '');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);

  const [dbThemes, setDbThemes] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${config.apiBaseUrl}/templates`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const publicThemes = data.filter((t: any) => t.template_type === 'public_page');
        if (publicThemes.length > 0) {
            setDbThemes(publicThemes);
            if (!initialPage && publicThemes[0]) {
                setTheme(publicThemes[0].slug);
            }
        }
      })
      .catch(() => {});
  }, [initialPage]);

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
      <div className="flex bg-border rounded-panel p-1 gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all ${tab === t.id ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Info ── */}
      {tab === 'info' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-text-secondary">Nom interne <span className="text-danger-text">*</span></label>
              <button type="button" onClick={handleGenerateTitleAndSlug}
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors">
                <Sparkles className="w-3 h-3" /> Suggérer avec l'IA
              </button>
            </div>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: CV Dev Senior, Portfolio Freelance…" className={inputClass} autoFocus />
            {titleSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] text-text-muted self-center">Suggestions :</span>
                {titleSuggestions.map(s => (
                  <button key={s} type="button"
                    onClick={() => { setTitle(s); setTitleSuggestions([]); }}
                    className="text-[11px] font-semibold bg-primary-subtle text-primary border border-primary/20 hover:bg-primary/20 px-2.5 py-1 rounded-lg transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <SlugInput value={slug} onChange={setSlug} token={token} excludeId={initialPage?.id} />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Durée de vie</label>
            <div className="grid grid-cols-4 gap-2">
              {initialPage?.expires_at && (
                <button key="keep" onClick={() => setExpiry('keep')}
                  className={`text-xs font-semibold py-2 rounded-panel border transition-all col-span-4 ${expiry === 'keep' ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary/50'}`}>
                  Garder la date d'expiration actuelle
                </button>
              )}
              {EXPIRY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setExpiry(opt.value)}
                  className={`text-xs font-semibold py-2 rounded-panel border transition-all ${expiry === opt.value ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-primary/50'}`}>
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
          <div className="flex items-center justify-between pb-1 border-b border-border">
            <span className="text-xs text-text-secondary">Activer/désactiver les sections à afficher</span>
            <div className="flex gap-2">
              <button onClick={() => setSections(Object.fromEntries(Object.keys(sections).map(k => [k, true])) as unknown as SectionsConfig)} className="text-[10px] font-bold text-primary hover:underline">Tout</button>
              <button onClick={() => setSections(Object.fromEntries(Object.keys(sections).map(k => [k, false])) as unknown as SectionsConfig)} className="text-[10px] font-bold text-text-muted hover:underline">Aucun</button>
            </div>
          </div>
          {(Object.entries(sections) as [keyof SectionsConfig, boolean][]).map(([key, val]) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-panel border border-border hover:border-primary/20 cursor-pointer transition-all group">
              <span className="text-sm font-medium text-text-secondary group-hover:text-primary-hover">{SECTION_LABELS[key]}</span>
              <div className={`relative w-10 h-5.5 rounded-full transition-colors ${val ? 'bg-primary' : 'bg-border'}`}
                style={{ width: 40, height: 22 }}
                onClick={() => setSections({ ...sections, [key]: !val })}>
                <div className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all ${val ? 'left-[18px]' : 'left-[2px]'}`}
                  style={{ width: 18, height: 18, top: 2, left: val ? 20 : 2 }} />
              </div>
            </label>
          ))}
          <div className="border-t border-border pt-3 space-y-2">
            <label className="flex items-center justify-between p-3 rounded-panel border border-border cursor-pointer" onClick={() => setShowPhoto(!showPhoto)}>
              <span className="text-sm font-medium text-text-secondary">Afficher ma photo</span>
              <div className={`relative rounded-full transition-colors ${showPhoto ? 'bg-primary' : 'bg-border'}`} style={{ width: 40, height: 22 }}>
                <div className="absolute bg-white rounded-full shadow transition-all" style={{ width: 18, height: 18, top: 2, left: showPhoto ? 20 : 2 }} />
              </div>
            </label>
            <label className="flex items-center justify-between p-3 rounded-panel border border-border cursor-pointer" onClick={() => setShowContact(!showContact)}>
              <span className="text-sm font-medium text-text-secondary">Afficher mes coordonnées</span>
              <div className={`relative rounded-full transition-colors ${showContact ? 'bg-primary' : 'bg-border'}`} style={{ width: 40, height: 22 }}>
                <div className="absolute bg-white rounded-full shadow transition-all" style={{ width: 18, height: 18, top: 2, left: showContact ? 20 : 2 }} />
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ── Tab: AI & SEO ── */}
      {tab === 'ai' && (
        <div className="space-y-4">
          <div className="bg-primary-subtle p-4 rounded-panel border border-primary/20 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-primary-hover flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Super-pouvoirs IA
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              L'IA analyse votre profil complet pour rédiger une bio d'accroche ("Elevator Pitch") percutante qui s'affichera sur votre page, et génère le texte optimisé pour le référencement Google.
            </p>
            <Button 
              onClick={handleGenerateAi}
              disabled={isGeneratingAi}
              isLoading={isGeneratingAi}
              variant="primary"
              fullWidth
              className="mt-1"
              leftIcon={!isGeneratingAi && <Sparkles className="w-4 h-4" />}
            >
              Générer avec l'IA
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio d'accroche (Pitch)</label>
            <textarea 
              value={customBio} 
              onChange={e => setCustomBio(e.target.value)} 
              placeholder="Texte d'introduction affiché en haut de la page..." 
              className="w-full text-sm border-border border rounded-panel p-3 focus:ring-2 focus:ring-primary focus:border-primary resize-none h-28"
            />
            <p className="text-[10px] text-text-muted mt-1 text-right">Laissez vide pour utiliser la bio par défaut du profil.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Description SEO (Google)</label>
            <textarea 
              value={seoDescription} 
              onChange={e => setSeoDescription(e.target.value)} 
              placeholder="Description courte de votre profil (max 160 caractères)..." 
              className="w-full text-sm border-border border rounded-panel p-3 focus:ring-2 focus:ring-primary focus:border-primary resize-none h-16"
              maxLength={160}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-text-muted">Invisible sur la page, utilisé par les moteurs de recherche.</span>
              <span className={`text-[10px] font-medium ${seoDescription.length > 155 ? 'text-danger-text' : 'text-text-muted'}`}>
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
            <label className="block text-sm font-medium text-text-secondary mb-3">Thème</label>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
              {dbThemes.map(t => (
                <button
                  key={t.slug || t.id}
                  onClick={() => setTheme(t.slug || t.id)}
                  className={`relative aspect-[1/1.4] rounded-panel border-2 overflow-hidden flex flex-col transition-all bg-white group ${theme === (t.slug || t.id) ? 'border-primary shadow-md shadow-primary/20' : 'border-border hover:border-primary/50'}`}
                >
                  <div className="flex-1 p-2 flex items-center justify-center border-b border-gray-50 bg-background-subtle/50 w-full relative">
                    {t.preview_image ? (
                      <img 
                        src={t.preview_image.startsWith('http') ? t.preview_image : `${config.staticBaseUrl}/previews/${t.preview_image.split('/').pop()}`}
                        alt={t.name || t.label}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-border rounded flex flex-col p-2 space-y-2">
                        <div className="w-full h-2 bg-border rounded" />
                        <div className="w-3/4 h-2 bg-border rounded" />
                        <div className="w-1/2 h-2 bg-border rounded" />
                      </div>
                    )}
                  </div>
                  {theme === (t.slug || t.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-sm z-10">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <div className="p-2 text-center bg-white flex flex-col w-full">
                    <span className="text-xs font-semibold text-text-primary truncate">{t.name || t.label}</span>
                    <span className="text-[10px] text-text-muted font-medium truncate mt-0.5">{t.description || t.desc || 'Template standard'}</span>
                  </div>
                </button>
              ))}
              {dbThemes.length === 0 && (
                <div className="col-span-2 p-4 text-center text-text-secondary text-sm border-2 border-dashed border-border rounded-panel">
                  Aucun thème disponible pour le moment.
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Couleur d&apos;accent</label>
            <div className="flex items-center gap-3">
              <input type="color" value={accent} onChange={e => setAccent(e.target.value)}
                className="w-12 h-10 rounded-panel border border-border cursor-pointer p-0.5" />
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
      <div className="pt-2 border-t border-border">
        {saveError && (
          <div className="mb-3 p-3 bg-danger-bg text-red-600 text-sm rounded-panel border border-red-100">
            {saveError}
          </div>
        )}
        <Button onClick={handleSave} disabled={saving || !title || !slug} isLoading={saving}
          fullWidth variant="primary" className="py-3.5" leftIcon={!saving && <Sparkles className="w-4 h-4" />}>
          {isEdit ? 'Enregistrer les modifications' : 'Créer la page'}
        </Button>
      </div>
    </div>
  );
}
