'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import config from '@/lib/config'
import { useEditorStore } from '@/store/editor'
import TemplatePreview from '@/components/public/TemplatePreview'
import {
  ChevronRight, Sparkles, CheckCircle2, Filter,
  FileText, Mail, Globe, Zap, Shield, ArrowRight, Clock
} from 'lucide-react'

// ─── Metadata statique des templates ────────────────────────────────────────

const SECTOR_ID_MAP: Record<string, string> = {
  'Informatique & Tech': 'tech',
  'Finance & Gestion': 'finance',
  'Santé': 'sante',
  'Marketing & Com': 'marketing',
  'Commerce & Vente': 'commerce',
  'BTP & Ingénierie': 'industrie',
  'Administration': 'autre',
}

const TEMPLATE_META: Record<string, {
  category: 'corporate' | 'tech' | 'creative' | 'minimalist'
  description: string
  tags: string[]
  isAtsFriendly?: boolean
  badge?: string
}> = {
  classique:   { category: 'corporate',   badge: 'Populaire', description: 'Structure traditionnelle et sobre, parfaitement adaptée aux milieux formels.', tags: ['Santé', 'Commerce & Vente', 'Administration', 'Finance & Gestion'], isAtsFriendly: true },
  moderne:     { category: 'tech',         badge: 'Tendance',  description: 'Design épuré et dynamique, idéal pour les métiers du numérique.', tags: ['Informatique & Tech', 'BTP & Ingénierie', 'Digital'], isAtsFriendly: true },
  professional:{ category: 'corporate',   description: 'Équilibre parfait entre modernité et sérieux pour cadres et managers.', tags: ['Commerce & Vente', 'Management', 'Marketing & Com'], isAtsFriendly: true },
  tokyo:       { category: 'minimalist',  description: 'Minimalisme radical pour une lisibilité maximale et un impact direct.', tags: ['Informatique & Tech', 'Marketing & Com', 'Freelance'], isAtsFriendly: true },
  creatif:     { category: 'creative',    badge: 'Original',   description: 'Mise en page audacieuse pour valoriser originalité et portfolio.', tags: ['Marketing & Com', 'Design & Créatif', 'Arts'] },
  rodrigue:    { category: 'corporate',   badge: 'Premium',    description: 'Élégance premium avec une touche de luxe pour les hautes fonctions.', tags: ['Management', 'Luxe', 'Direction'] },
  abidjan:     { category: 'minimalist',  description: 'Un classique robuste, conçu pour la clarté et l\'efficacité.', tags: ['Social', 'Santé', 'Administration'], isAtsFriendly: true },
  dakar:       { category: 'minimalist',  description: 'Structure aérée et moderne, polyvalente pour tous types de profils.', tags: ['BTP & Ingénierie', 'Enseignement', 'Polyvalent'], isAtsFriendly: true },
}

const FILTERS = [
  { id: 'all',          label: 'Tous',                   icon: Filter },
  { id: 'cv',           label: 'CV',                     icon: FileText },
  { id: 'cover_letter', label: 'Lettre de motivation',   icon: Mail },
  { id: 'public_page',  label: 'Page publique',          icon: Globe },
]

const PREVIEW_DATA = {
  profile: { name: 'Jean Dupont', title: 'Responsable Commercial', email: 'jean.dupont@email.com', phone: '+225 07 00 00 00', location: 'Abidjan, Côte d\'Ivoire', photo: '' },
  summary: 'Professionnel dynamique avec plus de 8 ans d\'expérience dans le développement commercial.',
  experience: [{ role: 'Directeur Commercial', company: 'Global Trade', period: '2019 - Présent', bullets: ['Augmentation du CA de 40% en 2 ans.', 'Gestion d\'une équipe de 10 personnes.'] }],
  education: [{ degree: 'Master en Gestion', institution: 'INP-HB', period: '2012 - 2014', description: 'Major de promotion.' }],
  skills: { groups: [{ label: 'Expertise', items: ['Négociation', 'Stratégie', 'Vente'] }] },
  languages: [{ name: 'Français', level: 'Natif' }, { name: 'Anglais', level: 'Avancé' }],
}

// ─── Template Card ───────────────────────────────────────────────────────────

function TemplateCard({ template, onSelect, selectedSector, previewData, index }: {
  template: any
  onSelect: (t: any) => void
  selectedSector?: string
  previewData?: any
  index: number
}) {
  const meta = TEMPLATE_META[template.slug] || { tags: [] }
  const isRecommended = selectedSector && meta.tags?.includes(selectedSector)
  const isFree = !template.price || parseFloat(template.price) === 0

  return (
    <div
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-200/60 hover:border-indigo-400/50 hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)] hover:-translate-y-2 transition-all duration-500 cursor-pointer"
      onClick={() => onSelect(template)}
      style={{ animationDelay: `${index * 0.07}s` }}
    >

      {/* Aperçu pleine hauteur — pas de footer texte */}
      <div className="relative aspect-[1/1.414] overflow-hidden bg-gray-50/50">
        <TemplatePreview template={template} data={previewData} sector={selectedSector} />

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-10 gap-3">
          <div className="px-7 py-3 bg-white text-gray-900 text-sm font-extrabold rounded-xl shadow-2xl transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
            Utiliser ce modèle
          </div>
          <p className="text-white/75 text-xs font-medium translate-y-3 group-hover:translate-y-0 transition-all duration-400 delay-75">
            CV prêt en 2 minutes
          </p>
        </div>
      </div>
    </div>
  )
}


// ─── Main Content ────────────────────────────────────────────────────────────

function ModelesPageContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setOnboardingData, onboardingData } = useEditorStore()

  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'cv' | 'cover_letter' | 'public_page'>('all')
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [namePreview, setNamePreview] = useState(onboardingData.namePreview || '')
  const [sectors, setSectors] = useState<string[]>([])
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [personaContent, setPersonaContent] = useState<any>(null)

  // Sync sector from URL
  useEffect(() => {
    const urlSectorId = searchParams.get('sector')
    if (urlSectorId && sectors.length > 0) {
      const matched = sectors.find(s => SECTOR_ID_MAP[s] === urlSectorId)
      if (matched) setSelectedSector(matched)
    }
  }, [sectors, searchParams])

  useEffect(() => {
    if (selectedSector) setOnboardingData({ sector: SECTOR_ID_MAP[selectedSector] || 'tech' })
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
    fetch(`${config.apiBaseUrl}/personas/content?sector=${encodeURIComponent(selectedSector)}&experience=${onboardingData.experience || 'junior'}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPersonaContent(data.content_json) })
  }, [selectedSector, onboardingData.experience])

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/templates`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { setTemplates(data); setIsLoading(false) })
      .catch(() => setIsLoading(false))
  }, [])

  useEffect(() => { setOnboardingData({ namePreview }) }, [namePreview, setOnboardingData])

  const handleSelect = async (template: any) => {
    const def = template.definition || {}
    const sectorId = SECTOR_ID_MAP[selectedSector] || 'tech'
    const hasExistingData = typeof window !== 'undefined' && (
      Boolean(localStorage.getItem('cvtor_cv_data')) ||
      Boolean(localStorage.getItem('cvtor_profile'))
    )
    if (hasExistingData) { router.push(`/editor?template=${template.slug}`); return }
    const params = new URLSearchParams({
      step: 'method', template: template.slug, sector: sectorId,
      primary: def.tokens?.colorPrimary || def.colors?.primary || '#2563eb',
      accent: def.tokens?.colorAccent || def.colors?.accent || '#f59e0b',
      fontHeading: def.tokens?.fontHeading || def.fonts?.heading || 'Marcellus',
      fontBody: def.tokens?.fontBody || def.fonts?.body || 'Outfit',
    })
    router.push(`/onboarding?${params.toString()}`)
  }

  const filtered = templates.filter(t => {
    // Filtre par type de document (champ template_type du backend)
    if (filter !== 'all') {
      const ttype = t.template_type || 'cv'
      if (filter === 'cover_letter' && ttype !== 'cover_letter' && ttype !== 'both') return false
      if (filter === 'cv' && ttype !== 'cv' && ttype !== 'both') return false
      if (filter === 'public_page' && ttype !== 'public_page') return false
    }
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

  const previewData = normalizeData({
    ...(personaContent || PREVIEW_DATA),
    profile: {
      ...(personaContent?.profile || PREVIEW_DATA.profile),
      name: namePreview || personaContent?.profile?.name || PREVIEW_DATA.profile.name
    }
  })

  const freeCount = templates.filter(t => !t.price || parseFloat(t.price) === 0).length

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-indigo-200">

      {/* ── HERO ── */}
      <section className="relative pt-24 pb-16 overflow-hidden border-b border-gray-100">
        {/* Grid background (same as homepage) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-indigo-50 rounded-[100%] blur-3xl opacity-60 -z-0" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
         

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
           

              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-5">
                Votre profil.{' '}
                <span className="text-indigo-600">Plusieurs présentations.</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed font-medium">
                Un Profil Master, des dizaines de façons de le présenter. Choisissez le modèle adapté à votre prochain objectif.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { icon: Shield, label: 'Tous optimisés ATS', color: 'text-indigo-600' },
                  { icon: Clock, label: 'Prêt en 2 minutes', color: 'text-amber-600' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
              >
                Créer mon profil gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Interactive Preview Config */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Personnalisez l'aperçu</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-0.5">
                    Votre nom sur le CV
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Jean Dupont"
                    value={namePreview}
                    onChange={e => setNamePreview(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-0.5">
                    Votre secteur
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSector}
                      onChange={e => setSelectedSector(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all text-sm font-medium appearance-none cursor-pointer"
                    >
                      {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                {selectedSector && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <p className="text-xs text-indigo-700 font-semibold">
                      Les modèles recommandés pour <strong>{selectedSector}</strong> sont mis en avant.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Category filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            {FILTERS.map(f => {
              const Icon = f.icon
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap border transition-all ${
                    filter === f.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              )
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`relative w-9 h-5 rounded-full transition-colors ${showFreeOnly ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showFreeOnly ? 'translate-x-4' : ''}`} />
              </div>
              <input type="checkbox" className="sr-only" checked={showFreeOnly} onChange={e => setShowFreeOnly(e.target.checked)} />
              <span className="text-xs font-bold text-gray-600 group-hover:text-emerald-600 transition-colors">Gratuits seulement</span>
            </label>
            <span className="text-[11px] font-extrabold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 whitespace-nowrap">
              {filtered.length} modèle{filtered.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── TEMPLATE GRID ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[1/1.414] bg-gray-100" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-50 rounded w-full" />
                  <div className="h-3 bg-gray-50 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Filter className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun modèle trouvé</h3>
            <p className="text-sm text-gray-400 mb-6">Essayez de modifier les filtres.</p>
            <button
              onClick={() => { setFilter('all'); setShowFreeOnly(false) }}
              className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((t, i) => (
              <TemplateCard
                key={t.id}
                template={t}
                onSelect={handleSelect}
                selectedSector={selectedSector}
                previewData={previewData}
                index={i}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── ATS CALLOUT SECTION ── */}
      <section className="bg-gray-50 border-t border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                color: 'bg-indigo-100 text-indigo-600',
                title: 'Optimisés ATS',
                desc: 'Nos modèles passent les filtres automatiques des entreprises Fortune 500 et des grandes multinationales africaines.',
              },
              {
                icon: Sparkles,
                color: 'bg-purple-100 text-purple-600',
                title: 'IA Intégrée',
                desc: 'Avec carriey PRO, l\'IA adapte automatiquement votre profil à chaque opportunité en ciblant les mots-clés.',
              },
              {
                icon: Zap,
                color: 'bg-amber-100 text-amber-600',
                title: 'Export instantané',
                desc: 'Téléchargez vos documents en PDF haute définition ou partagez votre lien public en un seul clic.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white border border-gray-200/60 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="relative py-20 overflow-hidden bg-white border-t border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-50 rounded-[100%] blur-3xl opacity-60" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-5">
            Prêt à décrocher votre prochain poste ?
          </h2>
          <p className="text-lg text-gray-600 mb-8 font-medium leading-relaxed">
            Rejoignez des milliers de professionnels qui utilisent carriey pour construire leur carrière.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              Créer mon profil gratuitement <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-base font-bold border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              Voir les tarifs PRO
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ModelesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Chargement des modèles...</p>
        </div>
      </div>
    }>
      <ModelesPageContent />
    </Suspense>
  )
}