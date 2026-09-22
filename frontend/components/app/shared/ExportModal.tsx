'use client';

import { useState } from 'react';
import { X, FileText, CheckCircle2, Lock } from 'lucide-react';
import { CV } from '@/lib/cv-api';

const THEME_PRICES: Record<string, number> = {
  minimal: 0,
  classique: 0,
  moderne: 1000,
  elegant: 1500,
  tokyo: 1000,
  dakar: 1000,
  abidjan: 1500,
  professional: 1000,
  creatif: 1500,
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: CV;
  onExport: (format: string, quality: string) => Promise<void>;
}

export default function ExportModal({ isOpen, onClose, cv, onExport }: ExportModalProps) {
  const [format, setFormat] = useState('pdf');
  const [quality, setQuality] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  // Compute price based on template
  const price = cv ? (THEME_PRICES[cv.template_id] || 0) : 0;
  const isPremium = price > 0;
  const [isUnlocked, setIsUnlocked] = useState(!isPremium);

  if (!isOpen || !cv) return null;

  const handleExport = async () => {
    if (!isUnlocked) {
      setIsProcessing(true);
      setTimeout(async () => {
        setIsUnlocked(true);
        setIsProcessing(false);
        // Lancer le téléchargement automatiquement après le "paiement"
        setIsProcessing(true);
        await onExport(format, quality);
        setIsProcessing(false);
        onClose();
      }, 1500);
      return;
    }

    setIsProcessing(true);
    await onExport(format, quality);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full sm:max-w-[400px] max-h-[85vh] flex flex-col sm:rounded-2xl rounded-t-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in sm:fade-in duration-200 pb-safe">
        
        {/* Drag handle (mobile only) */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Exporter le CV</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ml-4 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Format */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Format</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('pdf')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                  format === 'pdf' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${format === 'pdf' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {format === 'pdf' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-sm text-gray-700">PDF</span>
              </button>
              <button
                onClick={() => setFormat('word')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                  format === 'word' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${format === 'word' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {format === 'word' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-sm text-gray-700">Word</span>
              </button>
            </div>
          </div>

          {/* Qualité */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2.5">Qualité</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQuality('standard')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                  quality === 'standard' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quality === 'standard' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {quality === 'standard' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-sm text-gray-700">Web</span>
              </button>
              <button
                onClick={() => setQuality('print')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all ${
                  quality === 'print' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quality === 'print' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {quality === 'print' && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-sm text-gray-700">Impression</span>
              </button>
            </div>
          </div>

          {/* Theme recap */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Thème</p>
              <p className="text-sm font-bold text-gray-900 capitalize mt-0.5">{cv.template_id}</p>
            </div>
            {isPremium && !isUnlocked ? (
              <div className="text-right">
                <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{price} FCFA</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Actif
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 p-5 pb-8 sm:pb-5 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-white">
          <button onClick={onClose} className="w-full sm:w-auto px-5 py-3 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors text-sm">
            Annuler
          </button>
          
          <button
            onClick={handleExport}
            disabled={isProcessing}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-colors text-sm ${
              !isUnlocked ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : !isUnlocked ? (
              <>
                <Lock className="w-4 h-4" />
                Débloquer - {price} F
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Télécharger
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
