"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/public/Navbar';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-indigo-200">

      

      {/* Hero Section */}
      <main className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none [mask-image:linear-gradient(to_bottom,black_60%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent)]"></div>
        
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10 animate-blob"></div>
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-50 -z-10 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.1s' }}>
            Your professional profile, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
              everywhere.
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto font-medium animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
            Votre parcours professionnel, simplement. Centralisez vos expériences, générez des CVs sur-mesure et publiez un profil web en un seul clic.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.3s' }}>
            <Link href="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-lg font-medium shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
              Créer mon profil gratuitement
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link href="/login" className="border border-gray-200 bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              J'ai déjà un profil
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 max-w-5xl mx-auto px-6 lg:px-8 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.5s' }}>
          <div className="rounded-2xl border border-gray-200/50 bg-white/40 backdrop-blur-xl p-2 shadow-2xl">
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
              {/* Mockup Top Bar */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto bg-white border border-gray-200 rounded text-xs px-3 py-1 text-gray-400 font-mono">
                  cariey.com/profil
                </div>
              </div>
              {/* Mockup Content */}
              <div className="p-8 grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-4">
                   <div className="h-24 w-24 rounded-full bg-indigo-100 border-4 border-white shadow-sm mx-auto"></div>
                   <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                   <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                </div>
                <div className="col-span-2 space-y-4">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold">1</div>
                      <div className="h-4 bg-indigo-200 rounded w-1/3"></div>
                    </div>
                    <div className="h-3 bg-indigo-100 rounded w-2/3 ml-11"></div>
                  </div>
                  <div className="h-32 rounded-xl bg-gray-50 border border-gray-100 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded bg-gray-300 text-white flex items-center justify-center font-bold">2</div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 ml-11"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Concept Section */}
      <section id="concept" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-indigo-600 tracking-wide uppercase mb-3">Le Concept</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Construisez une fois, utilisez partout.</p>
            <p className="mt-4 text-lg text-gray-500">
              Fini le casse-tête de refaire son CV à chaque candidature. Avec CARIEY, vous remplissez vos informations une seule fois, et nous nous occupons du reste.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Remplissez une seule fois</h3>
              <p className="text-gray-500">Ajoutez vos expériences et diplômes. Nous les gardons en sécurité pour que vous n'ayez plus jamais à les retaper.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6 text-purple-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Vos CV en un clic</h3>
              <p className="text-gray-500">Cochez simplement les informations que vous voulez montrer, choisissez un beau modèle, et votre CV est prêt.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Votre site web personnel</h3>
              <p className="text-gray-500">Partagez votre parcours facilement avec un lien web à votre nom (cariey.com/votre-nom) à envoyer aux recruteurs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">Prêt à donner un coup de pouce à votre carrière ?</h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">Rejoignez les professionnels qui ont déjà transformé leur façon de postuler avec CARIEY.</p>
          <Link href="/register" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-gray-50 transition-all hover:-translate-y-1 active:scale-95">
            Créer mon compte gratuitement
          </Link>
        </div>
      </section>


    </div>
  );
}