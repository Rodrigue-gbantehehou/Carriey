'use client';

import { useEffect, useState, useCallback } from 'react';
import { publicPagesApi } from '@/lib/public-pages-api';
import { PublicPage, PublicPageCreate, SectionsConfig, Theme } from '@/types/public-page';
import {
  Link as LinkIcon, Eye, Trash2, ToggleLeft, ToggleRight,
  Copy, Check, Edit2, Globe, Clock, Palette, Layout, Settings2,
  Sparkles, Share2
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const THEMES: { id: Theme; label: string; desc: string; preview: string }[] = [
  { id: 'modern', label: 'Modern', desc: 'Dégradé coloré, cartes', preview: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { id: 'minimal', label: 'Minimal', desc: 'Blanc, sobre, élégant', preview: 'bg-white border-2 border-gray-200' },
  { id: 'bold', label: 'Bold', desc: 'Fond sombre, fort impact', preview: 'bg-gray-950' },
  { id: 'elegant', label: 'Élégant', desc: 'Crème, style portfolio', preview: 'bg-amber-50 border border-amber-200' },
];

export const SECTION_LABELS: Record<keyof SectionsConfig, string> = {
  bio: 'À propos',
  experiences: 'Expériences',
  education: 'Formation',
  skills: 'Compétences',
  projects: 'Projets',
  certifications: 'Certifications',
  languages: 'Langues',
  links: 'Liens',
};

export const EXPIRY_OPTIONS = [
  { value: '', label: 'Permanent' },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '3 mois' },
];

export function daysLeft(expiresAt?: string | null) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  return days;
}

export function getExpiresAt(option: string): string | null {
  if (!option) return null;
  const days = parseInt(option);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

// ─── Slug Input with validation ───────────────────────────────────────────────
export function SlugInput({ value, onChange, token, excludeId }: {
  value: string; onChange: (v: string) => void;
  token: string; excludeId?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const check = useCallback(async (slug: string) => {
    if (slug.length < 3) { setStatus('idle'); return; }
    setStatus('checking');
    try {
      const res = await publicPagesApi.checkSlug(token, slug, excludeId);
      setStatus(res.available ? 'ok' : 'taken');
      setSuggestion(res.suggestion || null);
    } catch { setStatus('idle'); }
  }, [token, excludeId]);

  useEffect(() => {
    const t = setTimeout(() => check(value), 400);
    return () => clearTimeout(t);
  }, [value, check]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        URL publique <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium select-none pointer-events-none">
          /p/
        </span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-'))}
          placeholder="mon-cv-dev"
          className={`${inputClass} pl-10 pr-10`}
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs">
          {status === 'checking' && <span className="text-gray-400">⋯</span>}
          {status === 'ok' && <span className="text-emerald-500 font-bold">✓</span>}
          {status === 'taken' && <span className="text-red-400 font-bold">✗</span>}
        </span>
      </div>
      {status === 'taken' && suggestion && (
        <button
          type="button"
          onClick={() => onChange(suggestion)}
          className="text-xs text-indigo-600 hover:underline mt-1"
        >
          Utiliser &ldquo;{suggestion}&rdquo; à la place
        </button>
      )}
      {status === 'ok' && <p className="text-xs text-emerald-600 mt-1">Disponible ✓</p>}
    </div>
  );
}

// ─── Page Card ────────────────────────────────────────────────────────────────
export function PageCard({ page, onEdit, onDelete, onToggle }: {
  page: PublicPage;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/p/${page.slug}` : '';
  const days = daysLeft(page.expires_at);
  const theme = THEMES.find(t => t.id === page.theme) || THEMES[0];
  const expiredOrSoon = days !== null && days <= 3;

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: page.title,
          text: `Découvrez mon profil public sur Cariey : ${page.title}`,
          url,
        });
      } catch (err) {
        console.error('Partage annulé ou échoué', err);
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Découvrez mon profil professionnel : ${url}`)}`, '_blank');
    }
  };

  return (
    <div
      className={`group bg-white rounded-2xl border ${page.is_active ? 'border-gray-200' : 'border-gray-200 opacity-70'} overflow-hidden hover:shadow-xl hover:shadow-black/5 hover:border-indigo-200 transition-all cursor-pointer flex flex-col`}
      onClick={onEdit}
    >
      {/* Miniature area (same aspect ratio as CV cards) */}
      <div className="aspect-[1/1.4] bg-gray-100 border-b border-gray-100 relative overflow-hidden flex items-center justify-center p-4">
        <div className={`w-full h-full shadow-sm rounded-lg relative border border-gray-100 transition-transform group-hover:scale-[1.02] flex flex-col overflow-hidden ${theme.preview}`}>
          {/* Abstract website miniature */}
          <div className="bg-white/90 backdrop-blur-sm mx-2 mt-2 p-2 rounded-md flex items-center justify-between shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gray-200" />
            <div className="w-10 h-1.5 rounded-full bg-gray-200" />
          </div>
          <div className="flex-1 mx-2 mt-2 bg-white/70 backdrop-blur-sm rounded-md p-2 space-y-2.5 mb-2 shadow-sm">
            <div className="w-3/4 h-2 rounded-full bg-gray-300" />
            <div className="w-1/2 h-2 rounded-full bg-gray-300" />
            <div className="w-full h-1.5 rounded-full bg-gray-200 mt-4" />
            <div className="w-5/6 h-1.5 rounded-full bg-gray-200" />
            <div className="w-4/6 h-1.5 rounded-full bg-gray-200" />
          </div>
        </div>
        
        {/* Overlay with config button */}
        <div className="absolute inset-0 bg-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <span className="px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
            <Settings2 className="w-4 h-4" />
            Configurer
          </span>
        </div>
      </div>
      
      {/* Bottom info section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-1 flex items-center gap-2" title={page.title}>
              {page.title}
              {!page.is_active && <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">INACTIF</span>}
            </h3>
            <p className="text-xs text-indigo-600 font-mono mt-0.5 truncate">/p/{page.slug}</p>
          </div>
          <div className="flex gap-0.5 -mr-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={`p-1.5 rounded-lg transition-colors ${page.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}
              title={page.is_active ? 'Désactiver' : 'Activer'}
            >
              {page.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Actions row: Views / Share / Open */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
          <span className="flex items-center gap-1 text-xs text-gray-400 mr-auto" title="Nombre de vues">
            <Eye className="w-3.5 h-3.5" /> {page.views}
          </span>
          <button onClick={shareLink} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Partager">
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={copy} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Copier le lien">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-md hover:bg-indigo-100 transition-all uppercase tracking-wider">
            <Globe className="w-3 h-3" /> Ouvrir
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Create / Edit BottomSheet content ────────────────────────────────────────
export function PageEditor({ initialPage, token, onSave, onClose }: {
  initialPage?: PublicPage;
  token: string;
  onSave: (p: PublicPage) => void;
  onClose: () => void;
}) {
  const isEdit = !!initialPage;
  const [tab, setTab] = useState<'info' | 'sections' | 'design'>('info');
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

  const tabs = [
    { id: 'info', label: 'Infos', icon: <Settings2 className="w-3.5 h-3.5" /> },
    { id: 'sections', label: 'Contenu', icon: <Layout className="w-3.5 h-3.5" /> },
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom interne <span className="text-red-400">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: CV Dev Senior, Portfolio Freelance…" className={inputClass} autoFocus />
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
