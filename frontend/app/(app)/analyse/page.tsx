'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useProfileStore } from '@/store/profile';
import { Sparkles, ChevronLeft, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AnalysePage() {
  const { data: session } = useSession();
  const { profile } = useProfileStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const score = 89;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#111827] mt-8 mb-2">L'IA analyse votre profil...</h2>
        <p className="text-gray-500 text-sm font-medium">Évaluation des compétences, de la cohérence et de l'impact.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/accueil" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#111827] hover:bg-gray-50 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] flex items-center gap-2">
            Analyse IA du Profil <Sparkles className="w-6 h-6 text-indigo-500" />
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Découvrez ce que les recruteurs (et les algorithmes) pensent de votre profil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        
        {/* Score Card */}
        <div className="md:col-span-4 bg-gradient-to-b from-[#1E1B4B] to-[#312E81] rounded-[24px] p-8 text-center text-white relative overflow-hidden shadow-lg border border-indigo-900/50 flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
          
          <div className="relative z-10 w-40 h-40 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#34D399" strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={`${283 - (283 * score) / 100}`} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{score}</span>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider mt-1">Excellent</span>
            </div>
          </div>
          
          <h3 className="relative z-10 text-xl font-bold mb-2">Profil très attractif</h3>
          <p className="relative z-10 text-indigo-200 text-xs font-medium leading-relaxed">
            Votre profil a une structure solide et met bien en valeur vos compétences clés.
          </p>
        </div>

        {/* Details & Recommendations */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Points Forts */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Vos Points Forts
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Titre précis et ciblé</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">Le titre "{profile?.title || 'Professionnel'}" correspond parfaitement aux recherches standard des recruteurs.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Expériences bien documentées</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">Vos descriptions comportent des mots-clés pertinents et démontrent une évolution claire.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Axes d'amélioration */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 mb-5">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Axes d'Amélioration
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Manque de résultats chiffrés</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">L'IA n'a détecté aucun indicateur de performance chiffré dans vos expériences. Les recruteurs adorent les métriques (ex: "+20% de ventes").</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Certifications manquantes</h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">Pour votre secteur, ajouter des certifications récentes prouverait votre mise à jour continue.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Recommandations */}
          <div className="bg-indigo-50 rounded-[24px] p-6 border border-indigo-100">
            <h3 className="text-base font-bold text-indigo-900 flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-indigo-600" /> Recommandations d'actions
            </h3>
            <div className="space-y-3">
              <Link href="/profil" className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-indigo-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold text-[#111827]">Ajouter des métriques à votre dernière expérience</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
              </Link>
              <Link href="/profil" className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-indigo-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <span className="text-sm font-bold text-[#111827]">Compléter la section Certifications</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
