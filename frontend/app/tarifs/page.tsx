'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const plans = [
  {
    name: 'CVtor Free',
    price: '0',
    currency: 'F CFA',
    period: '/mois',
    description: 'Pour commencer et tester nos modèles.',
    features: [
      { text: '1 CV téléchargeable', included: true },
      { text: 'Accès aux modèles de base', included: true },
      { text: 'Aperçu haute définition', included: true },
      { text: 'Tous les modèles premium', included: false },
      { text: 'IA pour rédiger les textes', included: false },
    ],
    cta: 'Commencer gratuitement',
    popular: false,
  },
  {
    name: 'CVtor Premium',
    price: '2 000',
    currency: 'F CFA',
    period: '/CV',
    description: 'Le choix idéal pour un CV parfait.',
    features: [
      { text: 'Accès à tous les modèles Premium', included: true },
      { text: 'IA de rédaction illimitée', included: true },
      { text: 'Export PDF haute définition', included: true },
      { text: 'Retouche illimitée pendant 7 jours', included: true },
      { text: 'Support prioritaire', included: true },
    ],
    cta: 'Acheter maintenant',
    popular: true,
  },
  {
    name: 'CVtor Illimité',
    price: '5 000',
    currency: 'F CFA',
    period: '/mois',
    description: 'Pour ceux qui postulent activement.',
    features: [
      { text: 'Tous les modèles Premium', included: true },
      { text: 'CVs illimités', included: true },
      { text: 'IA illimitée', included: true },
      { text: 'Export PDF et DOCX', included: true },
      { text: 'Stockage cloud sécurisé', included: true },
    ],
    cta: 'Passer en Illimité',
    popular: false,
  },
];

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      <main className="py-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6">
          {/* En-tête */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-black text-brand-text mb-4">
              Tarifs <span className="text-brand-cta">Transparents</span>
            </h1>
            <p className="text-lg text-brand-muted max-w-xl mx-auto font-medium">
              Boostez votre carrière avec nos outils premium accessibles à tous.
            </p>
          </div>

          {/* Grille de tarifs */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl border transition-all duration-300 p-8 flex flex-col ${
                  plan.popular
                    ? 'border-brand-cta shadow-2xl shadow-emerald-500/10 scale-105 z-10'
                    : 'border-gray-100 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-brand-cta text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                      Recommandé
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-brand-text mb-2">{plan.name}</h3>
                  <p className="text-brand-muted text-sm font-medium">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-brand-text">{plan.price}</span>
                    <span className="text-brand-muted font-bold text-sm uppercase">{plan.currency}{plan.period}</span>
                  </div>
                </div>

                <Link
                  href="/editor"
                  className={`block w-full py-4 rounded-xl font-bold text-center transition-all mb-8 ${
                    plan.popular
                      ? 'bg-brand-cta text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                      : 'bg-brand-text text-white hover:bg-black'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-4 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included ? 'bg-emerald-100' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {feature.included ? (
                          <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${feature.included ? 'text-brand-text' : 'text-gray-400 line-through'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Section Paiement Local */}
          <div className="mt-24 text-center bg-white rounded-3xl p-12 border border-gray-100 shadow-sm max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-brand-text mb-8">Paiements 100% sécurisés</h2>
            <div className="flex justify-center items-center gap-12 flex-wrap opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#FF6600] rounded-xl flex items-center justify-center text-white font-black text-[10px]">OM</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Orange Money</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#FFCC00] rounded-xl flex items-center justify-center text-black font-black text-[10px]">MTN</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">MTN Mobile</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#1BADE4] rounded-xl flex items-center justify-center text-white font-black text-[10px]">W</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Wave</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#00AEEF] rounded-xl flex items-center justify-center text-white font-black text-[10px]">Moov</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Moov Money</span>
              </div>
            </div>
            <p className="mt-8 text-sm text-brand-muted font-medium">
              Accès immédiat dès la confirmation du paiement. Sans carte bancaire.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
