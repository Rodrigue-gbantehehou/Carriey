import React, { useState, useEffect } from 'react';
import { Lock, Crown, ArrowRight, X } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSubscribe?: () => void;
  singleItemPrice?: number | string;
  singleItemTitle?: string;
  singleItemId?: string;
  onBuySingleItem?: () => void;
}

export function PaywallModal({
  isOpen,
  onClose,
  title = "Passez à carriey PRO",
  description = "Cette fonctionnalité est réservée aux abonnés PRO. Débloquez tous les modèles, l'IA et bien plus.",
  onSubscribe,
  singleItemPrice,
  singleItemTitle = "ce contenu",
  singleItemId,
  onBuySingleItem
}: PaywallModalProps) {
  const [proPrice, setProPrice] = useState<string>("...");
  const [proCurrency, setProCurrency] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_BASE}/plans`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Trouver le premier plan qui est un abonnement (durée > 0)
            // S'il y a plusieurs abonnements, on pourrait trier par prix, mais prenons le premier par défaut.
            const proPlan = data.find(p => p.duration_days > 0) || data[0];
            if (proPlan) {
              setProPrice(proPlan.price.toString());
              setProCurrency(proPlan.currency);
            }
          }
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-text-primary/40 backdrop-blur-sm">
      <div className="bg-white rounded-panel shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-secondary bg-border hover:bg-border rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-6 flex flex-col items-center text-center border-b border-border bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="w-16 h-16 bg-primary-subtle text-primary rounded-panel flex items-center justify-center mb-4 shadow-sm">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>

        <div className="p-6 bg-background-subtle/50">
          <ul className="space-y-3 mb-6">
            {[
              "Modèles de CV Premium illimités",
              "Génération de Lettre par IA illimitée",
              "Profil Public Avancé (Portfolio)",
              "Ciblage des offres d'emploi par IA"
            ].map((feature, i) => (
              <li key={i} className="flex items-center text-sm font-medium text-text-secondary">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mr-3 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (onSubscribe) onSubscribe();
                else window.location.href = '/pricing';
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-panel hover:from-indigo-700 hover:to-indigo-600 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              Pass carriey PRO (Dès {proPrice} {proCurrency}) <Crown className="w-4 h-4" />
            </button>

            {singleItemPrice && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background-subtle px-2 text-text-secondary">ou</span>
                </div>
              </div>
            )}

            {singleItemPrice && (
              <button
                onClick={() => {
                  if (onBuySingleItem) onBuySingleItem();
                  else {
                    const url = singleItemId ? `/checkout?type=single&templateId=${singleItemId}` : `/checkout?type=single`;
                    window.location.href = url;
                  }
                }}
                className="w-full py-3 px-4 bg-white text-text-secondary font-bold rounded-panel border border-border hover:bg-background-subtle transition-colors flex items-center justify-center gap-2"
              >
                Acheter {singleItemTitle} ({singleItemPrice} {proCurrency})
              </button>
            )}
          </div>

          {!singleItemPrice && (
            <p className="text-center text-xs text-text-muted mt-4">
              Pass à partir de {proPrice} {proCurrency}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
