'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function TarifsPage() {
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/plans`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Transformer les données de l'API pour le front
          const formattedPlans = data.map(dbPlan => {
            const featuresData = dbPlan.features || {};
            return {
              name: dbPlan.name,
              code: dbPlan.code,
              price: dbPlan.price,
              currency: dbPlan.currency,
              period: dbPlan.duration_days > 0 ? `/${dbPlan.duration_days} jours` : (dbPlan.code === 'single' ? '/modèle' : '/toujours'),
              description: featuresData.description || '',
              features: featuresData.items || [],
              cta: featuresData.cta || 'Choisir',
              popular: featuresData.popular || false
            };
          });
          setDbPlans(formattedPlans);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const displayPlans = dbPlans;

  return (
    <div className="w-full bg-white">
      {/* Decorative Header Background */}
      <div className="relative overflow-hidden bg-gray-50/50 border-b border-gray-100 pt-16 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-50 rounded-[100%] blur-3xl opacity-50 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Des tarifs <span className="text-indigo-600">simples et transparents</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Boostez votre carrière avec nos outils premium accessibles à tous. 
            Aucun frais caché, annulez quand vous voulez.
          </p>
        </div>
      </div>

      <main className="pb-24 -mt-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {displayPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-8 rounded-3xl flex flex-col relative ${
                    plan.popular
                      ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20 border border-indigo-500 transform md:-translate-y-4 z-10'
                      : 'bg-white shadow-sm border border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-200 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Populaire
                    </div>
                  )}

                  <h3 className={`text-lg font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  
                  <div className={`text-3xl font-black mb-6 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price !== '0.00' && plan.price !== '0' && plan.code === 'single' ? 'Dès ' : ''}
                    {plan.price !== '0.00' && plan.price !== '0' ? plan.price : '0'} {plan.currency}
                    <span className={`text-base font-normal ml-1 ${plan.popular ? 'text-indigo-200' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <p className={`text-sm mb-6 ${plan.popular ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature: any, index: number) => (
                      <li key={index} className={`flex items-center gap-2 text-sm ${
                        !feature.included && !plan.popular ? 'text-gray-400 line-through' :
                        !feature.included && plan.popular ? 'text-indigo-300/50 line-through' :
                        plan.popular ? 'text-indigo-100' : 'text-gray-600'
                      }`}>
                        {feature.included ? (
                           <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-indigo-300' : 'text-emerald-500'}`} />
                        ) : (
                           <XCircle className={`w-4 h-4 flex-shrink-0 ${plan.popular ? 'text-indigo-400/50' : 'text-gray-300'}`} />
                        )}
                        {feature.text}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={
                      plan.name.includes('PRO') ? '/checkout?type=pro' :
                      plan.name.includes('Unique') ? '/modeles' :
                      '/mes-documents'
                    }
                    className={`block w-full py-3 px-4 font-bold rounded-xl text-center transition-colors ${
                      plan.popular
                        ? 'bg-white text-indigo-600 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Section Paiement Local */}
          <div className="mt-20 text-center bg-gray-50 rounded-3xl p-10 border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Paiements 100% sécurisés</h2>
            <div className="flex justify-center items-center gap-10 flex-wrap opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#FF6600] rounded-xl flex items-center justify-center text-white font-black text-[10px] shadow-sm">OM</div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Orange</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#FFCC00] rounded-xl flex items-center justify-center text-black font-black text-[10px] shadow-sm">MTN</div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">MTN</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#1BADE4] rounded-xl flex items-center justify-center text-white font-black text-[10px] shadow-sm">W</div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wave</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#00AEEF] rounded-xl flex items-center justify-center text-white font-black text-[10px] shadow-sm">Moov</div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Moov</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Accès immédiat dès la confirmation du paiement. Sans carte bancaire requise.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
