'use client';

import { useState } from 'react';
import { X, FileText, CheckCircle2, Lock } from 'lucide-react';
import { CV } from '@/store/cv';

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
  onPrint: () => void;
}

export default function ExportModal({ isOpen, onClose, cv, onPrint }: ExportModalProps) {
  const [format, setFormat] = useState('pdf');
  const [quality, setQuality] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const price = THEME_PRICES[cv.templateId] || 0;
  const isPremium = price > 0;
  // Fausse condition pour simuler l'achat
  const [isUnlocked, setIsUnlocked] = useState(!isPremium);

  const handleExport = () => {
    if (!isUnlocked) {
      // Simulate payment flow
      setIsProcessing(true);
      setTimeout(() => {
        setIsUnlocked(true);
        setIsProcessing(false);
      }, 1500);
      return;
    }

    if (format === 'pdf') {
      onPrint();
      onClose();
    } else {
      alert("L'export Word sera bientôt disponible !");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Exporter le CV</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Format</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('pdf')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  format === 'pdf' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${format === 'pdf' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {format === 'pdf' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-gray-700">PDF</span>
              </button>
              <button
                onClick={() => setFormat('word')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  format === 'word' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${format === 'word' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {format === 'word' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-gray-700">Word</span>
              </button>
            </div>
          </div>

          {/* Qualité */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Qualité</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQuality('standard')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  quality === 'standard' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${quality === 'standard' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {quality === 'standard' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-gray-700">Standard</span>
              </button>
              <button
                onClick={() => setQuality('print')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  quality === 'print' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${quality === 'print' ? 'border-indigo-600' : 'border-gray-300'}`}>
                  {quality === 'print' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                </div>
                <span className="font-semibold text-gray-700">Impression HD</span>
              </button>
            </div>
          </div>

          {/* Theme recap */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Thème choisi</p>
              <p className="font-semibold text-gray-900 capitalize">{cv.templateId}</p>
            </div>
            {isPremium && !isUnlocked ? (
              <div className="text-right">
                <span className="text-sm font-black bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{price} FCFA</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Actif
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors">
            Annuler
          </button>
          
          <button
            onClick={handleExport}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-6 py-2.5 text-white font-semibold rounded-xl transition-colors ${
              !isUnlocked ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : !isUnlocked ? (
              <>
                <Lock className="w-4 h-4" />
                Débloquer - {price} FCFA
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
