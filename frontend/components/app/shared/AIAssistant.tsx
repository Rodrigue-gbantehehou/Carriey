import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AIAssistantProps {
  onGenerate: (prompt: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  loadingText?: string;
}

export function AIAssistant({
  onGenerate,
  placeholder = "Ex: Je postule pour un poste de développeur React chez Google. Mets en avant mon expérience de 3 ans et mon esprit d'équipe.",
  buttonText = "Générer avec l'IA",
  loadingText = "Génération en cours..."
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');

    try {
      await onGenerate(prompt);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la génération.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Instructions pour l'IA</label>
        <textarea
          rows={5}
          className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-400 resize-none"
          placeholder={placeholder}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <p className="text-[10px] text-gray-400 mt-1.5">
          Soyez le plus précis possible pour un résultat optimal.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </button>
    </div>
  );
}
