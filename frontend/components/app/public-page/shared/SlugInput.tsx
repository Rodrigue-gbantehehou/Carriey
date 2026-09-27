'use client';

import { useState, useCallback, useEffect } from 'react';
import { publicPagesApi } from '@/lib/public-pages-api';
import { Sparkles } from 'lucide-react';
import { inputClass } from './constants';

export function SlugInput({ value, onChange, token, excludeId }: {
  value: string; onChange: (v: string) => void;
  token: string; excludeId?: string;
}) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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

  const handleGenerateAi = async () => {
    setIsLoadingAi(true);
    setAiSuggestions([]);
    setAiError(null);
    try {
      const { aiApi } = await import('@/lib/ai-api');
      const res = await aiApi.generateSlugSuggestions(token);
      setAiSuggestions(res.suggestions);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('503') || msg.toLowerCase().includes('quota')) {
        setAiError('⏳ Quota IA épuisé pour aujourd\'hui. Réessayez demain.');
      } else {
        setAiError('Erreur de génération IA.');
      }
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-sm font-medium text-gray-700">
          URL publique <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={handleGenerateAi}
          disabled={isLoadingAi}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 transition-colors"
        >
          {isLoadingAi
            ? <><span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block" /> Génération...</>
            : <><Sparkles className="w-3 h-3" /> Suggérer avec l'IA</>
          }
        </button>
      </div>

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

      {aiError && <p className="text-[11px] text-amber-600 mt-1.5">⚠ {aiError}</p>}
      {aiSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-[10px] text-gray-400 self-center">Suggestions IA :</span>
          {aiSuggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => { onChange(s); setAiSuggestions([]); }}
              className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

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
