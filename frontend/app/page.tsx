'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTemplates } from '@/lib/api'
import Link from 'next/link'
import TemplatePreview from '@/components/layout/TemplatePreview'

export default function Home() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getTemplates()
        setTemplates(data)
      } catch (error) {
        console.error('Failed to fetch templates:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-cta selection:text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cta/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
          
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-brand-text mb-8 tracking-tighter leading-[0.9] animate-slide-up">
              Créez un CV qui <br />
              <span className="text-brand-cta relative">
                propulse
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-brand-cta/20 -z-10" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C60 2 140 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span> votre futur.
            </h1>
            
            <p className="text-lg sm:text-xl text-brand-muted mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-slide-up delay-100">
              Transformez votre parcours en une candidature irrésistible avec nos modèles haute fidélité conçus par des experts.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center animate-slide-up delay-200">
            <Link
              href="/onboarding?step=experience"
              className="px-8 py-5 bg-brand-text text-white font-black rounded-full hover:bg-black shadow-2xl shadow-black/10 hover:scale-105 transition-all text-lg group text-center"
            >
              Créer mon CV – <span className="text-brand-cta font-black">C&apos;est Gratuit</span>
            </Link>
              <Link
                href="#modeles"
                className="px-8 py-5 bg-white text-brand-text font-bold rounded-full border border-gray-200 hover:bg-gray-50 transition-all text-lg"
              >
                Voir les modèles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Marquee Section */}
      <section className="py-10 bg-white border-y border-gray-50 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-8 py-4">
          {[...templates, ...templates, ...templates].map((template, idx) => (
            <div key={idx} className="w-[200px] sm:w-[280px] flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105">
              <div className="aspect-[1/1.414] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden relative group">
                <TemplatePreview template={template} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section Modèles professionnelle */}
      <section id="modeles" className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-brand-text mb-4 tracking-tight">
            Choisissez votre <span className="text-brand-cta">style de réussite</span>
          </h2>
          <p className="text-lg text-brand-muted max-w-xl mx-auto font-medium">
            Des designs professionnels conçus pour franchir les barrages des recruteurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-[400px]"></div>
            ))
          ) : templates.length > 0 ? (
            templates.map((template, index) => (
              <Link key={template.id || index} href={`/editor?template=${template.slug}`} className="group">
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:border-brand-cta/50 hover:-translate-y-1">
                  <div className="relative aspect-[1/1.414] overflow-hidden bg-gray-50/50">
                    <TemplatePreview template={template} />
                    <div className="absolute inset-0 bg-brand-text/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center z-10">
                      <div className="px-8 py-3 bg-brand-cta text-white text-sm font-black rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-105 active:scale-95">
                        Utiliser ce modèle
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-brand-muted">
              Aucun modèle disponible pour le moment.
            </div>
          )}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/modeles"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-text font-bold rounded-full border border-gray-200 hover:bg-gray-50 transition-all hover:shadow-md group"
          >
            Explorer tous les modèles
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform text-brand-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Section Paiements Africains */}
      <section className="py-12 sm:py-20 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
            
            <h2 className="text-3xl sm:text-5xl font-black text-brand-text mb-6 tracking-tight">
              Payer est devenu <span className="text-brand-cta italic">simple</span>.
            </h2>
            <p className="text-lg text-brand-muted max-w-2xl font-medium mb-16">
              Pas besoin de carte bancaire internationale. Nous supportons vos moyens de paiement locaux préférés pour un accès instantané à votre avenir.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#FF6600] rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg">OM</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Orange Money</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#FFCC00] rounded-2xl flex items-center justify-center text-black font-black text-xs shadow-lg">MTN</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">MTN Mobile</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#1BADE4] rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg">W</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Wave</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-[#00AEEF] rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg">Moov</div>
                <span className="text-[10px] font-bold text-brand-text uppercase tracking-widest">Moov Money</span>
              </div>
            </div>

           
          </div>
        </div>
      </section>

      {/* Section Comment ça marche - Refonte Elite */}
      <section className="py-16 sm:py-24 bg-brand-bg relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[10%] right-[-10%] w-[30%] h-[30%] bg-brand-cta/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <div className="order-2 lg:order-1">
              <div className="inline-block px-4 py-1.5 bg-brand-text text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-8">
                Parcours Utilisateur
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-brand-text tracking-tighter leading-[0.9] mb-16">
                Votre carrière mérite <br />
                <span className="text-brand-cta">l&apos;excellence.</span>
              </h2>
              
              <div className="relative space-y-16">
                {/* Vertical Timeline Line */}
                <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-cta via-brand-cta/30 to-transparent hidden sm:block"></div>

                {[
                  { step: '01', title: 'Choisissez un design élite', desc: 'Accédez à notre bibliothèque de modèles conçus par des DRH pour briller dès le premier regard.' },
                  { step: '02', title: 'Optimisez votre contenu', desc: 'Laissez notre interface intelligente vous suggérer les mots-clés qui feront mouche auprès des ATS.' },
                  { step: '03', title: 'Propulsez votre candidature', desc: 'Téléchargez un PDF parfait en un clic et démarquez-vous instantanément de la masse.' }
                ].map((item, idx) => (
                  <div key={idx} className="relative flex flex-col sm:flex-row gap-8 items-start group">
                    <div className="relative z-10 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-text font-black text-xl shadow-xl border border-gray-100 group-hover:bg-brand-cta group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      {item.step}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-bold text-brand-text mb-4 transition-colors group-hover:text-brand-cta">{item.title}</h3>
                      <p className="text-brand-muted font-medium leading-relaxed max-w-md">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              {/* Floating accents */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-cta opacity-20 blur-3xl rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500 opacity-10 blur-3xl rounded-full"></div>
              
              <div className="relative z-10 bg-white  rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]  border-gray-100 transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="aspect-[1/1.414] overflow-hidden rounded-[20px] border border-gray-50 bg-gray-50/30 relative">
                  <TemplatePreview template={templates[1]} />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités professionnelle */}
      <section id="features" className="bg-white py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-brand-text mb-4 tracking-tight">
              Conçu pour la <span className="text-brand-cta">performance</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '📊', title: 'Analyse ATS', desc: 'Compatibilité garantie avec les systèmes de tri des recruteurs' },
              { icon: '🎯', title: 'Guidage expert', desc: 'Recommandations basées sur les standards du recrutement' },
              { icon: '⚡', title: 'Rédaction IA', desc: 'Formulations optimisées pour maximiser votre impact' },
              { icon: '📝', title: 'Export professionnel', desc: 'PDF haute résolution et formats standards de l&apos;industrie' },
              { icon: '🔧', title: 'Personnalisation avancée', desc: 'Adaptez chaque détail tout en conservant le professionnalisme' },
              { icon: '📱', title: 'Multi-formats', desc: 'Optimisé pour l&apos;impression, le web et les applications mobiles' }
            ].map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl bg-brand-bg hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-brand-cta/30">
              
                <h3 className="font-bold text-brand-text text-xl mb-3">{feature.title}</h3>
                <p className="text-brand-muted font-medium text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Statistiques */}
      <section className="bg-white py-12 sm:py-16 border-t border-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { number: '98%', label: 'de compatibilité ATS' },
              { number: '15k+', label: 'CV créés ce mois' },
              { number: '42%', label: 'de taux de réponse' },
              { number: '4.8/5', label: 'satisfaction clients' }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl font-black text-brand-cta mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
                <div className="text-xs font-bold text-brand-muted uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA finale professionnelle */}
      <section className="bg-brand-text py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-5xl font-black text-white mb-10 tracking-tight">
            Démarrez votre <span className="text-brand-cta">succès</span> dès aujourd'hui.
          </h2>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/onboarding?step=experience"
              className="px-10 py-5 bg-brand-cta text-white font-bold rounded-full hover:bg-brand-cta-hover shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all text-lg text-center"
            >
              Créer mon CV maintenant
            </Link>
            <Link
              href="/modeles"
              className="px-10 py-5 bg-transparent text-white border-2 border-white/20 font-bold rounded-full hover:bg-white/5 transition-all text-lg text-center"
            >
              Voir les modèles
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}