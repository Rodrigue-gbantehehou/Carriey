'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [isDark, setIsDark] = useState(false) // Mode clair par défaut pour le professionnel
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 transition-colors">
        {/* Navigation professionnelle */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="container mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-slate-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent">CVPro</span>
                  <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-slate-700 to-blue-600 transition-all duration-300 rounded-full"></div>
                </div>
              </Link>

              {/* Desktop menu */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="/modeles" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group">
                  Modèles
                  <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300"></div>
                </Link>
                <Link href="#features" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group">
                  Fonctionnalités
                  <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300"></div>
                </Link>
                <Link href="/tarifs" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group">
                  Tarifs
                  <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-blue-600 transition-all duration-300"></div>
                </Link>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110"
                    aria-label="Toggle theme"
                  >
                    {isDark ? (
                      <span className="text-lg">☀️</span>
                    ) : (
                      <span className="text-lg">🌙</span>
                    )}
                  </button>
                  <Link
                    href="/onboarding"
                    className="px-6 py-2.5 bg-gradient-to-r from-slate-700 to-blue-600 text-white font-medium rounded-xl hover:from-slate-800 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
                  >
                    Créer mon CV
                  </Link>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile menu dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <Link href="/modeles" className="block px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                  Modèles
                </Link>
                <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                  Fonctionnalités
                </Link>
                <Link href="/tarifs" className="block px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                  Tarifs
                </Link>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className="w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3"
                  >
                    {isDark ? '☀️ Mode clair' : '🌙 Mode sombre'}
                  </button>
                  <Link href="/editor" className="block px-4 py-2.5 mt-2 text-center bg-gradient-to-r from-slate-700 to-blue-600 text-white font-medium rounded-lg hover:from-slate-800 hover:to-blue-700 transition-all">
                    Créer mon CV
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section professionnelle */}
        <section className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6 border border-blue-100 dark:border-blue-800">
                <span className="text-sm">🏆</span>
                <span>Recommandé par les professionnels du recrutement</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                  Votre CV
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-700 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                  professionnel
                </span>
                <br />
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                  en 5 minutes
                </span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg leading-relaxed">
                Des modèles conçus par des experts RH pour maximiser votre impact auprès des recruteurs.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8">
                <Link
                  href="/onboarding"
                  className="px-8 py-4 bg-gradient-to-r from-slate-800 to-blue-700 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-blue-800 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 text-lg text-center group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Créer mon CV professionnel
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/modeles"
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 font-semibold transition-all duration-300 text-lg text-center hover:shadow-lg"
                >
                  Voir les modèles
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Conforme ATS</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Export PDF haute qualité</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Guidé par l'IA</span>
                </div>
              </div>
            </div>

            {/* Hero Visual professionnel */}
            <div className="relative">
              <div className="relative w-full max-w-2xl mx-auto">
                {/* Main CV Card */}
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-500/10 dark:shadow-black/20 border border-slate-200 dark:border-slate-700 p-8 transform hover:scale-105 transition-transform duration-500">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl text-white">👔</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-6 bg-gradient-to-r from-slate-700 to-blue-600 rounded-lg w-48 mb-3"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-500 to-blue-400 rounded w-32"></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                  </div>

                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-lg">📊</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-slate-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Modèles professionnelle */}
        <section id="modeles" className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                Modèles conçus pour
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-700 to-slate-700 bg-clip-text text-transparent">
                l'excellence
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Des designs éprouvés qui respectent les standards professionnels tout en vous distinguant
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Executive',
                desc: 'Pour cadres et dirigeants',
                color: 'from-slate-500/10 to-slate-400/10',
                badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              },
              {
                name: 'Corporate',
                desc: 'Style entreprise classique',
                color: 'from-blue-500/10 to-slate-500/10',
                badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
              },
              {
                name: 'Moderne',
                desc: 'Contemporain et impactant',
                color: 'from-slate-600/10 to-blue-600/10',
                badge: 'bg-slate-600/10 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
              },
              {
                name: 'Minimaliste',
                desc: 'Épuré et efficace',
                color: 'from-slate-400/10 to-slate-300/10',
                badge: 'bg-slate-400/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
              }
            ].map((template, index) => (
              <Link key={index} href={`/editor?template=${template.name.toLowerCase()}`} className="group">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-blue-500">
                  <div className={`aspect-[3/4] bg-gradient-to-br ${template.color} p-4 relative`}>
                    <div className="absolute inset-3 bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm">
                      <div className="h-3 bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-500 dark:to-slate-400 rounded-lg w-3/4 mb-2"></div>
                      <div className="h-2 bg-gradient-to-r from-slate-300 to-slate-200 dark:from-slate-400 dark:to-slate-300 rounded w-1/2 mb-3"></div>
                      <div className="space-y-1.5">
                        <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded w-5/6"></div>
                        <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded w-4/6"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                      {template.desc}
                    </p>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${template.badge} text-center`}>
                      Professionnel
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/modeles"
              className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 group border border-blue-200 dark:border-blue-800"
            >
              Explorer tous les modèles
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Section Fonctionnalités professionnelle */}
        <section id="features" className="bg-slate-50 dark:bg-slate-900 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                  Outils professionnels
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-700 to-slate-700 bg-clip-text text-transparent">
                  pour votre réussite
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '📊',
                  title: 'Analyse ATS',
                  desc: 'Compatibilité garantie avec les systèmes de tri des recruteurs',
                  color: 'from-blue-500 to-slate-600'
                },
                {
                  icon: '🎯',
                  title: 'Guidage expert',
                  desc: 'Recommandations basées sur les standards du recrutement',
                  color: 'from-slate-600 to-blue-600'
                },
                {
                  icon: '⚡',
                  title: 'Rédaction IA',
                  desc: 'Formulations optimisées pour maximiser votre impact',
                  color: 'from-blue-600 to-slate-700'
                },
                {
                  icon: '📝',
                  title: 'Export professionnel',
                  desc: 'PDF haute résolution et formats standards de l\'industrie',
                  color: 'from-slate-700 to-blue-700'
                },
                {
                  icon: '🔧',
                  title: 'Personnalisation avancée',
                  desc: 'Adaptez chaque détail tout en conservant le professionnalisme',
                  color: 'from-blue-700 to-slate-800'
                },
                {
                  icon: '📱',
                  title: 'Multi-formats',
                  desc: 'Optimisé pour l\'impression, le web et les applications mobiles',
                  color: 'from-slate-800 to-blue-800'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-lg text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section Statistiques */}
        <section className="bg-white dark:bg-slate-800 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { number: '98%', label: 'de compatibilité ATS' },
                { number: '15k+', label: 'CV créés ce mois' },
                { number: '42%', label: 'de taux de réponse' },
                { number: '4.8/5', label: 'satisfaction clients' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section CTA finale professionnelle */}
        <section className="bg-gradient-to-br from-slate-800 via-blue-800 to-slate-900 py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Prêt à booster
              <br />
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                votre carrière ?
              </span>
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez les professionnels qui utilisent CVPro pour décrocher des opportunités d'exception
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/editor"
                className="px-8 py-4 bg-white text-slate-800 font-semibold rounded-xl hover:bg-slate-100 shadow-lg hover:scale-105 transition-all duration-300 text-lg"
              >
                Commencer maintenant
              </Link>
              <Link
                href="/modeles"
                className="px-8 py-4 bg-transparent text-white border-2 border-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 text-lg"
              >
                Voir les exemples
              </Link>
            </div>
          </div>
        </section>

        {/* Footer professionnel */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold text-white">CVPro</span>
                </div>
                <p className="text-slate-400 mb-4 max-w-md text-sm">
                  La plateforme professionnelle de création de CV qui respecte les standards de l'industrie et maximise votre impact.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4 text-sm">PRODUIT</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link href="/modeles" className="hover:text-white transition-colors">Modèles</Link></li>
                  <li><Link href="/tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
                  <li><Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4 text-sm">ENTREPRISE</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-sm">
                © 2025 CVPro – Solutions professionnelles pour votre carrière
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}