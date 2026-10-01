"use client"
import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { useEditorStore } from '@/store/editor'
import { generateSummaryAI, generateExperienceBulletsAI } from '@/lib/api'
import { toast } from 'react-hot-toast'
import MasterProfileSelector from './MasterProfileSelector'

export default function ContentEditor({ wizardStep }: { wizardStep?: number }) {
  const { template, data, setData } = useEditorStore()

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [generatingExpIndex, setGeneratingExpIndex] = useState<number | null>(null)

  const stepToTab: Record<number, any> = useMemo(() => {
    if (data?.doc_type === 'cover_letter') {
      return {
        0: 'profile',
        1: 'recipient',
        2: 'letter_body'
      }
    }
    return {
      0: 'profile',
      1: 'experience',
      2: 'education',
      3: 'skills',
      4: 'languages'
    }
  }, [data?.doc_type])

  const [activeTab, setActiveTab] = useState<'profile' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'interests' | 'sections' | 'recipient' | 'letter_body'>(
    wizardStep !== undefined ? stepToTab[wizardStep] : 'profile'
  )

  // Sync tab with wizard step if changed externally
  React.useEffect(() => {
    if (wizardStep !== undefined) {
      setActiveTab(stepToTab[wizardStep])
    }
  }, [wizardStep, stepToTab])

  // Auto-migrate legacy dates from DB to start/end fields
  React.useEffect(() => {
    if (!data) return
    let changed = false
    const newData = JSON.parse(JSON.stringify(data))

    const migrateItem = (item: any) => {
      if (!item.start && !item.end && (item.dates || item.year)) {
        const dateStr = item.dates || item.year.toString()
        const parts = dateStr.split(/[-–—]| à /).map((s: string) => s.trim())
        item.start = parts[0] || ''
        item.end = parts[1] || ''
        // Clear legacy to avoid template priority conflict
        delete item.dates
        delete item.year
        changed = true
      }
    }

    newData.experience?.forEach(migrateItem)
    newData.education?.forEach(migrateItem)

    if (changed) {
      setData(newData)
    }
  }, [data, setData]) // Only run when these arrays change

  if (!data) {
    return (
      <div className="text-sm text-[#777777] p-4">
        Chargez des données pour commencer l&apos;édition
      </div>
    )
  }

  const updateProfile = (key: string, value: string) => {
    setData({
      ...data,
      profile: { ...data.profile, [key]: value }
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop lourde (max 2 Mo)")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      updateProfile('photo', base64)
    }
    reader.readAsDataURL(file)
  }

  const updateSummary = (value: string) => {
    setData({ ...data, summary: value })
  }

  const handleGenerateSummary = async () => {
    const role = data.profile?.title || 'Professionnel'
    setIsGeneratingSummary(true)
    toast.loading('Rédaction du résumé par l\'IA...', { id: 'ai-summary' })
    try {
      const summary = await generateSummaryAI(role, data.summary)
      if (summary) {
        updateSummary(summary)
        toast.success('Résumé généré avec succès !', { id: 'ai-summary' })
      } else {
        toast.error('Génération temporairement indisponible.', { id: 'ai-summary' })
      }
    } catch {
      toast.error('Erreur lors de la génération IA', { id: 'ai-summary' })
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleEnhanceExperience = async (index: number) => {
    const exp = data.experience?.[index]
    if (!exp) return
    const role = exp.position || 'Poste'
    const company = exp.company || 'Entreprise'
    setGeneratingExpIndex(index)
    toast.loading(`Optimisation des réalisations (${role})...`, { id: `ai-exp-${index}` })
    try {
      const bullets = await generateExperienceBulletsAI(role, company)
      if (bullets && bullets.length > 0) {
        updateExperience(index, 'bullets', bullets)
        toast.success('Réalisations optimisées avec succès !', { id: `ai-exp-${index}` })
      } else {
        toast.error('Génération non disponible.', { id: `ai-exp-${index}` })
      }
    } catch {
      toast.error('Erreur lors de la génération IA', { id: `ai-exp-${index}` })
    } finally {
      setGeneratingExpIndex(null)
    }
  }

  const addExperience = () => {
    setData({
      ...data,
      experience: [
        ...(data.experience || []),
        { company: 'Nouvelle entreprise', position: 'Poste', start: '2024', end: 'Présent', bullets: ['Réalisation'] }
      ]
    })
  }

  const updateExperience = (index: number, field: string, value: any) => {
    const experiences = [...(data.experience || [])]
    const updated = { ...experiences[index], [field]: value }
    if (field === 'start' || field === 'end') {
      delete (updated as Record<string, unknown>).dates
      delete (updated as Record<string, unknown>).year
    }
    experiences[index] = updated
    setData({ ...data, experience: experiences })
  }

  const deleteExperience = (index: number) => {
    const experiences = [...(data.experience || [])]
    experiences.splice(index, 1)
    setData({ ...data, experience: experiences })
  }

  const addEducation = () => {
    setData({
      ...data,
      education: [
        ...(data.education || []),
        { institution: 'Nouvelle école', degree: 'Diplôme', start: '2020', end: '2023' }
      ]
    })
  }

  const updateEducation = (index: number, field: string, value: any) => {
    const education = [...(data.education || [])]
    const updated = { ...education[index], [field]: value }
    if (field === 'start' || field === 'end') {
      delete (updated as Record<string, unknown>).dates
      delete (updated as Record<string, unknown>).year
    }
    education[index] = updated
    setData({ ...data, education })
  }

  const deleteEducation = (index: number) => {
    const education = [...(data.education || [])]
    education.splice(index, 1)
    setData({ ...data, education })
  }

  const addSkillGroup = () => {
    setData({
      ...data,
      skills: {
        groups: [
          ...(data.skills?.groups || []),
          { label: 'Nouvelle catégorie', items: ['Compétence'] }
        ]
      }
    })
  }

  const updateSkillGroup = (index: number, field: string, value: any) => {
    const groups = [...(data.skills?.groups || [])]
    groups[index] = { ...groups[index], [field]: value }
    setData({ ...data, skills: { groups } })
  }

  const deleteSkillGroup = (index: number) => {
    const groups = [...(data.skills?.groups || [])]
    groups.splice(index, 1)
    setData({ ...data, skills: { groups } })
  }

  const addLanguage = () => {
    setData({
      ...data,
      languages: [
        ...(data.languages || []),
        { name: 'Nouvelle langue', level: 'Intermédiaire' }
      ]
    })
  }

  const updateLanguage = (index: number, field: string, value: any) => {
    const languages = [...(data.languages || [])]
    languages[index] = { ...languages[index], [field]: value }
    setData({ ...data, languages })
  }

  const deleteLanguage = (index: number) => {
    const languages = [...(data.languages || [])]
    languages.splice(index, 1)
    setData({ ...data, languages })
  }

  const addInterest = () => {
    setData({
      ...data,
      interests: [...(data.interests || []), 'Nouveau loisir']
    })
  }

  const updateInterest = (index: number, value: string) => {
    const interests = [...(data.interests || [])]
    interests[index] = value
    setData({ ...data, interests })
  }

  const deleteInterest = (index: number) => {
    const interests = [...(data.interests || [])]
    interests.splice(index, 1)
    setData({ ...data, interests })
  }

  return (
    <div className="space-y-4">
      {wizardStep === undefined && (
        <div className="flex gap-2 border-b-0 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
          {(!data.doc_type || data.doc_type === 'cv') && template?.sections.map((section, idx) => {
            if (!section.enabled) return null
            let tab = section.type
            if (tab === 'projects') tab = 'projects'
            else if (tab.startsWith('custom_')) tab = 'sections'
            if (!['profile', 'summary', 'experience', 'education', 'skills', 'languages', 'projects', 'interests', 'sections'].includes(tab)) return null

            const getTabIcon = (t: string) => {
              switch (t) {
                case 'profile': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
                case 'summary': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
                case 'experience': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
                case 'education': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>;
                case 'skills': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
                case 'languages': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
                case 'projects': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
                case 'interests': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
                case 'sections': return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
                default: return null;
              }
            };
            
            const getTabLabel = (t: string) => {
              switch (t) {
                case 'profile': return 'Profil';
                case 'summary': return 'Résumé';
                case 'experience': return 'Expérience';
                case 'education': return 'Formation';
                case 'skills': return 'Compétences';
                case 'languages': return 'Langues';
                case 'projects': return 'Projets';
                case 'interests': return 'Loisirs';
                case 'sections': return 'Sections';
                default: return '';
              }
            };

            return (
              <button
                key={idx}
                onClick={() => {
                  if (wizardStep === undefined) setActiveTab(tab as typeof activeTab)
                }}
                disabled={wizardStep !== undefined}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-[10px] font-bold transition-all border min-w-[70px] ${
                  activeTab === tab
                    ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20 shadow-sm'
                    : 'bg-white text-[#777777] border-transparent hover:bg-gray-50 hover:text-[#1c1c1c]'
                }`}
              >
                {getTabIcon(tab)}
                {getTabLabel(tab)}
              </button>
            )
          })}
          
          {data.doc_type === 'cover_letter' && ['profile', 'recipient', 'letter_body'].map((tab, idx) => {
            return (
              <button
                key={idx}
                onClick={() => {
                  if (wizardStep === undefined) setActiveTab(tab as typeof activeTab)
                }}
                disabled={wizardStep !== undefined}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-[10px] font-bold transition-all border min-w-[70px] ${
                  activeTab === tab
                    ? 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/20 shadow-sm'
                    : 'bg-white text-[#777777] border-transparent hover:bg-gray-50 hover:text-[#1c1c1c]'
                }`}
              >
                {tab === 'profile' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                {tab === 'recipient' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                {tab === 'letter_body' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" /></svg>}
                {tab === 'profile' && 'Expéditeur'}
                {tab === 'recipient' && 'Destinataire'}
                {tab === 'letter_body' && 'Contenu'}
              </button>
            )
          })}
        </div>
      )}

      <div className={`pr-1 space-y-4 thin-scrollbar ${wizardStep === undefined ? 'max-h-[50dvh] md:max-h-[600px] overflow-y-auto' : ''}`}>
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#00C896]">
                  {data.profile?.photo ? (
                    <Image 
                      src={data.profile.photo} 
                      alt="Profile" 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <label className="absolute inset-0 cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1c1c1c] mb-1">Photo de profil</h4>
                <p className="text-[10px] text-[#777777] leading-tight">Cliquez sur le cadre pour uploader.<br />Format JPG, PNG (max 2Mo).</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Nom complet</label>
                <input
                  type="text"
                  value={data.profile?.name || ''}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Titre du profil</label>
                <input
                  type="text"
                  value={data.profile?.title || ''}
                  onChange={(e) => updateProfile('title', e.target.value)}
                  placeholder="ex: Comptable Senior"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>

              {/* Champs Spécifiques Afrique de l'Ouest */}
              <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold text-[#00C896] mb-2 uppercase tracking-tight">Détails (Marché Africain)</p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Âge</label>
                <input
                  type="text"
                  value={data.profile?.age || ''}
                  onChange={(e) => updateProfile('age', e.target.value)}
                  placeholder="32 ans"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Nationalité</label>
                <input
                  type="text"
                  value={data.profile?.nationality || ''}
                  onChange={(e) => updateProfile('nationality', e.target.value)}
                  placeholder="Sénégalaise"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">État Civil</label>
                <input
                  type="text"
                  value={data.profile?.marital_status || ''}
                  onChange={(e) => updateProfile('marital_status', e.target.value)}
                  placeholder="Marié, 2 enfants"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>

              <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold text-[#777777] mb-2 uppercase tracking-tight">Coordonnées</p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Email</label>
                <input
                  type="email"
                  value={data.profile?.email || ''}
                  onChange={(e) => updateProfile('email', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Téléphone</label>
                <input
                  type="text"
                  value={data.profile?.phone || ''}
                  onChange={(e) => updateProfile('phone', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Localisation</label>
                <input
                  type="text"
                  value={data.profile?.location || ''}
                  onChange={(e) => updateProfile('location', e.target.value)}
                  placeholder="Dakar, Sénégal"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={data.profile?.linkedin || ''}
                  onChange={(e) => updateProfile('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/profil"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-[#777777]">Résumé professionnel (Profil)</label>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                {isGeneratingSummary ? (
                  <>
                    <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rédaction IA...
                  </>
                ) : (
                  <>✨ Rédiger avec l&apos;IA</>
                )}
              </button>
            </div>
            <textarea
              value={data.summary || ''}
              onChange={(e) => updateSummary(e.target.value)}
              rows={8}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none resize-none"
              placeholder="Décrivez votre parcours et vos points forts, ou cliquez sur 'Rédiger avec l'IA' pour générer un texte captivant..."
            />
            <p className="text-[11px] text-gray-400 italic">
              💡 Astuce : Renseignez au préalable votre titre de profil dans l&apos;onglet Profil pour une suggestion encore plus ciblée.
            </p>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-4">
            <MasterProfileSelector type="experience" />
            <button
              onClick={addExperience}
              className="w-full px-3 py-2 rounded-lg bg-[#00C896] hover:bg-[#66E1B5] text-white text-xs font-bold transition-colors"
            >
              + AJOUTER UNE EXPÉRIENCE
            </button>
            {(data.experience || []).map((exp: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <span className="text-[10px] font-black text-[#00C896] uppercase">Expérience #{idx + 1}</span>
                  <button
                    onClick={() => deleteExperience(idx)}
                    className="text-red-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] uppercase">Entreprise</label>
                    <input
                      type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] uppercase">Poste occupé</label>
                    <input
                      type="text"
                      value={exp.role || exp.position || ''}
                      onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#777777] uppercase">Début</label>
                      <input
                        type="text"
                        value={exp.start || ''}
                        onChange={(e) => updateExperience(idx, 'start', e.target.value)}
                        placeholder="MM/AAAA"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#777777] uppercase">Fin</label>
                      <input
                        type="text"
                        value={exp.end || ''}
                        onChange={(e) => updateExperience(idx, 'end', e.target.value)}
                        placeholder="Présent"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-bold text-[#777777] uppercase">Missions &amp; Réalisations</label>
                      <button
                        type="button"
                        onClick={() => handleEnhanceExperience(idx)}
                        disabled={generatingExpIndex === idx}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors disabled:opacity-50"
                      >
                        {generatingExpIndex === idx ? (
                          <>
                            <span className="w-2 h-2 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            Génération IA...
                          </>
                        ) : (
                          <>✨ Réalisations IA</>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={(exp.bullets || exp.tasks || []).join('\n')}
                      onChange={(e) => updateExperience(idx, 'bullets', e.target.value.split('\n'))}
                      placeholder="Une réalisation par ligne..."
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4">
            <MasterProfileSelector type="education" />
            <button
              onClick={addEducation}
              className="w-full px-3 py-2 rounded-lg bg-[#00C896] hover:bg-[#66E1B5] text-white text-xs font-bold transition-colors"
            >
              + AJOUTER UNE FORMATION
            </button>
            {(data.education || []).map((edu: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <span className="text-[10px] font-black text-[#00C896] uppercase">Diplôme #{idx + 1}</span>
                  <button
                    onClick={() => deleteEducation(idx)}
                    className="text-red-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] uppercase">Institution / École</label>
                    <input
                      type="text"
                      value={edu.institution || edu.school || ''}
                      onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#777777] uppercase">Diplôme obtenu</label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#777777] uppercase">Début</label>
                      <input
                        type="text"
                        value={edu.start || ''}
                        onChange={(e) => updateEducation(idx, 'start', e.target.value)}
                        placeholder="2020"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#777777] uppercase">Fin</label>
                      <input
                        type="text"
                        value={edu.end || ''}
                        onChange={(e) => updateEducation(idx, 'end', e.target.value)}
                        placeholder="2023"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <button
              onClick={addSkillGroup}
              className="w-full px-3 py-2 rounded-lg bg-[#00C896] hover:bg-[#66E1B5] text-white text-xs font-bold transition-colors"
            >
              + AJOUTER UNE CATÉGORIE
            </button>
            {(data.skills?.groups || []).map((group: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <span className="text-[10px] font-black text-[#00C896] uppercase">Compétences #{idx + 1}</span>
                  <button
                    onClick={() => deleteSkillGroup(idx)}
                    className="text-red-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <input
                  type="text"
                  value={group.label || ''}
                  onChange={(e) => updateSkillGroup(idx, 'label', e.target.value)}
                  placeholder="ex: Langages de programmation"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                />
                <textarea
                  value={(group.items || []).join('\n')}
                  onChange={(e) => updateSkillGroup(idx, 'items', e.target.value.split('\n').filter(s => s.trim()))}
                  placeholder="Une par ligne (ex: React)"
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none resize-none"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'languages' && (
          <div className="space-y-4">
            <button
              onClick={addLanguage}
              className="w-full px-3 py-2 rounded-lg bg-[#00C896] hover:bg-[#66E1B5] text-white text-xs font-bold transition-colors"
            >
              + AJOUTER UNE LANGUE
            </button>
            {(data.languages || []).map((lang: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl p-3 flex gap-3 border border-gray-200 shadow-sm items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#777777] uppercase">Langue</label>
                  <input
                    type="text"
                    value={lang.name || ''}
                    onChange={(e) => updateLanguage(idx, 'name', e.target.value)}
                    placeholder="ex: Français"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-[#777777] uppercase">Niveau</label>
                  <input
                    type="text"
                    value={lang.level || ''}
                    onChange={(e) => updateLanguage(idx, 'level', e.target.value)}
                    placeholder="ex: Natif"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                  />
                </div>
                <button
                  onClick={() => deleteLanguage(idx)}
                  className="text-red-400 hover:text-red-500 transition-colors p-2 mb-0.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <button
              onClick={() => {
                useEditorStore.getState().toggleSection('projects', true);
                setData({ ...data, projects: [...(data.projects || []), { name: 'Nouveau Projet', description: 'Description...', link: '' }] });
              }}
              className="w-full px-3 py-2 rounded-lg bg-[#00C896] hover:bg-[#66E1B5] text-white text-xs font-bold transition-colors"
            >
              + AJOUTER UN PROJET
            </button>
            {(data.projects || []).map((p: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl p-4 space-y-3 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <span className="text-[10px] font-black text-[#00C896] uppercase">Projet #{idx + 1}</span>
                  <button
                    onClick={() => {
                      const projects = [...(data.projects || [])]; projects.splice(idx, 1); setData({ ...data, projects });
                    }}
                    className="text-red-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={p.name || ''}
                    onChange={(e) => {
                      const projects = [...(data.projects || [])]; projects[idx].name = e.target.value; setData({ ...data, projects });
                    }}
                    placeholder="Nom du projet"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                  />
                  <input
                    type="text"
                    value={p.link || ''}
                    onChange={(e) => {
                      const projects = [...(data.projects || [])]; projects[idx].link = e.target.value; setData({ ...data, projects });
                    }}
                    placeholder="Lien (optionnel)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-xs focus:ring-1 focus:ring-[#00C896] outline-none"
                  />
                  <textarea
                    value={p.description || ''}
                    onChange={(e) => {
                      const projects = [...(data.projects || [])]; projects[idx].description = e.target.value; setData({ ...data, projects });
                    }}
                    placeholder="Description du projet..."
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interests' && (
          <div className="space-y-4">
            <button
              onClick={addInterest}
              className="w-full px-3 py-2 rounded-lg bg-[#00C896] hover:bg-[#66E1B5] text-white text-xs font-bold transition-colors"
            >
              + AJOUTER UN CENTRE D&apos;INTÉRÊT
            </button>
            <div className="grid grid-cols-1 gap-2">
              {(data.interests || []).map((interest: string, idx: number) => (
                <div key={idx} className="bg-white rounded-xl p-3 flex gap-3 border border-gray-200 shadow-sm items-center">
                  <input
                    type="text"
                    value={interest || ''}
                    onChange={(e) => updateInterest(idx, e.target.value)}
                    placeholder="ex: Photographie"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[#1c1c1c] text-sm focus:ring-1 focus:ring-[#00C896] outline-none"
                  />
                  <button
                    onClick={() => deleteInterest(idx)}
                    className="text-red-400 hover:text-red-500 transition-colors p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50/50 border border-[#00C896]/20 rounded-xl">
              <h4 className="text-xs font-bold text-[#00C896] uppercase mb-3 flex items-center gap-2">
                <i className="fas fa-layer-group"></i> Visibilité & Titres
              </h4>
              <div className="space-y-3">
                {(template?.sections || []).map((section: any) => (
                  <div key={section.type} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <button
                      onClick={() => useEditorStore.getState().toggleSection(section.type, !section.enabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${section.enabled ? 'bg-[#00C896]' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${section.enabled ? 'left-6' : 'left-1'}`} />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={section.label}
                        onChange={(e) => useEditorStore.getState().updateSectionLabel(section.type, e.target.value)}
                        className={`bg-transparent text-sm font-medium w-full text-[#1c1c1c] focus:ring-1 focus:ring-[#00C896] rounded px-1 -ml-1 transition-all ${!section.enabled ? 'opacity-50 grayscale' : ''}`}
                      />
                      <div className="text-[9px] text-[#777777] uppercase mt-0.5">{section.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <h4 className="text-xs font-bold text-[#1c1c1c] uppercase mb-4">+ Ajouter une section personnalisée</h4>
              <div className="space-y-3">
                <input
                  id="new-section-title"
                  type="text"
                  placeholder="Titre de la section (ex: Certifications)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm outline-none focus:ring-1 focus:ring-[#00C896]"
                />
                <select id="new-section-type" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm outline-none focus:ring-1 focus:ring-[#00C896]">
                  <option value="text">Texte libre (paragraphes)</option>
                  <option value="list">Liste à puces (une par ligne)</option>
                </select>
                <button
                  onClick={() => {
                    const titleInput = document.getElementById('new-section-title') as HTMLInputElement;
                    const typeSelect = document.getElementById('new-section-type') as HTMLSelectElement;
                    if (!titleInput.value) return;
                    useEditorStore.getState().addCustomSection({
                      id: Math.random().toString(36).substr(2, 9),
                      title: titleInput.value,
                      content: '',
                      type: typeSelect.value as 'text' | 'list'
                    });
                    titleInput.value = '';
                  }}
                  className="w-full py-2 bg-[#00C896] hover:bg-[#66E1B5] text-white rounded-lg text-xs font-bold transition-all"
                >
                  CRÉER LA SECTION
                </button>
              </div>
            </div>

            {/* Editing Custom Sections Content */}
            {(data.custom_sections || []).length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-[10px] font-black text-[#777777] uppercase">Contenu des Sections Personnalisées</h4>
                {data.custom_sections?.map((cs: any, idx: number) => (
                  <div key={cs.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-[#1c1c1c]">{cs.title}</span>
                       <button onClick={() => {
                         const cs_list = [...(data.custom_sections || [])]; cs_list.splice(idx,1); setData({...data, custom_sections: cs_list});
                       }} className="text-red-500 hover:scale-110 transition-transform"><i className="fas fa-trash"></i></button>
                    </div>
                    <textarea
                      value={cs.content}
                      onChange={(e) => {
                        const cs_list = [...(data.custom_sections || [])]; cs_list[idx].content = e.target.value; setData({...data, custom_sections: cs_list});
                      }}
                      rows={4}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm outline-none resize-none focus:ring-1 focus:ring-[#00C896]"
                      placeholder={cs.type === 'list' ? "Une puce par ligne..." : "Saisissez votre texte..."}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'recipient' && (
          <div className="space-y-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Nom de l'entreprise</label>
              <input
                type="text"
                value={data.recipient?.company_name || ''}
                onChange={(e) => setData({ ...data, recipient: { ...data.recipient, company_name: e.target.value } })}
                placeholder="ex: Tech Solutions SAS"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Nom du contact</label>
              <input
                type="text"
                value={data.recipient?.contact_name || ''}
                onChange={(e) => setData({ ...data, recipient: { ...data.recipient, contact_name: e.target.value } })}
                placeholder="ex: M. Jean Dupont"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Titre du contact (optionnel)</label>
              <input
                type="text"
                value={data.recipient?.contact_title || ''}
                onChange={(e) => setData({ ...data, recipient: { ...data.recipient, contact_title: e.target.value } })}
                placeholder="ex: DRH"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Adresse de l'entreprise</label>
              <textarea
                value={data.recipient?.address || ''}
                onChange={(e) => setData({ ...data, recipient: { ...data.recipient, address: e.target.value } })}
                placeholder="ex: 123 Rue de la République..."
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'letter_body' && (
          <div className="space-y-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Objet</label>
              <input
                type="text"
                value={data.letter_body?.subject || ''}
                onChange={(e) => setData({ ...data, letter_body: { ...data.letter_body, subject: e.target.value } })}
                placeholder="ex: Candidature au poste de Développeur Frontend"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Date et Lieu (optionnel)</label>
              <input
                type="text"
                value={data.letter_body?.date_location || ''}
                onChange={(e) => setData({ ...data, letter_body: { ...data.letter_body, date_location: e.target.value } })}
                placeholder="ex: Cotonou, le 15 Septembre 2026"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Formule d'appel</label>
              <input
                type="text"
                value={data.letter_body?.opening || ''}
                onChange={(e) => setData({ ...data, letter_body: { ...data.letter_body, opening: e.target.value } })}
                placeholder="ex: Madame, Monsieur,"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Corps de la lettre</label>
              <textarea
                value={data.letter_body?.body || ''}
                onChange={(e) => setData({ ...data, letter_body: { ...data.letter_body, body: e.target.value } })}
                placeholder="Rédigez le contenu de votre lettre de motivation..."
                rows={12}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none resize-none leading-relaxed"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-[#777777] block mb-1">Formule de politesse (Clôture)</label>
              <input
                type="text"
                value={data.letter_body?.closing || ''}
                onChange={(e) => setData({ ...data, letter_body: { ...data.letter_body, closing: e.target.value } })}
                placeholder="ex: Je vous prie d'agréer..."
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[#1c1c1c] text-sm focus:ring-2 focus:ring-[#00C896] outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
