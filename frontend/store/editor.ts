"use client"
import { create } from 'zustand'
import type { CVData, TemplateConfig } from '@/types/cv'

export type Section = {
  type: string;
  label: string;
  columns?: number;
  style?: any;
  column?: 'left' | 'right' | 'full' | 'main';
  enabled: boolean; // Mandatory now
  userCanDisable?: boolean;
  userCanMove?: boolean;
}

export type CustomSection = {
  id: string;
  title: string;
  content: string; // HTML/Markdown or JSON
  type: 'text' | 'list';
}

export type Template = {
  id?: string
  slug?: string
  name?: string
  price?: string | number
  templateName: string
  displayName?: string
  market?: string
  fonts?: { heading?: string; body?: string }
  colors?: { primary?: string; secondary?: string; accent?: string }
  layout?: {
    type?: string;
    twoColumn?: boolean;
    sidebarWidth?: string;
    margins?: string;
    photoRequired?: boolean;
  }
  tokens?: {
    colorPrimary?: string;
    colorSecondary?: string;
    colorAccent?: string;
    fontHeading?: string;
    fontBody?: string;
    borderRadius?: string;
    spacing?: 'compact' | 'normal' | 'airy';
    fontSize?: number;
    lineHeight?: number;
    photoShape?: 'circle' | 'square' | 'rounded';
  }
  sections: Section[]
  userCustomizable?: {
    colors?: boolean;
    fonts?: boolean;
    spacing?: boolean;
    sidebarWidth?: boolean;
    sectionOrder?: boolean;
    layout?: boolean;
  }
}

export type OnboardingData = {
  experience: string | null;
  sector: string | null;
  method: 'new' | 'import' | null;
  namePreview: string;
}

// CVData avec champ doc_type et custom_sections éditor
export type ResumeData = CVData & {
  doc_type?: 'cv' | 'cover_letter';
  custom_sections?: CustomSection[];
}


type State = {
  template: Template | null
  templateName: string | null
  templateId: string | null
  data: ResumeData | null
  editMode: 'wizard' | 'expert'
  currentStep: number
  onboardingData: OnboardingData
  setTemplate: (t: Template) => void
  setTemplateName: (name: string) => void
  setData: (d: ResumeData) => void
  setEditMode: (mode: 'wizard' | 'expert') => void
  setStep: (step: number | ((prev: number) => number)) => void
  setOnboardingData: (data: Partial<OnboardingData>) => void
  updateColors: (colors: { primary?: string; secondary?: string; accent?: string }) => void
  updateTokens: (tokens: Partial<NonNullable<Template['tokens']>>) => void
  moveSection: (from: number, to: number) => void
  toggleSection: (type: string, enabled: boolean) => void
  addCustomSection: (section: CustomSection) => void
  updateSectionLabel: (type: string, label: string) => void
  removeSection: (index: number) => void
  selected: number | null
  setSelected: (i: number | null) => void
  updateSectionStyle: (index: number, style: Partial<{ align: string; color: string; size: number }>) => void
}

export const useEditorStore = create<State>((set, get) => ({
  template: null,
  templateName: null,
  templateId: null,
  data: null,
  editMode: 'wizard',
  currentStep: 0,
  onboardingData: {
    experience: null,
    sector: null,
    method: null,
    namePreview: '',
  },

  setTemplate: (t) => set({ template: t, templateName: t.templateName, templateId: t.id || null }),
  setTemplateName: (name) => set({ templateName: name }),
  setData: (d) => set({ data: d }),
  setEditMode: (mode) => set({ editMode: mode }),
  setStep: (step) => set((state) => ({
    currentStep: typeof step === 'function' ? step(state.currentStep) : step
  })),
  setOnboardingData: (data) => set((state) => ({
    onboardingData: { ...state.onboardingData, ...data }
  })),

  updateColors: (colors) => {
    const t = get().template
    if (!t) return
    set({
      template: {
        ...t,
        colors: { ...(t.colors || {}), ...colors },
        tokens: { ...(t.tokens || {}), ...colors } as any
      }
    })
  },

  updateTokens: (tokens) => {
    const t = get().template
    if (!t) return
    set({
      template: {
        ...t,
        tokens: { ...(t.tokens || {}), ...tokens }
      }
    })
  },

  moveSection: (from, to) => {
    const t = get().template
    if (!t) return
    const list = [...t.sections]
    const [item] = list.splice(from, 1)
    list.splice(to, 0, item)
    set({ template: { ...t, sections: list } })
  },

  toggleSection: (type, enabled) => {
    const t = get().template
    if (!t) return
    let found = false
    const list = t.sections.map((s: Section) => {
      if (s.type === type) {
        found = true
        return { ...s, enabled }
      }
      return s
    })
    
    if (!found) {
      list.push({
        type,
        label: type === 'projects' ? 'Projets' : type,
        column: 'main',
        enabled,
        userCanDisable: true,
        userCanMove: true
      })
    }
    
    set({ template: { ...t, sections: list } })
  },

  addCustomSection: (section) => {
    const t = get().template
    const d = get().data
    if (!t || !d) return
    
    // 1. Add to template sections list for rendering
    const newSection: Section = {
      type: `custom_${section.id}`,
      label: section.title,
      column: 'main',
      enabled: true,
      userCanMove: true
    }
    
    // 2. Add data
    const customSections = [...(d.custom_sections || []), section]
    
    set({ 
      template: { ...t, sections: [...t.sections, newSection] },
      data: { ...d, custom_sections: customSections }
    })
  },

  updateSectionLabel: (type, label) => {
    const t = get().template
    if (!t) return
    const list = t.sections.map((s: Section) => 
      s.type === type ? { ...s, label } : s
    )
    set({ template: { ...t, sections: list } })
  },

  removeSection: (index) => {
    const t = get().template
    if (!t) return
    const list = [...t.sections]
    list.splice(index, 1)
    set({ template: { ...t, sections: list } })
  },

  selected: null,
  setSelected: (i) => set({ selected: i }),

  updateSectionStyle: (index, style) => {
    const t = get().template
    if (!t) return
    const list = t.sections.map((s: Section, i: number) =>
      i === index ? { ...s, style: { ...(s.style || {}), ...style } } : s
    )
    set({ template: { ...t, sections: list } })
  }
}))
