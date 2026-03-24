"use client"
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEditorStore } from '../../store/editor'
import DndList from '../../components/editor/DndList'
import ContentEditor from '../../components/editor/ContentEditor'
import { exportPdf, exportDocx, generateContent, triggerDownload } from '../../lib/api'
import DownloadFlowModal from '../../components/editor/DownloadFlowModal'
import { CVTemplateRenderer } from '../../components/cv-templates'
import type { TemplateConfig } from '@/types/cv'
import config from '@/lib/config'
import { toast } from 'react-hot-toast'

// ── Palettes ───────────────────────────────────────────────────────────────────
const COLOR_PALETTES = [
  { id: 'ocean', name: 'Océan', primary: '#1a365d', secondary: '#ebf8ff', accent: '#3182ce' },
  { id: 'forest', name: 'Forêt', primary: '#1a4731', secondary: '#f0fff4', accent: '#38a169' },
  { id: 'sunset', name: 'Coucher', primary: '#742a2a', secondary: '#fff5f5', accent: '#e53e3e' },
  { id: 'violet', name: 'Violet', primary: '#44337a', secondary: '#faf5ff', accent: '#805ad5' },
  { id: 'slate', name: 'Ardoise', primary: '#1a202c', secondary: '#f7fafc', accent: '#4a5568' },
  { id: 'gold', name: 'Or', primary: '#744210', secondary: '#fffff0', accent: '#d69e2e' },
  { id: 'corporate', name: 'Corporate', primary: '#1e3a5f', secondary: '#f0f4f8', accent: '#2b6cb0' },
  { id: 'tech', name: 'Tech', primary: '#0d1b2a', secondary: '#e0fbfc', accent: '#00b4d8' },
  { id: 'sante', name: 'Santé', primary: '#065f46', secondary: '#ecfdf5', accent: '#10b981' },
  { id: 'terre', name: 'Terre', primary: '#78350f', secondary: '#fef3c7', accent: '#b45309' },
  { id: 'rose', name: 'Rose', primary: '#831843', secondary: '#fdf2f8', accent: '#ec4899' },
  { id: 'midnight', name: 'Midnight', primary: '#0f172a', secondary: '#f1f5f9', accent: '#6366f1' },
  { id: 'corail', name: 'Corail', primary: '#7c2d12', secondary: '#fff7ed', accent: '#f97316' },
  { id: 'sauge', name: 'Sauge', primary: '#374151', secondary: '#f3f4f6', accent: '#6b7280' },
  { id: 'navy', name: 'Navy', primary: '#1e3a5f', secondary: '#eff6ff', accent: '#3b82f6' },
]

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Playfair Display', 'Merriweather', 'Source Sans Pro',
  'Nunito', 'Ubuntu', 'PT Sans', 'Oswald', 'Noto Sans',
]

const SECTOR_SAMPLE_DATA: Record<string, any> = {
  tech: {
    profile: { name: 'Jean Dupont', title: 'Développeur Fullstack Senior', email: 'jean.dupont@email.com', phone: '+229 97 12 34 56', location: 'Cotonou, Bénin', photo: '' },
    summary: "Expert en architecture logicielle avec 8 ans d'expérience. Spécialisé en React, Node.js et infrastructures Cloud AWS.",
    experience: [{ company: 'Tech Solutions SAS', role: 'Lead Developer', start: '2021', end: 'Présent', bullets: ['Conception d\'une architecture SaaS supportant 100k+ users.', 'Réduction du temps de chargement de 60%.', 'Mentorat technique de l\'équipe frontend.'] }],
    education: [{ degree: 'Master Informatique', institution: 'Université d\'Abomey-Calavi', year: '2018' }],
    skills: { groups: [{ label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind'] }, { label: 'Backend', items: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B2 (Technique)' }],
    interests: ['Open Source', 'Randonnée', 'Echecs']
  },
  finance: {
    profile: { name: 'Marie Ahouansou', title: 'Analyste Financier Senior', email: 'marie.ahouansou@email.com', phone: '+229 96 78 90 12', location: 'Cotonou, Bénin', photo: '' },
    summary: "Analyste financière avec 6 ans d'expérience en gestion de portefeuille, analyse de risques et reporting financier dans le secteur bancaire.",
    experience: [{ company: 'Banque Atlantique', role: 'Analyste Financier Senior', start: '2020', end: 'Présent', bullets: ['Gestion de portefeuille de 2M€.', 'Analyse de risques et conformité réglementaire.', 'Reporting mensuel pour la direction.'] }],
    education: [{ degree: 'Master Finance & Comptabilité', institution: 'ENEAM', year: '2019' }],
    skills: { groups: [{ label: 'Finance', items: ['Analyse financière', 'Comptabilité', 'Excel avancé'] }, { label: 'Outils', items: ['SAP', 'Bloomberg', 'Power BI'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B2' }]
  },
  sante: {
    profile: { name: 'Pr. Yao Akoto', title: 'Chirurgien Chef de Clinique & Professeur Agrégé', email: 'pr.akoto@health.tg', phone: '+228 91 11 22 33', location: 'Lomé, Togo', photo: '' },
    summary: "Plus de 20 ans de contribution à la chirurgie cardiaque et à l'enseignement médical en Afrique de l'Ouest. Pionnier des interventions à cœur ouvert.",
    experience: [
      { company: 'CHU Sylvanus Olympio', role: 'Chef de Clinique - Chirurgie Cardiaque', start: '2012', end: 'Présent', bullets: ['Pionnier des interventions cardiaques à cœur ouvert au Togo.', 'Recherche clinique sur les cardiopathies congénitales.', 'Direction des staffs médicaux et formation continue.'] },
      { company: 'Université de Lomé', role: 'Doyen de la Faculté des Sciences de la Santé', start: '2018', end: '2023', bullets: ['Direction de la stratégie académique et hospitalière.', 'Réforme complète du curriculum des études médicales.'] }
    ],
    education: [
      { degree: 'Agrégation de Médecine (Chirurgie Thoracique et Cardiaque)', institution: 'CAMES', year: '2011' },
      { degree: 'Doctorat en Médecine', institution: 'Université de Lomé', year: '2010' }
    ],
    skills: { groups: [{ label: 'Spécialités', items: ['Chirurgie obstétricale', 'Échographie morphologique', 'Planification familiale'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'Médical' }],
    interests: ['Opéra', 'Piano', 'Jardinage']
  },
  marketing: {
    profile: { name: 'Amina Bello', title: 'Responsable Marketing Digital', email: 'amina.bello@email.com', phone: '+229 67 89 01 23', location: 'Cotonou, Bénin', photo: '' },
    summary: "Spécialiste en marketing digital avec 5 ans d'expérience en stratégie de contenu, SEO et gestion de campagnes publicitaires.",
    experience: [{ company: 'DigiCom Agency', role: 'Responsable Marketing Digital', start: '2021', end: 'Présent', bullets: ['Stratégie social media +150% engagement.', 'Campagnes Google Ads ROI x3.', 'Management équipe de 4 personnes.'] }],
    education: [{ degree: 'Master Marketing & Communication', institution: 'ISM Cotonou', year: '2020' }],
    skills: { groups: [{ label: 'Marketing', items: ['SEO/SEM', 'Content Marketing', 'Social Media'] }, { label: 'Outils', items: ['Google Analytics', 'Meta Ads', 'Canva'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B2' }]
  },
  education: {
    profile: { name: 'Paul Adjovi', title: 'Enseignant de Mathématiques', email: 'paul.adjovi@email.com', phone: '+229 94 56 78 90', location: 'Abomey-Calavi, Bénin', photo: '' },
    summary: "Enseignant passionné avec 7 ans d'expérience dans l'éducation secondaire et la formation des jeunes talents.",
    experience: [{ company: 'Lycée Béhanzin', role: 'Professeur de Mathématiques', start: '2019', end: 'Présent', bullets: ['Enseignement classes de Terminale.', 'Taux de réussite BAC : 92%.', 'Création de supports pédagogiques innovants.'] }],
    education: [{ degree: 'CAPES Mathématiques', institution: 'ENS Porto-Novo', year: '2018' }],
    skills: { groups: [{ label: 'Pédagogie', items: ['Didactique', 'Évaluation', 'Tutorat'] }, { label: 'Outils', items: ['GeoGebra', 'Google Classroom', 'LaTeX'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B1' }]
  },
  commerce: {
    profile: { name: 'Rachid Souleymane', title: 'Responsable Commercial', email: 'rachid.souleymane@email.com', phone: '+229 66 12 34 56', location: 'Cotonou, Bénin', photo: '' },
    summary: "Commercial performant avec 6 ans d'expérience en développement de clientèle B2B et gestion de grands comptes.",
    experience: [{ company: 'SOBEBRA', role: 'Responsable Commercial Zone Sud', start: '2020', end: 'Présent', bullets: ['Développement portefeuille +40 clients.', 'CA annuel de 500M FCFA.', 'Négociation contrats grands comptes.'] }],
    education: [{ degree: 'Licence Commerce International', institution: 'ESGIS Cotonou', year: '2019' }],
    skills: { groups: [{ label: 'Vente', items: ['Prospection B2B', 'Négociation', 'CRM'] }, { label: 'Outils', items: ['Salesforce', 'Excel', 'PowerPoint'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B1' }]
  },
  juridique: {
    profile: { name: 'Clarisse Dossou', title: 'Juriste d\'Entreprise', email: 'clarisse.dossou@email.com', phone: '+229 97 34 56 78', location: 'Cotonou, Bénin', photo: '' },
    summary: "Juriste spécialisée en droit des affaires OHADA avec 5 ans d'expérience en conseil juridique et contentieux.",
    experience: [{ company: 'Cabinet Me Ajavon & Associés', role: 'Juriste Senior', start: '2021', end: 'Présent', bullets: ['Rédaction de contrats commerciaux.', 'Conseil en conformité OHADA.', 'Gestion de contentieux civils et commerciaux.'] }],
    education: [{ degree: 'Master Droit des Affaires', institution: 'FADESP - UAC', year: '2020' }],
    skills: { groups: [{ label: 'Droit', items: ['Droit OHADA', 'Droit des contrats', 'Contentieux'] }, { label: 'Outils', items: ['LegalTech', 'Recherche juridique', 'Rédaction'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B2' }]
  },
  design: {
    profile: { name: 'Fatou Diallo', title: 'Directrice Artistique', email: 'fatou.diallo@email.com', phone: '+229 96 45 67 89', location: 'Cotonou, Bénin', photo: '' },
    summary: "Créative passionnée avec 6 ans d'expérience en design graphique, branding et direction artistique.",
    experience: [{ company: 'Studio Créatif Bénin', role: 'Directrice Artistique', start: '2020', end: 'Présent', bullets: ['Direction de la charte graphique de 15+ marques.', 'Création d\'identités visuelles complètes.', 'Management d\'une équipe de 3 designers.'] }],
    education: [{ degree: 'Master Design Graphique', institution: 'ISBA Cotonou', year: '2019' }],
    skills: { groups: [{ label: 'Design', items: ['Branding', 'UI/UX', 'Illustration'] }, { label: 'Outils', items: ['Figma', 'Adobe Creative Suite', 'After Effects'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B2' }]
  },
  industrie: {
    profile: { name: 'Kofi Agbossou', title: 'Ingénieur de Production', email: 'kofi.agbossou@email.com', phone: '+229 95 67 89 01', location: 'Cotonou, Bénin', photo: '' },
    summary: "Ingénieur industriel avec 8 ans d'expérience en gestion de production, maintenance et optimisation des processus.",
    experience: [{ company: 'SCB-Lafarge', role: 'Ingénieur de Production', start: '2019', end: 'Présent', bullets: ['Supervision ligne de production 24/7.', 'Réduction des temps d\'arrêt de 30%.', 'Mise en place de la maintenance préventive.'] }],
    education: [{ degree: 'Diplôme d\'Ingénieur Génie Mécanique', institution: 'EPAC - UAC', year: '2017' }],
    skills: { groups: [{ label: 'Ingénierie', items: ['Lean Manufacturing', 'Maintenance', 'Qualité'] }, { label: 'Outils', items: ['AutoCAD', 'SolidWorks', 'SAP'] }] },
    languages: [{ name: 'Français', level: 'Maternel' }, { name: 'Anglais', level: 'B1' }]
  },
}

// Fallback = tech
const getSampleData = (sector: string | null) => {
  return SECTOR_SAMPLE_DATA[sector || 'tech'] || SECTOR_SAMPLE_DATA.tech
}

type SidebarTab = 'content' | 'design' | 'sections' | 'ai'

export default function EditorPage() {
  const {
    template, setTemplate, setData, moveSection,
    selected, setSelected, updateSectionStyle, updateColors, data,
    editMode, setEditMode, currentStep, setStep, onboardingData, templateId
  } = useEditorStore()

  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState<'pdf' | 'docx' | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  // previewHtmlContent removed — rendering is now done via React components
  const [aiPrompt, setAiPrompt] = useState('')
  const [activeTab, setActiveTab] = useState<SidebarTab>('content')
  const [selectedPaletteId, setSelectedPaletteId] = useState('ocean')
  const [customColors, setCustomColors] = useState({ primary: '#1a365d', secondary: '#ebf8ff', accent: '#3182ce' })
  const [headingFont, setHeadingFont] = useState('Montserrat')
  const [bodyFont, setBodyFont] = useState('Open Sans')
  const [previewScale, setPreviewScale] = useState(0.65)
  const [isSaved, setIsSaved] = useState(false)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [spacing, setSpacing] = useState<'compact' | 'normal' | 'airy'>('normal')
  const [fontSize, setFontSize] = useState(14)
  const [lineHeight, setLineHeight] = useState(1.5)
  const [photoShape, setPhotoShape] = useState<'circle' | 'square' | 'rounded'>('circle')
  const [borderRadius, setBorderRadius] = useState('4px')
  const [previewHeight, setPreviewHeight] = useState('auto')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [pendingExport, setPendingExport] = useState<'pdf' | 'docx' | null>(null)
  const [hasTemplateAccess, setHasTemplateAccess] = useState(true)

  useEffect(() => {
    console.log("STATE CHANGE: showDownloadModal =", showDownloadModal)
  }, [showDownloadModal])
  
  useEffect(() => {
    console.log("EDITOR PAGE MOUNTED")
    return () => console.log("EDITOR PAGE UNMOUNTED")
  }, [])
  const previewContainerRef = useRef<HTMLDivElement>(null)

  // ── Auto-scale sur mobile ──────────────────────────────────────────────────
  const autoScale = useCallback(() => {
    if (typeof window === 'undefined' || !previewContainerRef.current) return
    const isMobile = window.innerWidth < 768
    if (!isMobile) return

    const containerWidth = previewContainerRef.current.offsetWidth
    const padding = 32 // p-4 on each side = 16px * 2 = 32px
    const availableWidth = containerWidth - padding
    const A4_WIDTH_MM = 210
    const MM_TO_PX = 3.78 // approx 96dpi / 25.4
    const a4WidthPx = A4_WIDTH_MM * MM_TO_PX

    const newScale = Math.min(1, availableWidth / a4WidthPx)
    setPreviewScale(Number(newScale.toFixed(2)))
  }, [])

  // Déclencher l'auto-scale lors du changement de vue ou de redimensionnement
  useEffect(() => {
    if (viewMode === 'preview') {
      // Petit délai pour laisser le temps au DOM de s'ajuster
      const timer = setTimeout(autoScale, 100)
      window.addEventListener('resize', autoScale)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', autoScale)
      }
    }
  }, [viewMode, autoScale])

  // ── Conversational Messages ──
  const STEP_MESSAGES = [
    `Bienvenue ${onboardingData.namePreview || ''} ! Commençons par la section Coordonnées. Il est préférable de communiquer au moins votre nom, votre e-mail et votre numéro de téléphone.`,
    "Parlez-nous de vos expériences professionnelles les plus récentes. Concentrez-vous sur vos réalisations.",
    "Quelles sont vos formations ? Indiquez même les certifications courtes.",
    "Quelles sont vos compétences clés pour ce poste ? Soyez précis sur vos outils techniques.",
    "Quelles langues maîtrisez-vous ? N'oubliez pas d'indiquer votre niveau réel.",
    "Super ! Enfin, personnalisons le design de votre CV pour qu'il vous ressemble parfaitement."
  ]

  const STEP_TITLES = ['Profil', 'Expérience', 'Formation', 'Compétences', 'Langues', 'Design']

  // ── Communication avec l'aperçu ──────────────────────────────────────────
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CV_HEIGHT') {
        setPreviewHeight(`${e.data.height}px`)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const initEditor = async () => {
      try {
        setLoading(true)
        const resumeIdFromUrl = searchParams.get('resume')
        const templateSlug = searchParams.get('template')

        if (resumeIdFromUrl) {
          setResumeId(resumeIdFromUrl)
          const res = await fetch(`${config.apiBaseUrl}/resumes/${resumeIdFromUrl}`, {
            headers: session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : {},
          })
          if (res.ok) {
            const resumeData = await res.json()
            const content = resumeData.content || {}
            const { _paletteId, _customColors, _headingFont, _bodyFont, _spacing, _fontSize, _photoShape, _borderRadius, ...cleanData } = content
            setData(cleanData.profile ? cleanData : SAMPLE_DATA)
            if (_paletteId) setSelectedPaletteId(_paletteId)
            if (_customColors) setCustomColors(_customColors)
            if (_headingFont) setHeadingFont(_headingFont)
            if (_bodyFont) setBodyFont(_bodyFont)
            if (_spacing) setSpacing(_spacing)
            if (_fontSize) setFontSize(_fontSize)
            if (_photoShape) setPhotoShape(_photoShape === 'round' ? 'circle' : (_photoShape as any))
            if (_borderRadius) setBorderRadius(_borderRadius)
            setIsSaved(true)
            const tplRes = await fetch(`${config.apiBaseUrl}/templates/${resumeData.template_id || content._templateId}`)
            if (tplRes.ok) {
              const tplInfo = await tplRes.json()
              const savedSections = content._sections || tplInfo.definition.sections
              setTemplate({ 
                ...tplInfo.definition, 
                id: tplInfo.id,
                templateName: tplInfo.slug, 
                sections: savedSections,
                colors: { ...tplInfo.definition.colors, ...(_customColors || {}) }, 
                fonts: { heading: _headingFont || headingFont, body: _bodyFont || bodyFont } 
              })
            }
          }
        } else if (templateSlug) {
          const res = await fetch(`${config.apiBaseUrl}/templates/${templateSlug}`)
          if (res.ok) {
            const tplInfo = await res.json()
            const palId = searchParams.get('palette') || 'ocean'
            setSelectedPaletteId(palId)
            const pal = COLOR_PALETTES.find(p => p.id === palId) || COLOR_PALETTES[0]
            const initialColors = { 
              primary: searchParams.get('primary') || pal.primary, 
              secondary: pal.secondary, 
              accent: searchParams.get('accent') || pal.accent 
            }
            setCustomColors(initialColors)
            
            const hFont = searchParams.get('fontHeading') || tplInfo.definition.fonts?.heading || headingFont
            const bFont = searchParams.get('fontBody') || tplInfo.definition.fonts?.body || bodyFont
            setHeadingFont(hFont)
            setBodyFont(bFont)
            
            setTemplate({ 
              ...tplInfo.definition, 
              id: tplInfo.id, 
              templateName: tplInfo.slug, 
              colors: { ...tplInfo.definition.colors, ...initialColors }, 
              fonts: { heading: hFont, body: bFont } 
            })

            // Mix de DATA SAMPLE avec Onboarding (nom + secteur)
            const sector = searchParams.get('sector') || onboardingData.sector
            const sampleData = getSampleData(sector)

            setData({
              ...sampleData,
              profile: {
                ...sampleData.profile,
                name: onboardingData.namePreview || sampleData.profile.name
              }
            })
            setIsSaved(false)

            // ── Access Control: check if logged-in user has access to paid templates ──
            if (session?.user?.accessToken && tplInfo.price > 0) {
              try {
                const accessRes = await fetch(`${config.apiBaseUrl}/templates/${templateSlug}/check-access`, {
                  headers: { Authorization: `Bearer ${session.user.accessToken}` }
                })
                if (accessRes.ok) {
                  const accessData = await accessRes.json()
                  if (!accessData.has_access) {
                    // User doesn't have access → block exports and open payment modal
                    setHasTemplateAccess(false)
                    setPendingExport('pdf')
                    setShowDownloadModal(true)
                  } else {
                    setHasTemplateAccess(true)
                  }
                }
              } catch (e) {
                console.error('Access check error:', e)
              }
            }
          }
        } else {
          router.push('/modeles')
        }
      } catch (err: any) {
        setError("Erreur lors de l'initialisation de l'éditeur")
      } finally {
        setLoading(false)
      }
    }
    initEditor()
  }, [searchParams, session, router])

  // ── Save ───────────────────────────────────────────────────────────────────
  const saveResume = useCallback(async (showToast = true) => {
    if (!session?.user?.accessToken) {
      if (showToast) {
        toast.error("Veuillez vous connecter pour enregistrer votre CV");
        router.push(`/login?callbackUrl=/editor${resumeId ? `?resume=${resumeId}` : ''}`);
      }
      return
    }
    if (!template || !data) return
    setIsSaving(true)
    const contentToSave = {
      ...data,
      _customColors: customColors,
      _headingFont: headingFont,
      _bodyFont: bodyFont,
      _paletteId: selectedPaletteId,
      _templateId: template.templateName,
      _spacing: spacing,
      _fontSize: fontSize,
      _lineHeight: lineHeight,
      _photoShape: photoShape,
      _borderRadius: borderRadius,
      _sections: template.sections,
    }
    try {
      if (resumeId) {
        const res = await fetch(`${config.apiBaseUrl}/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.user.accessToken}` },
          body: JSON.stringify({ content: contentToSave }),
        })
        if (!res.ok) throw new Error('Erreur de sauvegarde')
      } else {
        const tplRes = await fetch(`${config.apiBaseUrl}/templates/${template.templateName}`)
        const tplData = await tplRes.json()
        const res = await fetch(`${config.apiBaseUrl}/resumes/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.user.accessToken}` },
          body: JSON.stringify({ title: data.profile?.name ? `CV - ${data.profile.name}` : 'Mon CV', template_id: tplData.id, content: contentToSave }),
        })
        if (!res.ok) throw new Error('Erreur de création')
        const newResume = await res.json()
        setResumeId(newResume.id)
      }
      setIsSaved(true)
      setLastSaved(new Date())
      if (showToast) toast.success('CV sauvegardé !')
    } catch (e: any) {
      if (showToast) toast.error(e.message || 'Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }, [template, data, session, resumeId, customColors, headingFont, bodyFont, selectedPaletteId, spacing, fontSize, lineHeight, photoShape, borderRadius])

  // Auto-save
  useEffect(() => {
    if (!session?.user?.accessToken || !template || !data || isSaved) return
    const timer = setTimeout(() => saveResume(false), 30000)
    return () => clearTimeout(timer)
  }, [data, template, isSaved, saveResume, session])

  useEffect(() => { setIsSaved(false) }, [data])

  // ── Live preview (React-based, no API call) ────────────────────────────────
  const reactTemplateConfig: TemplateConfig | null = useMemo(() => {
    if (!template) return null
    return {
      templateName: template.templateName,
      displayName: template.displayName || template.templateName,
      tokens: {
        colorPrimary: customColors.primary,
        colorSecondary: customColors.secondary,
        colorAccent: customColors.accent,
        fontHeading: headingFont,
        fontBody: bodyFont,
        spacing: spacing as any,
        fontSize,
        photoShape,
        borderRadius,
      },
      sections: (template.sections as any) || [],
    }
  }, [template, customColors, headingFont, bodyFont, spacing, fontSize, photoShape, borderRadius])

  // ── Actions ────────────────────────────────────────────────────────────────
  // ── Magic Optimization ───────────────────────────────────────────────────
  const magicOptimize = async () => {
    if (!template || !data) return
    setIsOptimizing(true)
    toast("Optimisation en cours...", { icon: "✨" })

    // Algorithm: Heuristic to fill page or fit best.
    // Smaller font / lineHeight if overflowing 1 page, etc.
    // For now, let's find a sweet spot based on rough heuristics
    // (A real production version would iterate, but here we can simulate a smart adjustment)

    const wordCount = JSON.stringify(data).length / 5
    let bestSize = 14
    let bestLine = 1.5

    if (wordCount > 500) {
      bestSize = 13.5
      bestLine = 1.4
    } else if (wordCount < 200) {
      bestSize = 15
      bestLine = 1.7
    }

    setFontSize(bestSize)
    setLineHeight(bestLine)

    setTimeout(() => {
      setIsOptimizing(false)
      toast.success("Design optimisé pour vos contenus !")
    }, 1000)
  }

  const applyPalette = useCallback((palette: typeof COLOR_PALETTES[0]) => {
    setSelectedPaletteId(palette.id)
    setCustomColors({ primary: palette.primary, secondary: palette.secondary, accent: palette.accent })
    updateColors({ primary: palette.primary, secondary: palette.secondary, accent: palette.accent })
  }, [updateColors])

  const applyCustomColor = useCallback((key: 'primary' | 'secondary' | 'accent', value: string) => {
    setCustomColors(prev => ({ ...prev, [key]: value }))
    setSelectedPaletteId('custom')
    updateColors({ [key]: value })
  }, [updateColors])

  const applyFont = useCallback((type: 'heading' | 'body', font: string) => {
    if (type === 'heading') setHeadingFont(font)
    else setBodyFont(font)
    if (!template) return
    setTemplate({ ...template, fonts: { heading: type === 'heading' ? font : headingFont, body: type === 'body' ? font : bodyFont } })
  }, [template, headingFont, bodyFont, setTemplate])

  const handleExportPdf = async (ignoreAuth = false, guestData?: { email: string; name: string }, plan?: string) => {
    if (!session?.user?.accessToken && !ignoreAuth) {
      setPendingExport('pdf')
      setShowDownloadModal(true)
      return
    }
    // Block export if user is logged in but hasn't paid for this template
    if (session?.user?.accessToken && !hasTemplateAccess && !ignoreAuth) {
      setPendingExport('pdf')
      setShowDownloadModal(true)
      return
    }
    if (!template || !data) return
    try {
      setExporting('pdf')
      const token = session?.user?.accessToken as string | undefined
      const configOverride = { 
        colorPrimary: customColors.primary,
        colorSecondary: customColors.secondary,
        colorAccent: customColors.accent,
        fontHeading: headingFont, 
        fontBody: bodyFont, 
        spacing, 
        fontSize,
        lineHeight, 
        photoShape,
        borderRadius,
        sections: template.sections
      }
      console.log(`Starting ${ignoreAuth ? 'Direct ' : ''}PDF Export...`)
      const res = await exportPdf(template, data, 'CV.pdf', configOverride, token, guestData, plan, templateId)
      console.log('PDF Export response:', res)
      if (res.url) {
        console.log('Triggering download for:', res.url)
        await triggerDownload(res.url, 'CV.pdf')
      }
    } finally { setExporting(null) }
  }

  const handleExportDocx = async (ignoreAuth = false, guestData?: { email: string; name: string }, plan?: string) => {
    if (!session?.user?.accessToken && !ignoreAuth) {
      setPendingExport('docx')
      setShowDownloadModal(true)
      return
    }
    // Block export if user is logged in but hasn't paid for this template
    if (session?.user?.accessToken && !hasTemplateAccess && !ignoreAuth) {
      setPendingExport('docx')
      setShowDownloadModal(true)
      return
    }
    if (!template || !data) return
    try {
      setExporting('docx')
      const token = session?.user?.accessToken as string | undefined
      const configOverride = { 
        colorPrimary: customColors.primary,
        colorSecondary: customColors.secondary,
        colorAccent: customColors.accent,
        fontHeading: headingFont, 
        fontBody: bodyFont, 
        spacing, 
        fontSize,
        lineHeight,
        photoShape,
        borderRadius,
        sections: template.sections
      }
      console.log(`Starting ${ignoreAuth ? 'Direct ' : ''}DOCX Export...`)
      const res = await exportDocx(template, data, 'CV.docx', configOverride, token, guestData, plan, templateId)
      console.log('DOCX Export response:', res)
      if (res.url) {
        console.log('Triggering download for:', res.url)
        await triggerDownload(res.url, 'CV.docx')
      }
    } finally { setExporting(null) }
  }

  const handleGenerateAI = async () => {
    if (!session?.user?.accessToken) {
      toast.error("Veuillez vous connecter pour utiliser l'Assistant IA");
      router.push(`/login?callbackUrl=/editor${resumeId ? `?resume=${resumeId}` : ''}`);
      return
    }
    if (!template) return
    try {
      setGenLoading(true)
      const token = session?.user?.accessToken as string | undefined
      const res = await generateContent({ prompt: aiPrompt || undefined, role: aiPrompt || 'Professionnel expérimenté', data }, token)
      if (res?.data) { setData(res.data); setIsSaved(false) }
    } catch (e: any) {
      alert('Erreur IA: ' + e.message)
    } finally { setGenLoading(false) }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
    toast.success('Déconnexion réussie')
  }

  // ── Loading / Error ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#777777] text-sm">Chargement de l'éditeur...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] flex-col gap-4">
      <div className="text-red-500 text-xl">{error}</div>
      <Link href="/modeles" className="px-4 py-2 bg-[#00C896] hover:bg-[#66E1B5] text-white rounded-lg text-sm transition-colors">← Retour aux modèles</Link>
    </div>
  )

  const TABS: { key: SidebarTab; icon: React.ReactNode; label: string }[] = [
    { 
      key: 'content', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>, 
      label: 'Contenu' 
    },
    { 
      key: 'design', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>, 
      label: 'Design' 
    },
    { 
      key: 'sections', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>, 
      label: 'Sections' 
    },
    { 
      key: 'ai', 
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>, 
      label: 'IA Assist' 
    },
  ]

  return (
    <div className="h-screen bg-[#F5F5F5] flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ═══ TOP BAR ═══ */}
      <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/modeles" className="flex items-center gap-2 text-[#777777] hover:text-[#1c1c1c] transition-colors group shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="hidden sm:block text-sm font-medium">Modèles</span>
          </Link>
          <div className="h-4 w-px bg-gray-200 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: customColors.primary }} />
            <span className="text-[#1c1c1c] font-semibold text-sm truncate max-w-[120px] sm:max-w-xs capitalize">
              {template?.templateName ?? 'Éditeur CV'}
            </span>
            {isSaved && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full font-medium">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Sauvegardé
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {session && (
            <button onClick={() => saveResume(true)} disabled={isSaving || isSaved}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium text-[#1c1c1c] bg-white hover:bg-gray-50 border border-gray-200 transition-all disabled:opacity-40">
              {isSaving
                ? <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              }
              {isSaving ? 'Enreg...' : 'Enregistrer'}
            </button>
          )}
          {session && (
            <Link href="/dashboard" className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium text-[#1c1c1c] bg-white hover:bg-gray-50 border border-gray-200 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg>
              Mes CVs
            </Link>
          )}
          <button onClick={() => handleExportDocx()} disabled={!template || !data || !!exporting}
            className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium text-[#1c1c1c] bg-white hover:bg-gray-50 border border-gray-200 transition-all disabled:opacity-40">
            {exporting === 'docx'
              ? <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            }
            DOCX
          </button>
          <button onClick={() => handleExportPdf()} disabled={!template || !data || !!exporting}
            className="flex items-center gap-2 h-8 px-3 sm:px-4 rounded-lg text-xs font-semibold text-white bg-[#00C896] hover:bg-[#66E1B5] transition-all disabled:opacity-40 shadow-lg shadow-[#00C896]/25">
            {exporting === 'pdf'
              ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            }
            <span className="hidden sm:inline">Exporter </span>PDF
          </button>
          
          {session?.user?.role && ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(session.user.role) && (
            <Link 
              href="/admin"
              className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-200"
            >
              Admin
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-2 ml-1.5 pl-1.5 border-l border-gray-200">
              <div className="hidden lg:flex flex-col items-end mr-1">
                <span className="text-[10px] font-bold text-[#1c1c1c] leading-tight truncate max-w-[120px]">
                  {session.user?.email?.split('@')[0]}
                </span>
                <span className="text-[9px] text-[#777777] leading-tight lowercase">Utilisateur</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-[#777777] hover:text-red-500 hover:bg-red-50 transition-all"
                title="Déconnexion"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <Link 
              href="/login?callbackUrl=/editor"
              className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-semibold text-[#1c1c1c] bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Connexion
            </Link>
          )}
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ═══ SIDEBAR ═══ */}
        <aside className={`${viewMode === 'edit' ? 'flex' : 'hidden md:flex'} w-full md:w-80 xl:w-[340px] flex-col bg-white border-r border-gray-200 shrink-0`}>

          {/* Mode Toggle Header - Always visible */}
          <div className="p-3 sm:p-4 bg-white border-b border-gray-200">
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm">
              <button 
                onClick={() => setEditMode('wizard')} 
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${editMode === 'wizard' ? 'bg-[#00C896] text-white shadow-md shadow-[#00C896]/20' : 'text-[#777777] hover:text-[#1c1c1c] hover:bg-gray-100'}`}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Assistant CVtor
              </button>
              <button 
                onClick={() => setEditMode('expert')} 
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${editMode === 'expert' ? 'bg-[#1C1C1C] text-white shadow-md' : 'text-[#777777] hover:text-[#1c1c1c] hover:bg-gray-100'}`}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Outils Expert
              </button>
            </div>
          </div>

          {/* Wizard Interface if enabled */}
          {editMode === 'wizard' ? (
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              {/* Conversational Assistant Message */}
              <div className="p-4 sm:p-6 bg-[#F5F5F5] border-b border-gray-200 md:hidden">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-2xl bg-[#00C896] flex items-center justify-center text-xl shadow-lg shadow-[#00C896]/20 shrink-0">
                    ✨
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#00C896] uppercase tracking-widest mt-0.5">Note de l'Assistant</p>
                    <p className="text-sm text-[#1c1c1c] leading-relaxed italic">
                      "{STEP_MESSAGES[currentStep]}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Stepper Progress */}
              <div className="px-4 pt-4 shrink-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Progression</span>
                  <span className="text-[10px] font-bold text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full">
                    {currentStep + 1} / 6
                  </span>
                </div>
                <div className="flex gap-1 h-1">
                  {[0, 1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`flex-1 rounded-full transition-all duration-300 ${s <= currentStep ? 'bg-[#00C896]' : 'bg-gray-200'}`} />
                  ))}
                </div>
              </div>

              {/* Step Editor Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-[#1c1c1c]">{STEP_TITLES[currentStep]}</h2>
                </div>

                {currentStep === 5 ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3 ml-1">Couleurs recommandées</p>
                        <div className="grid grid-cols-3 gap-2">
                          {COLOR_PALETTES.slice(0, 6).map(palette => (
                            <button key={palette.id} onClick={() => applyPalette(palette)}
                              className={`relative p-3 rounded-2xl border transition-all hover:scale-105 ${selectedPaletteId === palette.id ? 'border-[#00C896] bg-[#00C896]/10' : 'border-gray-200 bg-gray-50 hover:border-[#00C896]/50'}`}>
                              <div className="flex gap-1 mb-2 justify-center">
                                <div className="w-5 h-5 rounded-full shadow-sm" style={{ background: palette.primary }} />
                                <div className="w-5 h-5 rounded-full shadow-sm" style={{ background: palette.accent }} />
                              </div>
                              <p className="text-[10px] text-[#777777] font-bold">{palette.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3 ml-1">Police de caractères</p>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {['Inter', 'Poppins', 'Montserrat', 'Raleway'].map(f => (
                            <button
                              key={f}
                              onClick={() => { applyFont('heading', f); applyFont('body', f) }}
                              className={`p-3 rounded-2xl border text-sm transition-all ${headingFont === f ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896] font-bold' : 'border-gray-200 bg-gray-50 text-[#777777]'}`}
                              style={{ fontFamily: f }}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Taille du texte</p>
                          <span className="text-[10px] font-mono text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full">{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#777777]">A</span>
                          <input type="range" min="12" max="20" step="1" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="flex-1 accent-[#00C896]" />
                          <span className="text-sm font-bold text-[#777777]">A</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Interligne</p>
                          <span className="text-[10px] font-mono text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full">{lineHeight}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#777777]">↕</span>
                          <input type="range" min="1.0" max="2.0" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="flex-1 accent-[#00C896]" />
                          <span className="text-[10px] text-[#777777]">↕</span>
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <button
                          onClick={magicOptimize}
                          disabled={isOptimizing}
                          className="w-full py-4 rounded-2xl bg-[#00C896] text-white font-black text-sm hover:bg-[#66E1B5] transition-all shadow-xl shadow-[#00C896]/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                          {isOptimizing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Calcul magique...
                            </>
                          ) : (
                            <>✨ Optimisation Magique</>
                          )}
                        </button>

                        <p className="text-[10px] text-[#777777] text-center leading-relaxed">
                          Ajuste automatiquement la taille et l'interligne pour remplir parfaitement votre page.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ContentEditor wizardStep={currentStep} />
                )}

                {/* Navigation Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200 flex gap-2 pb-24 md:pb-6">
                  <button
                    disabled={currentStep === 0}
                    onClick={() => setStep(s => s - 1)}
                    className="flex-1 py-2.5 rounded-xl border-2 border-gray-500 text-[#555555] font-bold text-xs hover:border-gray-300 transition-all active:scale-95"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => currentStep === 5 ? handleExportPdf() : setStep(s => s + 1)}
                    className="flex-1 py-2.5 rounded-xl bg-[#00C896] text-white font-black text-xs hover:bg-[#66E1B5] transition-all shadow-md shadow-[#00C896]/20 active:scale-95"
                  >
                    {currentStep === 5 ? 'Terminer' : 'Étape suivante'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tab bar */}
              <div className="flex gap-1 p-2 bg-white border-b border-gray-200 shrink-0">
                {TABS.map(({ key, icon, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${activeTab === key ? 'bg-[#00C896] text-white shadow-md shadow-[#00C896]/20' : 'text-[#777777] hover:text-[#1c1c1c] hover:bg-gray-50'}`}>
                    <span>{icon}</span>
                    <span className="tracking-wide uppercase">{label}</span>
                  </button>
                ))}
              </div>

              {/* Tab content (Expert Mode) */}
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ paddingBottom: '5rem' }}>
                <div className="p-4 space-y-5">
                  {/* CONTENT */}
                  {activeTab === 'content' && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Informations</span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                      <ContentEditor />
                    </div>
                  )}

                  {/* DESIGN */}
                  {activeTab === 'design' && (
                    <div className="space-y-6">
                      {/* Palettes */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3">Palette de couleurs</p>
                        <div className="grid grid-cols-3 gap-2">
                          {COLOR_PALETTES.map(palette => (
                            <button key={palette.id} onClick={() => applyPalette(palette)}
                              className={`relative p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-100 ${selectedPaletteId === palette.id ? 'border-[#00C896] bg-[#00C896]/10' : 'border-gray-200 hover:border-[#00C896]/50'}`}>
                              <div className="flex gap-1 mb-2">
                                <div className="w-4 h-4 rounded-full" style={{ background: palette.primary }} />
                                <div className="w-4 h-4 rounded-full" style={{ background: palette.accent }} />
                                <div className="w-4 h-4 rounded-full border border-gray-200" style={{ background: palette.secondary }} />
                              </div>
                              <p className="text-[10px] text-[#777777] text-left">{palette.name}</p>
                              {selectedPaletteId === palette.id && (
                                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#00C896] rounded-full flex items-center justify-center">
                                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom colors */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3">Couleurs personnalisées</p>
                        <div className="space-y-2">
                          {([
                            { key: 'primary', label: 'Principale' },
                            { key: 'secondary', label: 'Arrière-plan' },
                            { key: 'accent', label: 'Accent' },
                          ] as const).map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between rounded-xl px-3 py-2 bg-gray-50 border border-gray-200">
                              <span className="text-xs text-[#777777]">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#777777]">{customColors[key]}</span>
                                <label className="cursor-pointer">
                                  <input type="color" value={customColors[key]} onChange={e => applyCustomColor(key, e.target.value)} className="sr-only" />
                                  <div className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-[#00C896] transition-colors cursor-pointer" style={{ background: customColors[key] }} />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fonts */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3">Polices</p>
                        <div className="space-y-3">
                          {([
                            { key: 'heading', label: 'Titres', value: headingFont },
                            { key: 'body', label: 'Corps du texte', value: bodyFont },
                          ] as const).map(({ key, label, value }) => (
                            <div key={key}>
                              <label className="text-[10px] text-[#777777] font-semibold uppercase tracking-wide block mb-1.5">{label}</label>
                              <select value={value} onChange={e => applyFont(key, e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-xs focus:outline-none focus:border-[#00C896] transition-colors">
                                {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Spacing */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3">Espacement</p>
                        <div className="flex gap-2">
                          {([
                            { key: 'compact', label: 'Compact' },
                            { key: 'normal', label: 'Normal' },
                            { key: 'airy', label: 'Aéré' },
                          ] as const).map(({ key, label }) => (
                            <button key={key} onClick={() => setSpacing(key)}
                              className={`flex-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${spacing === key ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]' : 'border-gray-200 text-[#777777] hover:border-gray-300 hover:text-[#1c1c1c]'}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Font size */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Taille du texte</p>
                          <span className="text-[10px] font-mono text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full">{fontSize}px</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#777777]">A</span>
                          <input type="range" min="12" max="20" step="1" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="flex-1 accent-[#00C896]" />
                          <span className="text-sm font-bold text-[#777777]">A</span>
                        </div>
                      </div>

                      {/* Line height */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Interligne</p>
                          <span className="text-[10px] font-mono text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full">{lineHeight}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[#777777]">↕</span>
                          <input type="range" min="1.0" max="2.0" step="0.1" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="flex-1 accent-[#00C896]" />
                          <span className="text-[10px] text-[#777777]">↕</span>
                        </div>
                      </div>

                      {/* Photo shape */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3">Forme de la photo</p>
                        <div className="flex gap-2">
                          {([
                            { key: 'circle', label: 'Ronde', cls: 'rounded-full' },
                            { key: 'rounded', label: 'Arrondie', cls: 'rounded-lg' },
                            { key: 'square', label: 'Carrée', cls: 'rounded-none' },
                          ] as const).map(({ key, label, cls }) => (
                            <button key={key} onClick={() => setPhotoShape(key)}
                              className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-[10px] font-medium transition-all ${photoShape === key ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]' : 'border-gray-200 text-[#777777] hover:border-gray-300'}`}>
                              <div className={`w-7 h-7 bg-gray-300 ${cls}`} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Border radius */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#777777] mb-3">Coins des éléments</p>
                        <div className="flex gap-2">
                          {[
                            { key: '0px', label: 'Droit' },
                            { key: '4px', label: 'Fin' },
                            { key: '8px', label: 'Moyen' },
                            { key: '16px', label: 'Large' },
                          ].map(({ key, label }) => (
                            <button key={key} onClick={() => setBorderRadius(key)}
                              className={`flex-1 py-2 rounded-xl border text-[10px] font-medium transition-all ${borderRadius === key ? 'border-[#00C896] bg-[#00C896]/10 text-[#00C896]' : 'border-gray-200 text-[#777777] hover:border-gray-300'}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECTIONS */}
                  {activeTab === 'sections' && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-gray-200" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">Ordre des sections</span>
                        <div className="h-px flex-1 bg-gray-200" />
                      </div>
                      <p className="text-xs text-[#777777] mb-4 leading-relaxed">Glissez-déposez pour réorganiser votre CV</p>
                      <DndList sections={template?.sections || []} onMove={moveSection} selectedIndex={selected ?? undefined} onSelect={setSelected} />
                    </div>
                  )}

                  {/* AI */}
                  {activeTab === 'ai' && (
                    <div className="space-y-4">
                      <div className="rounded-2xl overflow-hidden border border-[#00C896]/20 bg-gradient-to-br from-[#00C896]/10 to-[#66E1B5]/10">
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">✨</span>
                            <h3 className="text-sm font-bold text-[#00C896]">Génération IA</h3>
                          </div>
                          <p className="text-xs text-[#1c1c1c] leading-relaxed mb-4">Décrivez votre profil, l'IA rédige votre CV.</p>
                          <textarea
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[#1c1c1c] text-xs focus:outline-none focus:border-[#00C896] transition-colors resize-none placeholder-[#777777] mb-3"
                            rows={4}
                            placeholder="Ex: Manager commercial, 10 ans d'expérience B2B..."
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                          />
                          <button
                            className="w-full py-2.5 rounded-xl bg-[#00C896] hover:bg-[#66E1B5] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            onClick={handleGenerateAI} disabled={genLoading}>
                            {genLoading
                              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Génération...</>
                              : '✨ Générer mon CV'
                            }
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                        <h4 className="text-xs font-bold text-[#1c1c1c] mb-3">💡 Conseils</h4>
                        <ul className="text-xs text-[#777777] space-y-2">
                          {["Mentionnez votre secteur d'activité", "Indiquez vos années d'expérience", "Précisez vos compétences clés", "Ajoutez le type de poste visé"].map((tip, i) => (
                            <li key={i} className="flex items-start gap-2"><span className="text-[#00C896] mt-0.5 shrink-0">›</span>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </aside>

        {/* ═══ PREVIEW ═══ */}
        <main className={`${viewMode === 'preview' ? 'flex' : 'hidden md:flex'} flex-1 flex flex-col overflow-hidden bg-[#e5e5e5]`}>
          {/* Toolbar */}
          <div className="h-10 flex items-center justify-between px-4 bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[11px] text-[#777777] font-medium ml-1 hidden sm:block">Aperçu A4 — Rendu temps réel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#777777] hidden sm:block">Zoom</span>
              <input type="range" min="40" max="100" value={previewScale * 100}
                onChange={e => setPreviewScale(parseInt(e.target.value) / 100)}
                className="w-20 accent-[#00C896] hidden sm:block" />
              <span className="text-[10px] font-mono text-[#777777] bg-gray-100 px-1.5 py-0.5 rounded">{Math.round(previewScale * 100)}%</span>
            </div>
          </div>

          {/* Canvas — React-based live rendering */}
          <div ref={previewContainerRef} className="flex-1 overflow-auto flex justify-center items-start px-4 sm:px-8 pb-4 sm:pb-8 pt-2"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {template && data && reactTemplateConfig ? (
              <div
                className="transition-all duration-300 ease-in-out"
                style={{
                  width: `${210 * previewScale}mm`,
                  minHeight: `${297 * previewScale}mm`,
                  position: 'relative'
                }}
              >
                <div
                  className="shadow-2xl shadow-black/80 origin-top-left bg-white"
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <CVTemplateRenderer
                    templateName={template.templateName}
                    data={data}
                    config={reactTemplateConfig as any}
                    apiBaseUrl={config.apiBaseUrl}
                  />
                </div>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center text-center gap-3 mt-20 px-6 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-2xl">⚠️</div>
                <div>
                  <p className="text-sm font-semibold text-red-500">Erreur de rendu</p>
                  <p className="text-xs text-[#777777] mt-1">{previewError}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 mt-24">
                <div className="w-10 h-10 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#777777]">Chargement de l'aperçu...</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ═══ MOBILE BOTTOM BAR ═══ */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-3 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200">
          <button onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'edit' ? 'bg-[#00C896] text-white' : 'text-[#777777]'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Éditer
          </button>
          <button onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'preview' ? 'bg-[#00C896] text-white' : 'text-[#777777]'}`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Aperçu
          </button>
        </div>

        <div className="flex items-center gap-2">
          {session && (
            <button onClick={() => saveResume(false)} disabled={isSaving || isSaved}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-[#1c1c1c] disabled:opacity-40 hover:bg-gray-100 transition-all">
              {isSaving
                ? <div className="w-3.5 h-3.5 border border-[#00C896] border-t-transparent rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              }
            </button>
          )}
          <button onClick={() => handleExportPdf()} disabled={!template || !data || !!exporting}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white bg-[#00C896] hover:bg-[#66E1B5] transition-all disabled:opacity-40 shadow-lg shadow-[#00C896]/25">
            {exporting === 'pdf'
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            }
            PDF
          </button>
        </div>
      </div>

      <DownloadFlowModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onSuccess={async (guestData) => {
          console.log("onSuccess callback triggered in EditorPage", guestData)
          setShowDownloadModal(false)
          setHasTemplateAccess(true)  // Grant access after payment
          toast.success("Paiement confirmé ! Préparation de votre téléchargement...")
          
          if (pendingExport === 'pdf') {
             console.log("Triggering pending PDF export")
             await handleExportPdf(true, { email: guestData.email, name: guestData.name }, guestData.plan)
          } else if (pendingExport === 'docx') {
             console.log("Triggering pending DOCX export")
             await handleExportDocx(true, { email: guestData.email, name: guestData.name }, guestData.plan)
          }
          console.log("onSuccess flow completed")
          setPendingExport(null)
        }}
        templatePrice={(template as any)?.price || "2000"}
        templateName={(template as any)?.name || "Modèle Premium"}
      />
    </div>
  )
}
