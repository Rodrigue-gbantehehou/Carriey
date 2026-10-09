'use client';

import { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Lock } from 'lucide-react';
import { CV } from '@/lib/cv-api';
import config from '@/lib/config';
import { useSession } from 'next-auth/react';
import { PaywallModal } from '@/components/app/shared/PaywallModal';
import { Button } from '@/components/ui/Button';

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
  const { data: session } = useSession();

  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("F CFA");
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const isPremium = price > 0;

  // Check access when modal opens
  useEffect(() => {
    if (isOpen && cv?.template_id) {
      const checkAccess = async () => {
        if (!session?.user?.accessToken) return;
        setIsLoadingAccess(true);
        try {
          const res = await fetch(`${config.apiBaseUrl}/templates/${cv.template_id}/check-access`, {
            headers: { Authorization: `Bearer ${session.user.accessToken}` }
          });
          if (!res.ok) throw new Error('Network error');
          const data = await res.json();
          setPrice(Number(data.template_price || 0));
          setCurrency(data.template_currency || "F CFA");
          setIsUnlocked(data.has_access);
        } catch (error) {
          console.error("Erreur check-access:", error);
          setIsUnlocked(false);
        } finally {
          setIsLoadingAccess(false);
        }
      };
      checkAccess();
    }
  }, [isOpen, cv?.template_id]);

  if (!isOpen || !cv) return null;

  const handleExport = async () => {
    if (!isUnlocked) {
      setShowPaywall(true);
      return;
    }

    setIsProcessing(true);
    await onExport(format, quality);
    setIsProcessing(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-center sm:justify-center">
        <div className="absolute inset-0 bg-text-primary/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative bg-white w-full sm:max-w-[400px] max-h-[85vh] flex flex-col sm:rounded-panel rounded-t-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in sm:fade-in duration-200 pb-safe">

          {/* Drag handle (mobile only) */}
          <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 bg-border rounded-full" />
          </div>

          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary">Exporter le CV</h2>
            <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-secondary hover:bg-border rounded-full transition-colors ml-4 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Format */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2.5">Format</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormat('pdf')}
                  className={`flex items-center gap-3 p-2.5 rounded-panel border-2 transition-all ${format === 'pdf' ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border hover:border-border'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${format === 'pdf' ? 'border-indigo-600' : 'border-border'}`}>
                    {format === 'pdf' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="font-semibold text-sm text-text-secondary">PDF</span>
                </button>
                <button
                  onClick={() => setFormat('word')}
                  className={`flex items-center gap-3 p-2.5 rounded-panel border-2 transition-all ${format === 'word' ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border hover:border-border'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${format === 'word' ? 'border-indigo-600' : 'border-border'}`}>
                    {format === 'word' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="font-semibold text-sm text-text-secondary">Word</span>
                </button>
              </div>
            </div>

            {/* Qualité */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2.5">Qualité</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setQuality('standard')}
                  className={`flex items-center gap-3 p-2.5 rounded-panel border-2 transition-all ${quality === 'standard' ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border hover:border-border'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quality === 'standard' ? 'border-indigo-600' : 'border-border'}`}>
                    {quality === 'standard' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="font-semibold text-sm text-text-secondary">Web</span>
                </button>
                <button
                  onClick={() => setQuality('print')}
                  className={`flex items-center gap-3 p-2.5 rounded-panel border-2 transition-all ${quality === 'print' ? 'border-indigo-600 bg-primary-subtle/50' : 'border-border hover:border-border'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quality === 'print' ? 'border-indigo-600' : 'border-border'}`}>
                    {quality === 'print' && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="font-semibold text-sm text-text-secondary">Impression</span>
                </button>
              </div>
            </div>

            {/* Theme recap */}
            <div className="bg-background-subtle rounded-panel p-3 border border-border flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Thème</p>
                <p className="text-sm font-bold text-text-primary capitalize mt-0.5">{cv.template_id}</p>
              </div>
              {isLoadingAccess ? (
                <div className="text-right">
                  <span className="text-xs font-semibold text-text-muted">Vérification...</span>
                </div>
              ) : isPremium && !isUnlocked ? (
                <div className="text-right">
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md">{price} {currency}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 p-5 pb-8 sm:pb-5 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3 bg-white">
            <Button onClick={onClose} variant="secondary" className="w-full sm:w-auto">
              Annuler
            </Button>

            <Button
              onClick={handleExport}
              disabled={isProcessing}
              isLoading={isProcessing}
              variant={!isUnlocked ? "danger" : "primary"}
              className={`w-full sm:w-auto ${!isUnlocked ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
              leftIcon={!isUnlocked ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            >
              {!isUnlocked ? (
                <>Débloquer - {price} {currency}</>
              ) : (
                <>Télécharger</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Import de PaywallModal (assurez-vous de l'importer en haut) */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        title="Modèle de CV Premium"
        description="Passez à carriey PRO pour débloquer le téléchargement de ce modèle ainsi que tous les autres modèles premium sans limite."
        singleItemPrice={price}
        singleItemTitle="ce modèle"
        singleItemId={cv.template_id}
      />
    </>
  );
}
