"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import TemplatePreview from '@/components/public/TemplatePreview';
import config from '@/lib/config';
import {
  ChevronRight, Sparkles, FileText, CheckCircle2, UserCircle, Globe,
  ArrowRight, Layout, LayoutTemplate, Briefcase, Wand2, MonitorSmartphone,
  ChevronDown, GraduationCap, Building2, Rocket, Globe2, Smile, Settings2, Plus
} from 'lucide-react';

export default function LandingPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/templates`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        // Dupliquer pour l'illusion du défilement infini
        setTemplates(data.length > 0 ? [...data, ...data] : []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let animationId: number;
    let lastTime = 0;

    const scroll = (time: number) => {
      if (!isCarouselHovered && carouselRef.current && templates.length > 0) {
        if (time - lastTime > 16) {
          carouselRef.current.scrollLeft += 1;
          if (carouselRef.current.scrollLeft >= carouselRef.current.scrollWidth / 2) {
            carouselRef.current.scrollLeft = 0;
          }
          lastTime = time;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isCarouselHovered, templates]);

  const fallbackThemes = [
    { name: 'Moderne', style: 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-indigo-100/20' },
    { name: 'Élégant', style: 'bg-gradient-to-br from-gray-50 to-white border-gray-200 shadow-gray-200/20' },
    { name: 'Minimal', style: 'bg-white border-gray-100 shadow-gray-100/20' },
    { name: 'Créatif', style: 'bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-purple-100/20' },
    { name: 'Corporate', style: 'bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-slate-200/20' },
    { name: 'Tokyo', style: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-emerald-100/20' }
  ];

  const carouselItems = templates.length > 0
    ? templates.map((t, i) => ({
      name: t.name,
      style: fallbackThemes[i % fallbackThemes.length].style,
      originalTemplate: t
    }))
    : fallbackThemes.map(t => ({ ...t, originalTemplate: null }));

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-indigo-200">

      {/* 2. Hero Section */}
      <main className="relative min-h-[calc(100vh-80px)] flex items-center pt-10 pb-20 lg:pt-0 lg:pb-0 overflow-hidden border-b border-gray-100">
        {/* Visible grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Copy */}
            <div className="max-w-2xl animate-fade-in">

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.15] mb-5">
                Votre parcours professionnel en <br />
                <span className="text-indigo-600">Un seul endroit.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                Créez votre profil professionnel une fois et utilisez-le pour construire le documents adaptés à chaque opportunité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-base font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                  Créer mon profil gratuitement
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

            {/* Right: Concept Visual */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur-2xl opacity-50 -z-10"></div>

              <div className="flex flex-col items-center">
                {/* Profile Node (SaaS Window style) */}
                <div className="w-64 bg-white rounded-[1rem] shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-gray-200/60 overflow-hidden relative z-10 mb-5 backdrop-blur-xl transition-transform hover:-translate-y-1 duration-500">
                  {/* Window Header */}
                  <div className="bg-gray-50/50 border-b border-gray-100 px-3 py-2.5 flex items-center gap-1.5">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                    <div className="mx-auto text-[9px] font-semibold text-gray-400 tracking-widest uppercase">Profil Professionnel</div>
                  </div>

                  {/* Window Content (Abstract UI Skeleton) */}
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                        <UserCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2.5 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="h-2 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-6 bg-gray-50 rounded-lg border border-gray-100 w-full"></div>
                      </div>
                      <div>
                        <div className="h-2 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-4 w-10 bg-indigo-50 rounded border border-indigo-100/50"></div>
                          <div className="h-4 w-12 bg-indigo-50 rounded border border-indigo-100/50"></div>
                          <div className="h-4 w-10 bg-indigo-50 rounded border border-indigo-100/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG Connecting Arrows */}
                <div className="relative w-full h-14 flex justify-center mb-2 z-0">
                  <svg width="220" height="56" viewBox="0 0 220 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0">
                    <path d="M110 0 V 20" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M30 20 H 190" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M30 20 V 56" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M110 20 V 56" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M190 20 V 56" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Arrowheads */}
                    <path d="M27 52 L 30 56 L 33 52" fill="#9CA3AF" />
                    <path d="M107 52 L 110 56 L 113 52" fill="#9CA3AF" />
                    <path d="M187 52 L 190 56 L 193 52" fill="#9CA3AF" />
                  </svg>
                </div>

                {/* Output Nodes */}
                <div className="flex gap-4 relative z-10 w-[220px] justify-between">
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 bg-white border border-gray-200/80 rounded-xl shadow-md shadow-gray-200/40 flex items-center justify-center text-indigo-600 transition-transform group-hover:-translate-y-1">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">CV</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 bg-white border border-gray-200/80 rounded-xl shadow-md shadow-gray-200/40 flex items-center justify-center text-purple-600 transition-transform group-hover:-translate-y-1">
                      <LayoutTemplate className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Lettre</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="w-10 h-10 bg-white border border-gray-200/80 rounded-xl shadow-md shadow-gray-200/40 flex items-center justify-center text-emerald-600 transition-transform group-hover:-translate-y-1">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Profil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Comment ça fonctionne (3 étapes) */}
      <section id="fonctionnement" className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-3">
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
                <span className="text-3xl font-bold text-indigo-600">01</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Construisez votre profil</h3>
              <p className="text-gray-600 leading-relaxed">
                Ajoutez votre expérience, vos formations, vos compétences et vos réalisations.
              </p>
            </div>
            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-bold text-indigo-600">02</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choisissez ce dont vous avez besoin</h3>
              <p className="text-gray-600 leading-relaxed">
                CV, lettre de motivation, profil professionnel public, présentation...
              </p>
            </div>
            {/* Step 3 */}
            <div className="relative text-center">
              <div className="w-24 h-24 mx-auto bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-bold text-indigo-600">03</span>
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
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-5 leading-tight sm:text-3xl">
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
                  <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-medium shadow-lg shadow-indigo-600/30 z-10 relative">
                    <UserCircle className="w-5 h-5" />
                    MON PROFIL MASTER
                  </div>
                  {/* Glowing background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-16 bg-indigo-400 blur-2xl opacity-40 -z-10"></div>
                </div>

                {/* Branches using sleek SVG */}
                <div className="relative h-16 w-full flex justify-center -mt-6 mb-2">
                  <svg width="330" height="67" viewBox="0 0 340 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0">
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
                    <div className="bg-gray-50 border border-gray-200/60 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 mb-4 shadow-sm flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" /> CV
                    </div>
                    <div className="space-y-2">
                      {['Offre A', 'Offre B', 'Offre C'].map(o => (
                        <div key={o} className="bg-white border border-gray-100 py-1.5 rounded-lg text-xs font-semibold text-gray-500 shadow-sm">{o}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200/60 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 mb-4 shadow-sm flex items-center justify-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-purple-500" /> Lettre
                    </div>
                    <div className="space-y-2">
                      {['Offre A', 'Offre B', 'Offre C'].map(o => (
                        <div key={o} className="bg-white border border-gray-100 py-1.5 rounded-lg text-xs font-semibold text-gray-500 shadow-sm">{o}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200/60 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 mb-4 shadow-sm flex items-center justify-center gap-2">
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
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center mb-10">

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-4">
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
         
        </div>
      </section>

      {/* 6. Vos documents */}
      <section className="relative py-24 bg-white border-y border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              Ce que vous pouvez créer
            </h2>
            <p className="text-gray-600 text-lg">
              Une gamme de documents professionnels qui évoluera avec le temps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white border border-gray-100 p-10 rounded-[2rem] text-center shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-6">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">CV Professionnel</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Des designs approuvés par les recruteurs.</p>
            </div>
            <div className="bg-white border border-gray-100 p-10 rounded-[2rem] text-center shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-6">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lettre de motivation</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Générée et adaptée par l'IA.</p>
            </div>
            <div className="bg-white border border-gray-100 p-10 rounded-[2rem] text-center shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Profil public</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Votre lien personnel (carriey.com/nom).</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Les thèmes */}
      <section id="modeles" className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-3">
              Votre contenu. Votre style.
            </h2>
            <p className="text-lg text-gray-600">
              Votre profil et votre contenu restent les mêmes. Choisissez simplement la présentation qui vous correspond parmi nos thèmes.
            </p>
          </div>

          <div
            ref={carouselRef}
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
            onTouchStart={() => setIsCarouselHovered(true)}
            onTouchEnd={() => setIsCarouselHovered(false)}
            className="flex gap-6 overflow-x-auto pb-8 pt-4 no-scrollbar -mx-6 px-6 lg:-mx-8 lg:px-8 cursor-pointer"
          >
            {carouselItems.map((theme, i) => (
              <div key={i} className={`flex-shrink-0 w-[260px] sm:w-[300px] rounded-2xl border-2 flex flex-col shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${theme.style}`}>
                <div className="relative w-full aspect-[1/1.414] bg-white/50 backdrop-blur-sm rounded-xl border border-white overflow-hidden">
                  {theme.originalTemplate ? (
                    <TemplatePreview template={theme.originalTemplate} />
                  ) : (
                    <div className="p-4">
                      {/* Abstract CV Visual */}
                      <div className="w-1/3 h-4 bg-gray-200 rounded mb-5"></div>
                      <div className="w-1/2 h-3 bg-gray-100 rounded mb-3"></div>
                      <div className="w-2/3 h-3 bg-gray-100 rounded mb-8"></div>
                      <div className="w-1/4 h-3 bg-gray-200 rounded mb-3"></div>
                      <div className="w-full h-2 bg-gray-100 rounded mb-2"></div>
                      <div className="w-5/6 h-2 bg-gray-100 rounded mb-2"></div>
                      <div className="w-3/4 h-2 bg-gray-100 rounded mb-2"></div>
                    </div>
                  )}
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl text-center mb-10">
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
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-6">
            Commencez simplement. Allez aussi loin que vous le souhaitez.
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-12 max-w-4xl mx-auto">
            <div className="flex-1 bg-gray-50 p-8 rounded-3xl border border-gray-100 w-full text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mode guidé</h3>
              <p className="text-gray-600">Carriey vous aide à chaque étape pour remplir votre profil sans stress.</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm text-gray-400">
              <Plus className="w-6 h-6" />
            </div>
            <div className="flex-1 bg-gray-50 p-8 rounded-3xl border border-gray-100 w-full text-left">
              <div className="w-12 h-12 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center mb-6">
                <Settings2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Personnalisation</h3>
              <p className="text-gray-600">Contrôlez chaque détail de votre document. Modifiez directement et ajustez finement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Tarification */}
      <section id="tarifs" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl mb-4">
              Des tarifs simples et transparents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Gratuit */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Les bases pour centraliser votre parcours.</p>
              <div className="text-3xl font-bold text-gray-900 mb-8">0 XOF</div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Profil professionnel central', 'CV et Lettres (thèmes de base)', 'Analyse d\'offre', 'Générations limitées'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-relative text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block w-full py-4 px-4 bg-gray-100 text-gray-900 font-bold rounded-xl text-center hover:bg-gray-200 transition-colors">
                Commencer
              </Link>
            </div>

            {/* Plus */}
            <div className="bg-indigo-600 p-8 rounded-3xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-indigo-500 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-indigo-600 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                Le plus populaire
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Carriey PRO</h3>
              <p className="text-sm text-indigo-200 mb-6 font-medium">L'outil ultime pour multiplier vos candidatures.</p>
              <div className="text-3xl font-bold text-white mb-8">
                3 500 XOF<span className="text-base font-medium text-indigo-200">/mois</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Tout du plan Gratuit', 'Tous les modèles premium', 'IA : Adaptation experte aux offres', 'Export PDF Haute Qualité'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-relative text-white">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full py-4 px-4 bg-white text-indigo-600 font-bold rounded-xl text-center hover:bg-indigo-50 transition-colors">
                Découvrir
              </Link>
            </div>

            {/* Pro / Entreprise */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Achat unique</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Pour un besoin ponctuel et précis.</p>
              <div className="text-3xl font-bold text-gray-900 mb-8">
                Dès 900 XOF<span className="text-base font-medium text-gray-400">/modèle</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Débloque ce modèle à vie', 'Génération IA de base (lettre incluse)', 'Export PDF illimité', 'Profil central'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-relative text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full py-4 px-4 bg-gray-100 text-gray-900 font-bold rounded-xl text-center hover:bg-gray-200 transition-colors">
                Découvrir
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center mb-12 sm:text-3xl">
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
      <section className="py-24 bg-white text-center px-6 relative overflow-hidden border-t border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 sm:text-4xl tracking-tight">Votre parcours mérite plus qu'un seul CV.</h2>
          <p className="text-xl text-gray-600 mb-10">Créez votre profil gratuitement et commencez à construire vos documents professionnels.</p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-1">
            Commencer gratuitement
          </Link>
        </div>
      </section>

    </div>
  );
}