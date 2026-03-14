'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function TarifsPage() {
  const [isDark, setIsDark] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const plans = [
    {
      name: 'CVtor Free',
      price: '0',
      currency: 'F CFA',
      period: '/mois',
      description: 'Pour commencer gratuitement',
      features: [
        { text: '1 CV téléchargeable', included: true },
        { text: 'Accès à quelques modèles simples', included: true },
        { text: 'Export PDF limité', included: true },
        { text: 'Tous les modèles premium', included: false },
        { text: 'IA pour rédiger les textes', included: false },
        { text: 'Export DOCX', included: false },
        { text: 'Stockage en ligne', included: false },
      ],
      cta: 'Commencer gratuitement',
      popular: false,
    },
    {
      name: 'CVtor Plus',
      price: '3 000',
      currency: 'F CFA',
      period: '/mois',
      description: 'Pour aller plus loin',
      features: [
        { text: 'CVs illimités', included: true },
        { text: 'Tous les modèles (base + avancés)', included: true },
        { text: 'Export PDF illimité', included: true },
        { text: 'Export DOCX', included: true },
        { text: 'IA pour rédiger les textes (10/mois)', included: true },
        { text: 'Stockage en ligne (5 CVs)', included: true },
        { text: 'Modèles premium exclusifs', included: false },
      ],
      cta: 'Choisir Plus',
      popular: true,
    },
    {
      name: 'CVtor Pro',
      price: '10 000',
      currency: 'F CFA',
      period: '/mois',
      description: 'Accès complet illimité',
      features: [
        { text: 'Tout de CVtor Plus', included: true },
        { text: 'Tous les modèles premium', included: true },
        { text: 'IA illimitée pour rédiger', included: true },
        { text: 'Stockage en ligne illimité', included: true },
        { text: 'Export PNG haute qualité', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'Accès anticipé aux nouvelles fonctionnalités', included: true },
      ],
      cta: 'Choisir Pro',
      popular: false,
    },
  ]

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-[#0f1420] transition-colors">
        {/* Navbar responsive */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f1420]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">CVtor</span>
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                <Link href="/modeles" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Modèles</Link>
                <Link href="/#ia" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">IA</Link>
                <Link href="/tarifs" className="text-indigo-600 dark:text-indigo-400 font-medium">Tarifs</Link>
                <Link href="/#footer" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</Link>
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {isDark ? '🌞' : '🌙'}
                </button>
                <Link href="/editor" className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:from-indigo-700 hover:to-cyan-700 transition-all shadow-lg shadow-indigo-500/30">
                  Créer un CV
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <Link href="/modeles" className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Modèles
                </Link>
                <Link href="/#ia" className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  IA
                </Link>
                <Link href="/tarifs" className="block px-4 py-2 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Tarifs
                </Link>
                <Link href="/#footer" className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  Contact
                </Link>
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className="w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {isDark ? '🌞 Mode clair' : '🌙 Mode sombre'}
                </button>
                <Link href="/editor" className="block px-4 py-2 text-center bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:from-indigo-700 hover:to-cyan-700 transition-all shadow-lg shadow-indigo-500/30">
                  Créer un CV
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="pt-24 pb-12">
          <div className="container mx-auto px-4 sm:px-6">
            {/* En-tête */}
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Choisis ton plan
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Commence gratuitement et passe au niveau supérieur quand tu es prêt
              </p>
            </div>

            {/* Note Stripe */}
            <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💳</div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Configuration Stripe requise</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pour activer les paiements, configure l'intégration Stripe via le blueprint <code className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs">blueprint:javascript_stripe</code>. 
                    Les boutons ci-dessous sont actuellement en mode démo et redirigent vers l'éditeur.
                  </p>
                </div>
              </div>
            </div>

            {/* Grille de tarifs */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300 ${
                    plan.popular
                      ? 'border-indigo-600 dark:border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm font-medium rounded-full">
                        Plus populaire
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                          {plan.price}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 mb-2">
                          {plan.currency}{plan.period}
                        </span>
                      </div>
                    </div>

                    <Link
                      href="/editor"
                      className={`block w-full px-6 py-3 rounded-xl font-medium text-center transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-700 hover:to-cyan-700 shadow-lg shadow-indigo-500/30'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {plan.cta}
                    </Link>

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                            feature.included
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {feature.included ? (
                              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-sm ${
                            feature.included
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-500 line-through'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Section Paiement */}
            <div className="mt-20 text-center">
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Paiement sécurisé
              </h2>
              <div className="flex justify-center items-center gap-8 flex-wrap">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.21 0 1.983.586 2.206 1.57l.005.016.195.045c.29.067.54-.132.596-.426l.002-.01.18-.782c.067-.291-.132-.567-.426-.619l-.015-.002a5.16 5.16 0 00-1.957-.193v-.897c0-.287-.233-.52-.52-.52h-.741c-.287 0-.52.233-.52.52v.916c-1.626.24-2.639 1.403-2.639 2.927 0 1.854 1.425 2.655 3.585 3.458 1.968.73 2.97 1.336 2.97 2.486 0 .922-.755 1.54-1.98 1.54-1.477 0-2.383-.67-2.687-1.986l-.003-.016-.186-.046c-.29-.072-.567.132-.619.426l-.002.01-.193.843c-.067.291.132.567.426.619l.015.002c.624.153 1.347.255 2.145.3v.912c0 .287.233.52.52.52h.741c.287 0 .52-.233.52-.52v-.934c1.778-.27 2.889-1.453 2.889-3.211 0-2.096-1.507-2.99-3.679-3.795z"/>
                  </svg>
                  <span className="font-medium">Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l1.12-7.106c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.225-1.341.055-2.354-.859-3.28z"/>
                  </svg>
                  <span className="font-medium">PayPal</span>
                </div>
              </div>
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
                Paiements 100% sécurisés • Annulation possible à tout moment
              </p>
            </div>

            {/* FAQ */}
            <div className="mt-20 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Questions fréquentes
              </h2>
              <div className="space-y-4">
                <details className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                  <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                    Puis-je changer de plan à tout moment ?
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">
                    Oui, tu peux changer de plan quand tu le souhaites. Le changement est immédiat et ton crédit restant sera reporté.
                  </p>
                </details>
                
                <details className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                  <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                    Comment fonctionne l'IA de rédaction ?
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">
                    L'IA analyse ton profil et génère automatiquement du contenu professionnel adapté à ton secteur d'activité.
                  </p>
                </details>
                
                <details className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                  <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                    Mes données sont-elles sécurisées ?
                  </summary>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">
                    Absolument ! Toutes tes données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais tes informations.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-800 mt-12">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 CVtor – Imaginé par Akemar Service 💡
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
