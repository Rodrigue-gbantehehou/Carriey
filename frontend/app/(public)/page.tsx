"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import config from '@/lib/config';
import { 
  ChevronRight, Sparkles, FileText, CheckCircle2, UserCircle, Globe, 
  ArrowRight, Layout, LayoutTemplate, Briefcase, Wand2, MonitorSmartphone,
  ChevronDown, GraduationCap, Building2, Rocket, Globe2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-indigo-200">
      
      {/* 2. Hero Section */}
      <main className="relative min-h-[calc(100vh-80px)] flex items-center pt-10 pb-20 lg:pt-0 lg:pb-0 overflow-hidden border-b border-gray-100">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div className="max-w-2xl animate-fade-in">
             
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-5">
                Votre parcours professionnel. <br />
                <span className="text-indigo-600">Un seul endroit.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                Créez votre profil professionnel une fois et utilisez-le pour construire vos CV, lettres de motivation et autres documents adaptés à chaque opportunité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                  Créer mon profil gratuitement
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="mt-4 text-xs text-gray-500 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Aucun paiement requis pour commencer
              </p>
            </div>

            {/* Right: Concept Visual */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur-2xl opacity-50 -z-10"></div>
              
              <div className="flex flex-col items-center">
                {/* Profile Node (SaaS Window style) */}
                <div className="w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-200/60 overflow-hidden relative z-10 mb-6 backdrop-blur-xl transition-transform hover:-translate-y-1 duration-500">
                  {/* Window Header */}
                  <div className="bg-gray-50/50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    </div>
                    <div className="mx-auto text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Profil Master</div>
                  </div>
                  
                  {/* Window Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base">John Doe</div>
                        <div className="text-xs font-medium text-gray-500">Développeur web</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Expériences</div>
                        <div className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">Akemar · EFASmart</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">Compétences</div>
                        <div className="flex gap-2">
                          {['PHP', 'Symfony', 'MySQL'].map(skill => (
                            <span key={skill} className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/50">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Connecting Arrows */}
                <div className="relative w-full h-16 flex justify-center -mt-2 mb-2 z-0">
                  <svg width="240" height="64" viewBox="0 0 240 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0">
                    <path d="M120 0 V 24" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M40 24 H 200" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M40 24 V 64" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M120 24 V 64" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M200 24 V 64" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    
                    {/* Arrowheads */}
                    <path d="M37 60 L 40 64 L 43 60" fill="#9CA3AF" />
                    <path d="M117 60 L 120 64 L 123 60" fill="#9CA3AF" />
                    <path d="M197 60 L 200 64 L 203 60" fill="#9CA3AF" />
                  </svg>
                </div>

                {/* Output Nodes */}
                <div className="flex gap-6 relative z-10 w-[280px] justify-between">
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 bg-white border border-gray-200/80 rounded-2xl shadow-lg shadow-gray-200/40 flex items-center justify-center text-indigo-600 transition-transform group-hover:-translate-y-1">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">CV</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 bg-white border border-gray-200/80 rounded-2xl shadow-lg shadow-gray-200/40 flex items-center justify-center text-purple-600 transition-transform group-hover:-translate-y-1">
                      <LayoutTemplate className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Lettre</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-14 h-14 bg-white border border-gray-200/80 rounded-2xl shadow-lg shadow-gray-200/40 flex items-center justify-center text-emerald-600 transition-transform group-hover:-translate-y-1">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">Profil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Comment ça fonctionne (3 étapes) */}
      <section id="fonctionnement" className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl mb-3">
              Comment ça fonctionne
            </h2>
            <p className="text-base text-gray-600">
              Trois étapes simples pour reprendre le contrôle de votre carrière.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-gray-100 via-indigo-100 to-gray-100 -z-10"></div>

            {/* Step 1 */}
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-black text-indigo-600">01</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Construisez votre profil</h3>
              <p className="text-gray-600 leading-relaxed">
                Ajoutez votre expérience, vos formations, vos compétences et vos réalisations.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-black text-indigo-600">02</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choisissez ce dont vous avez besoin</h3>
              <p className="text-gray-600 leading-relaxed">
                CV, lettre de motivation, profil professionnel public, présentation...
              </p>
            </div>
            {/* Step 3 */}
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-black text-indigo-600">03</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Adaptez et exportez</h3>
              <p className="text-gray-600 leading-relaxed">
                Personnalisez votre document, choisissez votre thème et exportez-le.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Un profil, plusieurs possibilités */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-5 leading-tight sm:text-3xl">
                Ne recommencez plus votre CV à chaque candidature.
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Votre parcours reste centralisé. Chaque document que vous générez peut puiser dans les informations pertinentes de votre profil. 
              </p>
              <ul className="space-y-4">
                {[
                  "Une seule source de vérité pour votre carrière",
                  "Mettez à jour à un endroit, reflété partout",
                  "Générez des variations infinies en un clic"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 relative z-10">
                <div className="text-center mb-8 relative">
                  <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-600/30 z-10 relative">
                    <UserCircle className="w-5 h-5" />
                    MON PROFIL MASTER
                  </div>
                  {/* Glowing background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 bg-indigo-400 blur-2xl opacity-40 -z-10"></div>
                </div>
                
                {/* Branches using sleek SVG */}
                <div className="relative h-16 w-full flex justify-center -mt-6 mb-2">
                  <svg width="340" height="64" viewBox="0 0 340 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0">
                    <path d="M170 0 V 32" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M50 32 H 290" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M50 32 V 64" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M170 32 V 64" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M290 32 V 64" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                    
                    <path d="M47 60 L 50 64 L 53 60" fill="#94A3B8" />
                    <path d="M167 60 L 170 64 L 173 60" fill="#94A3B8" />
                    <path d="M287 60 L 290 64 L 293 60" fill="#94A3B8" />
                  </svg>
                </div>

                <div className="flex justify-between text-center gap-4 relative z-10">
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200/60 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 mb-4 shadow-sm flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> CV
                    </div>
                    <div className="space-y-2">
                      {['Offre A', 'Offre B', 'Offre C'].map(o => (
                        <div key={o} className="bg-white border border-gray-100 py-1.5 rounded-lg text-xs font-semibold text-gray-500 shadow-sm">{o}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200/60 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 mb-4 shadow-sm flex items-center justify-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-purple-500" /> Lettre
                    </div>
                    <div className="space-y-2">
                      {['Offre A', 'Offre B', 'Offre C'].map(o => (
                        <div key={o} className="bg-white border border-gray-100 py-1.5 rounded-lg text-xs font-semibold text-gray-500 shadow-sm">{o}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200/60 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 mb-4 shadow-sm flex items-center justify-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-500" /> Profil
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white border border-gray-100 py-1.5 rounded-lg text-xs font-semibold text-gray-500 shadow-sm">Lien partagé</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Adaptez votre candidature (IA) */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl mb-4">
            Une candidature différente pour chaque opportunité.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Collez une offre d'emploi. Notre intelligence artificielle analyse les besoins et adapte instantanément votre profil pour correspondre parfaitement.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-gray-50/50 rounded-[2.5rem] p-8 lg:p-12 border border-gray-200/60 shadow-sm relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent -z-10"></div>
            
            {/* Input (Mac Window style) */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200/50 overflow-hidden">
              <div className="bg-gray-50/80 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Offre d'emploi</div>
                <div className="w-10"></div> {/* spacer */}
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-8">
                  <div className="h-6 bg-gray-100 rounded-md w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-50 rounded w-full"></div>
                    <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-50 rounded w-4/6"></div>
                  </div>
                </div>
                <div className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors cursor-pointer">
                  <Wand2 className="w-5 h-5" /> Analyser l'offre
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-indigo-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-sm uppercase tracking-wide">
                  <CheckCircle2 className="w-5 h-5" /> Analyse de correspondance
                </div>
                <div className="flex flex-wrap gap-2">
                  {['PHP / Symfony', 'API REST', 'MySQL', '2 ans exp.'].map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-indigo-50/80 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold tracking-wide">{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200/60 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">CV adapté</div>
                    <div className="text-xs text-gray-500 mt-0.5">Optimisé pour l'offre</div>
                  </div>
                </div>
                <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-200/60 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">Lettre de motivation</div>
                    <div className="text-xs text-gray-500 mt-0.5">Générée sur-mesure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-bold text-sm border border-green-200">
              <CheckCircle2 className="w-4 h-4" /> Ces fonctionnalités sont gratuites
            </span>
          </div>
        </div>
      </section>

      {/* 6. Vos documents */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl mb-3">
              Ce que vous pouvez créer
            </h2>
            <p className="text-gray-400 text-base">
              Une gamme de documents professionnels qui évoluera avec le temps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl text-center hover:bg-gray-750 transition-colors">
              <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">CV Professionnel</h3>
              <p className="text-sm text-gray-400">Des designs approuvés par les recruteurs.</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl text-center hover:bg-gray-750 transition-colors">
              <LayoutTemplate className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Lettre de motivation</h3>
              <p className="text-sm text-gray-400">Générée et adaptée par l'IA.</p>
            </div>
            <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl text-center hover:bg-gray-750 transition-colors">
              <Globe className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Profil public</h3>
              <p className="text-sm text-gray-400">Votre lien personnel (cariey.com/nom).</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Les thèmes */}
      <section id="modeles" className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl mb-3">
              Votre contenu. Votre style.
            </h2>
            <p className="text-lg text-gray-600">
              Votre profil et votre contenu restent les mêmes. Choisissez simplement la présentation qui vous correspond parmi nos thèmes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { name: 'Moderne', style: 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100' },
              { name: 'Élégant', style: 'bg-gradient-to-br from-gray-50 to-white border-gray-200' },
              { name: 'Minimal', style: 'bg-white border-gray-100' }
            ].map((theme, i) => (
              <div key={i} className={`h-80 rounded-2xl border-2 p-6 flex flex-col shadow-sm hover:shadow-xl transition-shadow ${theme.style}`}>
                <div className="flex-1">
                  {/* Abstract CV Visual */}
                  <div className="w-1/3 h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="w-1/2 h-3 bg-gray-100 rounded mb-2"></div>
                  <div className="w-2/3 h-3 bg-gray-100 rounded mb-8"></div>
                  
                  <div className="w-1/4 h-3 bg-gray-200 rounded mb-3"></div>
                  <div className="w-full h-2 bg-gray-100 rounded mb-2"></div>
                  <div className="w-5/6 h-2 bg-gray-100 rounded mb-2"></div>
                </div>
                <div className="mt-auto border-t border-gray-200/50 pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-700">CV {theme.name}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/modeles" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Voir tous les thèmes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Pour qui ? */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl text-center mb-16">
            Quel que soit votre parcours.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: GraduationCap, title: 'Étudiant', desc: 'Premier CV ou recherche de stage.' },
              { icon: Briefcase, title: 'Professionnel', desc: 'Mettez votre expérience à jour.' },
              { icon: Rocket, title: 'En reconversion', desc: 'Présentez votre nouveau parcours.' },
              { icon: UserCircle, title: 'Indépendant', desc: 'Présentez vos compétences et projets.' },
              { icon: Globe2, title: 'À la recherche d\'opportunités', desc: 'Adaptez votre candidature à chaque offre.' }
            ].map((persona, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <persona.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{persona.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{persona.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Simple / Puissant */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl mb-6">
            Commencez simplement. Allez aussi loin que vous le souhaitez.
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-12 max-w-4xl mx-auto">
            <div className="flex-1 bg-gray-50 p-8 rounded-3xl border border-gray-100 w-full text-left">
              <span className="text-2xl mb-4 block">👋</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mode guidé</h3>
              <p className="text-gray-600">Carriey vous aide à chaque étape pour remplir votre profil sans stress.</p>
            </div>
            <div className="text-2xl font-black text-gray-300">+</div>
            <div className="flex-1 bg-gray-50 p-8 rounded-3xl border border-gray-100 w-full text-left">
              <span className="text-2xl mb-4 block">⚙️</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Personnalisation</h3>
              <p className="text-gray-600">Contrôlez chaque détail de votre document. Modifiez directement et ajustez finement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Tarification */}
      <section id="tarifs" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl mb-4">
              Des tarifs simples et transparents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Gratuit */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Gratuit</h3>
              <div className="text-3xl font-black text-gray-900 mb-6">0 €</div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Profil professionnel', 'Ajout des expériences', 'Analyse d\'offre', 'Adaptation (base)'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full py-3 px-4 bg-gray-100 text-gray-900 font-bold rounded-xl text-center hover:bg-gray-200 transition-colors">
                Commencer
              </Link>
            </div>
            
            {/* Plus */}
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-600/20 border border-indigo-500 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-200 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Populaire</div>
              <h3 className="text-lg font-bold text-white mb-2">Carriey Plus</h3>
              <div className="text-3xl font-black text-white mb-6">5,99 €<span className="text-base font-normal text-indigo-200">/mois</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Tout du Gratuit', 'Thèmes premium', 'Exports avancés (PDF HQ)', 'Historique étendu'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle2 className="w-4 h-4 text-indigo-300 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full py-3 px-4 bg-white text-indigo-600 font-bold rounded-xl text-center hover:bg-gray-50 transition-colors">
                Découvrir
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Carriey Pro</h3>
              <div className="text-3xl font-black text-gray-900 mb-6">12,99 €<span className="text-base font-normal text-gray-500">/mois</span></div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Tout de Plus', 'Personnalisation poussée', 'Génération IA illimitée', 'Accès prioritaire'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full py-3 px-4 bg-gray-100 text-gray-900 font-bold rounded-xl text-center hover:bg-gray-200 transition-colors">
                Découvrir
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight text-center mb-12 sm:text-3xl">
            Questions fréquentes
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Carriey est-il gratuit ?",
                a: "Oui, les fonctionnalités essentielles du profil et de l'adaptation à une offre sont accessibles gratuitement."
              },
              {
                q: "Dois-je refaire mon CV à chaque candidature ?",
                a: "Non. Votre profil reste central et peut servir à produire plusieurs versions instantanément."
              },
              {
                q: "Puis-je modifier les documents générés ?",
                a: "Oui, vous avez le contrôle total pour éditer et personnaliser chaque document avant l'export."
              },
              {
                q: "Puis-je choisir le design de mon CV ?",
                a: "Absolument, avec des thèmes gratuits et premium disponibles dans la bibliothèque."
              },
              {
                q: "Carriey utilise-t-il l'IA ?",
                a: "Oui, notamment pour analyser les offres d'emploi et vous aider à adapter vos documents (lettres, accroches)."
              },
              {
                q: "Mes informations restent-elles privées ?",
                a: "Vos données sont sécurisées et ne sont jamais revendues à des tiers. Vous décidez si votre profil public est accessible."
              }
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-200 pb-6">
                <h4 className="text-base font-bold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Dernier CTA */}
      <section className="py-24 bg-gray-900 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white mb-4 sm:text-3xl">Votre parcours mérite plus qu'un seul CV.</h2>
          <p className="text-lg text-gray-400 mb-10">Créez votre profil gratuitement et commencez à construire vos documents professionnels.</p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all hover:-translate-y-0.5">
            Commencer gratuitement
          </Link>
        </div>
      </section>

    </div>
  );
}