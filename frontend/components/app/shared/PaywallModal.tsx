import React from 'react';
import { Lock, Crown, ArrowRight, X } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSubscribe?: () => void;
}

export function PaywallModal({ 
  isOpen, 
  onClose, 
  title = "Passez à Cariey PRO", 
  description = "Cette fonctionnalité est réservée aux abonnés PRO. Débloquez tous les modèles, l'IA et bien plus.",
  onSubscribe
}: PaywallModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-6 flex flex-col items-center text-center border-b border-gray-100 bg-gradient-to-br from-indigo-50/50 to-white">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="p-6 bg-gray-50/50">
          <ul className="space-y-3 mb-6">
            {[
              "Modèles de CV Premium illimités",
              "Génération de Lettre par IA illimitée",
              "Profil Public Avancé (Portfolio)",
              "Ciblage des offres d'emploi par IA"
            ].map((feature, i) => (
              <li key={i} className="flex items-center text-sm font-medium text-gray-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mr-3 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => {
              if (onSubscribe) onSubscribe();
              else window.location.href = '/pricing';
            }}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            Découvrir Cariey PRO <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-4">
            Pass à partir de 1500 FCFA / 2.99€
          </p>
        </div>
      </div>
    </div>
  );
}
