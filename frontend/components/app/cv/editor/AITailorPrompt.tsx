import React, { useState } from 'react';
import { useSession } from 'next-auth/react';

import { Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';
import { PaywallModal } from '@/components/app/shared/PaywallModal';

interface AITailorPromptProps {
  cvId: string;
  currentOverrides: any;
  onOverridesGenerated: (newOverrides: any, disabledSections?: string[], disabledItems?: any) => void;
}

export function AITailorPrompt({ cvId, currentOverrides, onOverridesGenerated }: AITailorPromptProps) {
  const { data: session } = useSession();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  const handleGenerateAI = async () => {
    const isPremium = session?.user?.premium_until && new Date(session.user.premium_until) > new Date();

    if (!isPremium) {
      setShowPaywall(true);
      return;
    }

    if (!prompt.trim() || !session?.user?.accessToken) return;

    setIsGenerating(true);
    setAiSuccess(false);
    try {
      const { aiApi } = await import('@/lib/ai-api');
      const data = await aiApi.tailorCv(session.user.accessToken, prompt);

      const newOverrides = {
        ...currentOverrides,
        summary: data.summary || currentOverrides?.summary,
        experiences: data.experiences || currentOverrides?.experiences,
      };

      onOverridesGenerated(newOverrides, data.disabledSections, data.disabledItems);

      setAiSuccess(true);
      setPrompt('');
      setTimeout(() => setAiSuccess(false), 3000);
    } catch (err) {
      console.error("Erreur IA:", err);
      alert("Une erreur est survenue lors de l'adaptation.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        title="L'Adaptation Avancée est PRO"
        description="Passez à carriey PRO pour générer un CV parfaitement ciblé sur l'offre d'emploi en 1 clic."
      />

      <div className="bg-white p-5 rounded-panel border border-indigo-100 shadow-sm mb-8">
        <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-primary" /> Cibler une offre d&apos;emploi
        </h4>
        <p className="text-xs text-text-secondary mb-3">Collez l&apos;offre d&apos;emploi. L&apos;IA va analyser les mots-clés et adapter votre accroche et vos expériences.</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Nous recherchons un Développeur avec 3 ans d'expérience..."
          className="w-full text-sm p-3 border border-border rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent min-h-[80px] mb-3 transition-all"
        />
        <button
          onClick={handleGenerateAI}
          disabled={isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-sm disabled:opacity-50"
        >
          {isGenerating ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyse en cours...</>
          ) : aiSuccess ? (
            <><CheckCircle2 className="w-4 h-4" /> CV Adapté avec succès !</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Lancer l&apos;IA carriey PRO</>
          )}
        </button>
      </div>
    </>
  );
}
