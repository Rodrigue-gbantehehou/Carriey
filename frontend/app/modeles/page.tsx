'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import config from '@/lib/config'
import { useEditorStore } from '@/store/editor'
import Navbar from '@/components/layout/Navbar'
import TemplatePreview from '@/components/layout/TemplatePreview'

// Palette par défaut pour l'aperçu
const DEFAULT_PALETTE = { primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b' }

const SECTOR_ID_MAP: Record<string, string> = {
  'Informatique & Tech': 'tech',
  'Finance & Gestion': 'finance',
  'Santé': 'sante',
  'Marketing & Com': 'marketing',
  'Commerce & Vente': 'commerce',
  'BTP & Ingénierie': 'industrie',
  'Administration': 'autre',
}

const TEMPLATE_META: Record<string, { category: 'corporate' | 'tech' | 'creative' | 'minimalist'; description: string; tags: string[]; isAtsFriendly?: boolean }> = {
  classique: { 
    category: 'corporate', 
    description: 'Structure traditionnelle et sobre, parfaitement adaptée aux milieux formels.',
    tags: ['Santé', 'Commerce & Vente', 'Administration', 'Finance & Gestion', 'Juridique & Droit'],
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
    tags: ['Informatique & Tech', 'Marketing & Com', 'Freelance', 'Design & Créatif'],
    isAtsFriendly: true
  },
  creatif: { 
    category: 'creative', 
    description: 'Mise en page audacieuse pour valoriser l\'originalité et le portfolio.',
    tags: ['Marketing & Com', 'Design & Créatif', 'Arts', 'Mode'],
    isAtsFriendly: false
  },
  rodrigue: { 
    category: 'corporate', 
    description: 'Élégance premium avec une touche de luxe pour les hautes fonctions.',
    tags: ['Management', 'Luxe', 'Direction', 'Finance & Gestion'],
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
  experience: [{ role: 'Directeur Commercial', company: 'Global Trade', period: '2019 - Présent', bullets: ['Augmentation du CA de 40% en 2 ans.', 'Gestion d\'une équipe de 10 personnes.'] }],
  education: [{ degree: 'Master en Gestion', institution: 'INP-HB', period: '2012 - 2014', description: 'Major de promotion.' }],
  skills: { groups: [{ label: 'Expertise', items: ['Négociation', 'Stratégie', 'Vente'] }] },
  languages: [{ name: 'Français', level: 'Natif' }, { name: 'Anglais', level: 'Avancé' }],
}

function TemplateCard({ template, onSelect, selectedSector, previewData }: { template: any; onSelect: (t: any) => void; selectedSector?: string; previewData?: any }) {
  const meta = TEMPLATE_META[template.slug] || DEFAULT_META
  const isRecommended = selectedSector && meta.tags?.includes(selectedSector)

  return (
    <div 
      className={`group bg-white border ${isRecommended ? 'border-brand-cta ring-4 ring-brand-cta/5' : 'border-gray-100 hover:border-brand-cta/30'} rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative cursor-pointer`}
      onClick={() => onSelect(template)}
    >
      {isRecommended && (
        <div className="absolute top-4 right-4 z-20 bg-brand-cta text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
          RECOMMANDÉ
        </div>
      )}
      <div className="relative aspect-[1/1.414] overflow-hidden bg-gray-50/50">
        <TemplatePreview 
          template={template} 
          data={previewData}
          sector={selectedSector}
        />

        {/* Overlay Hover */}
        <div className="absolute inset-0 bg-brand-text/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center z-10">
          <div
            className="px-8 py-3.5 bg-brand-cta text-white text-sm font-black rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-105 active:scale-95"
          >
            Utiliser ce modèle
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ModelesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setOnboardingData, onboardingData } = useEditorStore()

  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'corporate' | 'tech' | 'creative' | 'minimalist'>('all')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [namePreview, setNamePreview] = useState(onboardingData.namePreview || '')
  const [sectors, setSectors] = useState<string[]>([])
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [personaContent, setPersonaContent] = useState<any>(null)

  // ── Sync Sector from URL ──
  useEffect(() => {
    const urlSectorId = searchParams.get('sector')
    if (urlSectorId && sectors.length > 0) {
      const matched = sectors.find(s => SECTOR_ID_MAP[s] === urlSectorId)
      if (matched) setSelectedSector(matched)
    }
  }, [sectors, searchParams])

  // ── Sync Editor Store when sector changes ──
  useEffect(() => {
    if (selectedSector) {
      const sectorId = SECTOR_ID_MAP[selectedSector] || 'tech'
      setOnboardingData({ sector: sectorId })
    }
  }, [selectedSector, setOnboardingData])

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/personas/sectors`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setSectors(data)
        if (data.length > 0 && !selectedSector) {
           const urlSectorId = searchParams.get('sector')
           const matched = data.find((s: string) => SECTOR_ID_MAP[s] === urlSectorId)
           setSelectedSector(matched || data[0])
        }
      })
  }, [searchParams, selectedSector])

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
  }, [namePreview, setOnboardingData])

  const handleSelect = async (template: any) => {
    const def = template.definition || {}
    const sectorId = SECTOR_ID_MAP[selectedSector] || 'tech'
    
    const params = new URLSearchParams({
      step: 'method',
      template: template.slug,
      sector: sectorId,
      primary: def.tokens?.colorPrimary || def.colors?.primary || DEFAULT_PALETTE.primary,
      accent: def.tokens?.colorAccent || def.colors?.accent || DEFAULT_PALETTE.accent,
      fontHeading: def.tokens?.fontHeading || def.fonts?.heading || 'Marcellus',
      fontBody: def.tokens?.fontBody || def.fonts?.body || 'Outfit',
    })
    router.push(`/onboarding?${params.toString()}`)
  }

  const filtered = templates.filter(t => {
    const meta = TEMPLATE_META[t.slug]
    if (filter !== 'all' && meta?.category !== filter) return false
    if (showFreeOnly && parseFloat(t.price) !== 0) return false
    return true
  })

  const normalizeData = (d: any) => {
    if (!d) return d
    return {
      ...d,
      experience: d.experience?.map((e: any) => ({ ...e, dates: e.period || e.dates, role: e.role || e.position })),
      education: d.education?.map((e: any) => ({ ...e, dates: e.period || e.dates, year: e.period || e.year, school: e.institution || e.school })),
      interests: d.interests || d.loisirs || []
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />

      {/* ── Entête Responsive ── */}
      <header className="bg-white border-b border-gray-100 py-12 sm:py-20 relative overflow-hidden">
        {/* Background Decorative patterns */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-cta/5 skew-x-12 translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brand-text tracking-tight leading-[1.1]">
              Choisissez votre <span className="text-brand-cta">modèle</span> idéal
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-brand-muted font-medium max-w-2xl">
              Des CV conçus par des experts en recrutement avec des designs haute performance pour propulser votre carrière.
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
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Secteur d&apos;activité</label>
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
                { id: 'corporate', label: 'Corporate' },
                { id: 'tech', label: 'Tech' },
                { id: 'creative', label: 'Créatif' },
                { id: 'minimalist', label: 'Minimaliste' }
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
          
          <div className="flex items-center justify-end w-full lg:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
              {filtered.length} Modèles disponibles
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
                selectedSector={selectedSector}
                previewData={normalizeData({
                  ...(personaContent || PREVIEW_DATA),
                  profile: {
                    ...(personaContent?.profile || PREVIEW_DATA.profile),
                    name: namePreview || personaContent?.profile?.name || PREVIEW_DATA.profile.name
                  }
                })}
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