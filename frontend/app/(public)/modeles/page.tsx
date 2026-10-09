'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import config from '@/lib/config'
import { useEditorStore } from '@/store/editor'
import TemplatePreview from '@/components/public/TemplatePreview'
import { PageContainer } from '@/components/ui/PageContainer'
import { Button } from '@/components/ui/Button'
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
  classique: { category: 'corporate', badge: 'Populaire', description: 'Structure traditionnelle et sobre, parfaitement adaptée aux milieux formels.', tags: ['Santé', 'Commerce & Vente', 'Administration', 'Finance & Gestion'], isAtsFriendly: true },
  moderne: { category: 'tech', badge: 'Tendance', description: 'Design épuré et dynamique, idéal pour les métiers du numérique.', tags: ['Informatique & Tech', 'BTP & Ingénierie', 'Digital'], isAtsFriendly: true },
  professional: { category: 'corporate', description: 'Équilibre parfait entre modernité et sérieux pour cadres et managers.', tags: ['Commerce & Vente', 'Management', 'Marketing & Com'], isAtsFriendly: true },
  tokyo: { category: 'minimalist', description: 'Minimalisme radical pour une lisibilité maximale et un impact direct.', tags: ['Informatique & Tech', 'Marketing & Com', 'Freelance'], isAtsFriendly: true },
  creatif: { category: 'creative', badge: 'Original', description: 'Mise en page audacieuse pour valoriser originalité et portfolio.', tags: ['Marketing & Com', 'Design & Créatif', 'Arts'] },
  rodrigue: { category: 'corporate', badge: 'Premium', description: 'Élégance premium avec une touche de luxe pour les hautes fonctions.', tags: ['Management', 'Luxe', 'Direction'] },
  abidjan: { category: 'minimalist', description: 'Un classique robuste, conçu pour la clarté et l\'efficacité.', tags: ['Social', 'Santé', 'Administration'], isAtsFriendly: true },
  dakar: { category: 'minimalist', description: 'Structure aérée et moderne, polyvalente pour tous types de profils.', tags: ['BTP & Ingénierie', 'Enseignement', 'Polyvalent'], isAtsFriendly: true },
}

const FILTERS = [
  { id: 'all', label: 'Tous', icon: Filter },
  { id: 'cv', label: 'CV', icon: FileText },
  { id: 'cover_letter', label: 'Lettre', icon: Mail },
  { id: 'public_page', label: 'Page', icon: Globe },
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
  const ttype = template.template_type || 'cv'

  // Aspect ratio: pages publiques sont en 16/9 (landscape), CV et lettres en A4 portrait
  const aspectClass = ttype === 'public_page' ? 'aspect-[16/10]' : 'aspect-[1/1.414]'

  // Label et badge de type
  const typeLabel = ttype === 'cover_letter' ? 'Lettre de motivation'
    : ttype === 'public_page' ? 'Page publique'
      : 'CV'

  return (
    <div
      className="group relative flex flex-col bg-background rounded-panel overflow-hidden border border-border hover:border-primary/50 cursor-pointer transition-colors"
      onClick={() => onSelect(template)}
    >
      <div className="absolute top-2 left-2 z-20">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-border bg-background text-text-secondary">{typeLabel}</span>
      </div>

      <div className={`relative ${aspectClass} overflow-hidden bg-background-subtle border-b border-border`}>
        <TemplatePreview template={template} data={previewData} sector={selectedSector} />
      </div>

      <div className="p-3 bg-background flex justify-between items-center">
        <span className="text-ui-sm font-semibold text-text-primary">{template.name}</span>
        <span className="text-primary text-ui-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Choisir →
        </span>
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
    const ttype = template.template_type || 'cv'

    // ── Lettre de motivation ──────────────────────────────────────────────
    if (ttype === 'cover_letter') {
      router.push(`/mes-documents/create/lettre?template=${template.slug}`)
      return
    }

    // ── Page publique ─────────────────────────────────────────────────────
    if (ttype === 'public_page') {
      router.push(`/mes-documents/create/page-publique?template=${template.slug}`)
      return
    }

    // ── CV ────────────────────────────────────────────────────────────────
    router.push(`/mes-documents/create/cv?template=${template.slug}`)
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
    <div className="min-h-screen bg-background font-sans">
      {/* ── HERO ── */}
      <section className="pt-24 pb-16 border-b border-border bg-background-subtle">
        <PageContainer variant="public">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <h1 className="text-ui-4xl font-bold text-text-primary mb-5">
                Votre profil.{' '}
                <span className="text-primary">Plusieurs présentations.</span>
              </h1>
              <p className="text-ui-base text-text-secondary mb-8 font-medium leading-relaxed">
                Un Profil Master, des dizaines de façons de le présenter. Choisissez le modèle adapté à votre prochain objectif.
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 mb-8">
                {[
                  { icon: Shield, label: 'Tous optimisés ATS' },
                  { icon: Clock, label: 'Prêt en 2 minutes' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-ui-sm font-semibold text-text-secondary">{label}</span>
                  </div>
                ))}
              </div>

              <Link href="/register" passHref>
                <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Créer mon profil gratuitement
                </Button>
              </Link>
            </div>

            {/* Right: Interactive Preview Config */}
            <div className="bg-background p-8 rounded-panel border border-border shadow-sm">
              <p className="text-ui-xs font-bold text-text-muted uppercase tracking-widest mb-5">Personnalisez l'aperçu</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-ui-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-0.5">
                    Votre nom sur le CV
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Jean Dupont"
                    value={namePreview}
                    onChange={e => setNamePreview(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-ui-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-ui-xs font-bold text-text-muted uppercase tracking-widest mb-2 ml-0.5">
                    Votre secteur
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSector}
                      onChange={e => setSelectedSector(e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-ui-sm font-medium appearance-none cursor-pointer"
                    >
                      {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {selectedSector && (
                  <div className="bg-background-subtle border border-border rounded-md px-4 py-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-ui-xs text-text-primary font-semibold">
                      Les modèles recommandés pour <strong>{selectedSector}</strong> sont mis en avant.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="sticky top-0 z-30 bg-background border-b border-border shadow-sm">
        <PageContainer variant="public">
          <div className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Category filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
              {FILTERS.map(f => {
                const Icon = f.icon
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id as any)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 text-ui-sm font-bold rounded-md border transition-all ${filter === f.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background text-text-secondary border-border hover:border-primary/50 hover:text-primary'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {f.label}
                  </button>
                )
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-4 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 border-border text-primary rounded focus:ring-primary" checked={showFreeOnly} onChange={e => setShowFreeOnly(e.target.checked)} />
                <span className="text-ui-sm font-semibold text-text-secondary">Gratuits seulement</span>
              </label>
              <span className="text-ui-xs font-bold text-text-muted bg-background-subtle px-3 py-1.5 rounded border border-border whitespace-nowrap">
                {filtered.length} modèle{filtered.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </PageContainer>
      </div>

      {/* ── TEMPLATE GRID ── */}
      <main className="py-12">
        <PageContainer variant="public">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-background border border-border rounded-panel overflow-hidden animate-pulse">
                  <div className="aspect-[1/1.414] bg-background-subtle" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-border rounded w-2/3" />
                    <div className="h-3 bg-background-subtle rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-background-subtle border border-border rounded-panel flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-ui-lg font-bold text-text-primary mb-2">Aucun modèle trouvé</h3>
              <p className="text-ui-sm text-text-secondary mb-6">Essayez de modifier les filtres.</p>
              <Button onClick={() => { setFilter('all'); setShowFreeOnly(false) }} variant="primary">
                Réinitialiser les filtres
              </Button>
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
        </PageContainer>
      </main>

      {/* ── ATS CALLOUT SECTION ── */}
      <section className="bg-background-subtle border-t border-border py-16">
        <PageContainer variant="public">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Optimisés ATS',
                desc: 'Nos modèles passent les filtres automatiques des entreprises Fortune 500 et des grandes multinationales africaines.',
              },
              {
                icon: Sparkles,
                title: 'IA Intégrée',
                desc: 'Avec carriey PRO, l\\'IA adapte automatiquement votre profil à chaque opportunité en ciblant les mots-clés.',
              },
              {
                icon: Zap,
                title: 'Export instantané',
                desc: 'Téléchargez vos documents en PDF haute définition ou partagez votre lien public en un seul clic.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-background border border-border rounded-panel p-6 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-background-subtle border border-border rounded flex items-center justify-center mb-4 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-text-primary mb-2">{title}</h3>
                <p className="text-ui-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-20 bg-background border-t border-border">
        <PageContainer variant="form-long">
          <div className="text-center">
            <h2 className="text-ui-3xl font-bold text-text-primary tracking-tight mb-5">
              Prêt à décrocher votre prochain poste ?
            </h2>
            <p className="text-ui-base text-text-secondary mb-8">
              Rejoignez des milliers de professionnels qui utilisent carriey pour construire leur carrière.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" passHref>
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>Créer mon profil gratuitement</Button>
              </Link>
              <Link href="/tarifs" passHref>
                <Button variant="secondary" size="lg">Voir les tarifs PRO</Button>
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  )
}

export default function ModelesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-ui-sm text-text-muted font-medium">Chargement des modèles...</p>
        </div>
      </div>
    }>
      <ModelesPageContent />
    </Suspense>
  )
}