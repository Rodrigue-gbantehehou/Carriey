'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import config from '@/lib/config'
import { useEditorStore } from '@/store/editor'

// Palette par défaut pour l'aperçu
const DEFAULT_PALETTE = { primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b' }

// Métadonnées simplifiées pour une meilleure lisibilité
const TEMPLATE_META: Record<string, { category: 'corporate' | 'tech' | 'creative' | 'minimalist'; description: string; tags: string[]; isAtsFriendly?: boolean }> = {
  classique: { 
    category: 'corporate', 
    description: 'Structure traditionnelle et sobre, parfaitement adaptée aux milieux formels.',
    tags: ['Santé', 'Commerce & Vente', 'Administration', 'Finance', 'Droit'],
    isAtsFriendly: true 
  },
  moderne: { 
    category: 'tech', 
    description: 'Design épuré et dynamique, idéal pour les métiers du numérique et l\'innovation.',
    tags: ['Informatique & Tech', 'BTP & Ingénierie', 'Digital'],
    isAtsFriendly: true
  },
  professional: { 
    category: 'corporate', 
    description: 'Équilibre parfait entre modernité et sérieux pour les cadres et managers.',
    tags: ['Commerce & Vente', 'Management', 'Marketing & Com', 'Audit'],
    isAtsFriendly: true
  },
  tokyo: { 
    category: 'minimalist', 
    description: 'Minimalisme radical pour une lisibilité maximale et un impact direct.',
    tags: ['Informatique & Tech', 'Marketing & Com', 'Freelance', 'Design'],
    isAtsFriendly: true
  },
  creatif: { 
    category: 'creative', 
    description: 'Mise en page audacieuse pour valoriser l\'originalité et le portfolio.',
    tags: ['Marketing & Com', 'Design', 'Arts', 'Mode'],
    isAtsFriendly: false
  },
  rodrigue: { 
    category: 'corporate', 
    description: 'Élégance premium avec une touche de luxe pour les hautes fonctions.',
    tags: ['Management', 'Luxe', 'Direction', 'Finance'],
    isAtsFriendly: false
  },
  abidjan: {
    category: 'minimalist',
    description: 'Un classique local robuste, conçu pour la clarté et l\'efficacité.',
    tags: ['Social', 'Santé', 'Administration', 'Polyvalent'],
    isAtsFriendly: true
  },
  dakar: {
    category: 'minimalist',
    description: 'Structure aérée et moderne, polyvalente pour tous types de profils.',
    tags: ['BTP & Ingénierie', 'Enseignement', 'Polyvalent'],
    isAtsFriendly: true
  }
}

const CATEGORY_LABELS = {
  corporate: { label: '🏢 Corporate', description: 'Finance, Droit, Management' },
  tech: { label: '🚀 Tech', description: 'IT, Ingénierie, Startups' },
  creative: { label: '✨ Créatif', description: 'Design, Marketing, Art' },
  minimalist: { label: '🌿 Minimaliste', description: 'Polyvalent, Épuré' }
}

const DEFAULT_META = { category: 'Standard', description: 'Modèle de CV polyvalent et efficace.' }

const PREVIEW_DATA = {
  profile: { name: 'Jean Dupont', title: 'Responsable Commercial', email: 'jean.dupont@email.com', phone: '+225 07 00 00 00', location: 'Abidjan, Côte d\'Ivoire', photo: '' },
  summary: 'Professionnel dynamique avec plus de 8 ans d\'expérience dans le développement commercial et la gestion d\'équipes.',
  experience: [{ position: 'Directeur Commercial', company: 'Global Trade', period: '2019 - Présent', tasks: ['Augmentation du CA de 40% en 2 ans.', 'Gestion d\'une équipe de 10 personnes.'] }],
  education: [{ degree: 'Master en Gestion', school: 'INP-HB', period: '2012 - 2014', description: 'Major de promotion.' }],
  skills: { groups: [{ label: 'Expertise', items: ['Négociation', 'Stratégie', 'Vente'] }] },
  languages: [{ name: 'Français', level: 'Natif' }, { name: 'Anglais', level: 'Avancé' }],
}

function TemplateCard({ template, onSelect, namePreview, personaData, selectedSector }: { template: any; onSelect: (t: any) => void; namePreview?: string; personaData?: any; selectedSector?: string }) {
  const meta = TEMPLATE_META[template.slug] || DEFAULT_META
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [scale, setScale] = useState(0.38)
  const isFree = parseFloat(template.price) === 0
  
  // Ref pour calculer l'échelle dynamique
  const containerRef = (node: HTMLDivElement | null) => {
    if (node) {
      const updateScale = () => {
        const width = node.offsetWidth
        // 210mm est environ 794px à 96dpi
        const newScale = width / 793.7
        setScale(newScale)
      }
      updateScale()
      const ro = new ResizeObserver(updateScale)
      ro.observe(node)
    }
  }

  useEffect(() => {
    const fetchPreview = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${config.apiBaseUrl}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_name: template.slug,
            data: {
              ...(personaData || PREVIEW_DATA),
              profile: {
                ...(personaData?.profile || PREVIEW_DATA.profile),
                name: namePreview || personaData?.profile?.name || PREVIEW_DATA.profile.name
              },
            },
            config: { colors: DEFAULT_PALETTE, is_thumbnail: true }
          })
        })
        if (res.ok) {
          const result = await res.json()
          setPreviewHtml(result.html || '')
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    const timer = setTimeout(fetchPreview, 100)
    return () => clearTimeout(timer)
  }, [template.slug, namePreview, personaData])

  const isRecommended = selectedSector && meta.tags?.includes(selectedSector)

  return (
    <div 
      className={`group bg-white border ${isRecommended ? 'border-amber-200 ring-2 ring-amber-100 shadow-md' : 'border-gray-200 hover:border-indigo-300'} rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full relative cursor-pointer`}
      onClick={() => onSelect(template)}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0 z-20">
          <div className="bg-amber-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-bl-xl shadow-sm uppercase tracking-wider flex items-center gap-1 transition-opacity duration-300 group-hover:opacity-0">
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            Recommandé
          </div>
        </div>
      )}
      <div className="relative aspect-[3/4.2] flex items-center justify-center overflow-hidden bg-white">
        {previewHtml ? (
          <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-white">
            <iframe
              srcDoc={previewHtml}
              className="absolute top-0 left-0 border-0 pointer-events-none origin-top-left transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              style={{
                transform: `scale(${scale})`,
                width: `${100 / scale}%`,
                height: `${100 / scale}%`,
                opacity: isLoading ? 0.5 : 1,
                overflow: 'hidden'
              }}
              scrolling="no"
              title={`Aperçu ${template.name}`}
            />
          </div>
        ) : (
          <div className="text-gray-300 italic text-xs px-4 text-center">
            {isLoading ? 'Chargement...' : 'Aperçu non disponible'}
          </div>
        )}

        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-orange-900/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-10">
            <button
                onClick={(e) => { e.stopPropagation(); onSelect(template); }}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
            >
                Choisir ce modèle
            </button>
        </div>


      </div>
    </div>
  )
}

export default function ModelesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setOnboardingData, onboardingData } = useEditorStore()

  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'corporate' | 'tech' | 'creative' | 'minimalist'>('all')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [namePreview, setNamePreview] = useState(onboardingData.namePreview || '')
  const [sectors, setSectors] = useState<string[]>([])
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [personaContent, setPersonaContent] = useState<any>(null)

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/personas/sectors`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setSectors(data)
        if (data.length > 0) setSelectedSector(data[0])
      })
  }, [])

  useEffect(() => {
    if (!selectedSector) return
    const level = onboardingData.experience || 'junior'
    fetch(`${config.apiBaseUrl}/personas/content?sector=${encodeURIComponent(selectedSector)}&experience=${level}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPersonaContent(data.content_json) })
  }, [selectedSector, onboardingData.experience])

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/templates`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTemplates(data); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    setOnboardingData({ namePreview })
  }, [namePreview])

  const handleSelect = async (template: any) => {
    const isFree = parseFloat(template.price) === 0
    if (!isFree && !session) {
      router.push(`/login?callbackUrl=/modeles`)
      return
    }
    const params = new URLSearchParams({
      step: 'method',
      template: template.slug,
      primary: DEFAULT_PALETTE.primary,
      accent: DEFAULT_PALETTE.accent,
    })
    router.push(`/onboarding?${params.toString()}`)
  }

  const filtered = templates.filter(t => {
    const meta = TEMPLATE_META[t.slug]
    if (filter !== 'all' && meta?.category !== filter) return false
    if (showFreeOnly && parseFloat(t.price) !== 0) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Navigation Responsive ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-orange-600 tracking-tight">
            CVtor
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/modeles" className="text-xs sm:text-sm font-medium text-orange-600">Modèles</Link>
            <Link href="/tarifs" className="hidden xs:block text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900">Tarifs</Link>
            {session ? (
              <Link href="/editor" className="text-xs sm:text-sm font-medium text-gray-900 border-l border-gray-200 pl-4 sm:pl-6">Espace</Link>
            ) : (
              <Link href="/login" className="text-xs sm:text-sm font-bold text-orange-600">Connexion</Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Entête Responsive ── */}
      <header className="bg-white border-b border-gray-200 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Choisissez votre modèle
            </h1>
            <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-gray-500">
              Des designs professionnels personnalisables en quelques secondes.
            </p>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Aperçu avec votre nom</label>
              <input
                type="text"
                placeholder="ex: Jean Dupont"
                value={namePreview}
                onChange={e => setNamePreview(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Secteur d'activité</label>
              <div className="relative">
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                >
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Galerie Responsive ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 border-b border-gray-200 pb-6 gap-6">
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Filtrer par style</span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'corporate', label: '🏢 Corporate' },
                { id: 'tech', label: '🚀 Tech' },
                { id: 'creative', label: '✨ Créatif' },
                { id: 'minimalist', label: '🌿 Minimaliste' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-5 py-2.5 text-[10px] sm:text-xs font-bold rounded-xl transition-all whitespace-nowrap border ${filter === f.id ? 'bg-orange-600 text-white border-orange-600 shadow-md scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className="text-xs font-bold text-gray-500 group-hover:text-orange-600 transition-colors">Gratuits uniquement</span>
              <div 
                onClick={() => setShowFreeOnly(!showFreeOnly)}
                className={`relative w-10 h-5 rounded-full transition-colors ${showFreeOnly ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${showFreeOnly ? 'translate-x-5' : ''}`} />
              </div>
            </label>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              {filtered.length} MODÈLES
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl aspect-[3/4.5] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filtered.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                onSelect={handleSelect}
                namePreview={namePreview}
                personaData={personaContent}
                selectedSector={selectedSector}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">CVtor — Performance Architect</p>
        </div>
      </footer>
    </div>
  )
}