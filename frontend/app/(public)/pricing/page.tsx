'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-indigo-200 flex flex-col">
      {/* Decorative Header Background */}
      <div className="relative overflow-hidden bg-[#FDFDFD] border-b border-gray-100 pt-24 pb-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-50 rounded-[100%] blur-3xl opacity-60 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-5 leading-[1.15]">
            Des tarifs <span className="text-indigo-600">simples et transparents</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Boostez votre carrière avec nos outils premium accessibles à tous.
            Aucun frais caché, annulez quand vous voulez.
          </p>
        </div>
      </div>

      <main className="pb-24 -mt-12 relative z-20 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Gratuit */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Gratuit</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Les bases pour centraliser votre parcours.</p>
              <div className="text-3xl font-black text-gray-900 mb-8">0 XOF</div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Profil professionnel central', 'CV et Lettres (thèmes de base)', 'Analyse d\'offre', 'Générations limitées'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full py-4 px-4 bg-gray-100 text-gray-900 font-bold rounded-xl text-center hover:bg-gray-200 transition-colors">
                Commencer gratuitement
              </Link>
            </div>

            {/* Plus */}
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-indigo-500 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                Le plus populaire
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">Carriey PRO</h3>
              <p className="text-sm text-indigo-200 mb-6 font-medium">L'outil ultime pour multiplier vos candidatures.</p>
              <div className="text-3xl font-black text-white mb-8">
                3 500 XOF<span className="text-base font-medium text-indigo-200">/mois</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Tout du plan Gratuit', 'Tous les modèles premium', 'IA : Adaptation experte aux offres', 'Export PDF Haute Qualité', 'Profil public (Bientôt)'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-white">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=pro" className="block w-full py-4 px-4 bg-white text-indigo-600 font-bold rounded-xl text-center hover:bg-indigo-50 hover:-translate-y-0.5 transition-all shadow-lg">
                Passer en PRO
              </Link>
            </div>

            {/* Pro / Entreprise */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Achat unique</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Pour un besoin ponctuel et précis.</p>
              <div className="text-3xl font-black text-gray-900 mb-8">
                Dès 900 XOF<span className="text-base font-medium text-gray-400">/modèle</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Débloque ce modèle à vie', 'Génération IA de base (lettre incluse)', 'Export PDF illimité', 'Profil professionnel central'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/modeles" className="block w-full py-4 px-4 bg-gray-100 text-gray-900 font-bold rounded-xl text-center hover:bg-gray-200 transition-colors">
                Voir les modèles
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
