"use client"
import React, { useEffect, useState } from 'react'
import { useEditorStore, Template } from '../../store/editor'
import { API_BASE } from '../../lib/api'

export default function Selectors() {
  const { setTemplate, setData } = useEditorStore()
  const [templates, setTemplates] = useState<string[]>([])
  const [datasets] = useState([
    { label: 'Marlyse', path: 'data/resume_marlyse.json' },
    { label: 'Nevil', path: 'data/resume_nevil.json' }
  ])

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch(`${API_BASE}/templates`)
        if (!res.ok) throw new Error(await res.text())
        const json = await res.json()
        setTemplates(json.templates) // ["moderne", "classique", ...]
        // Auto-load first template
        if (json.templates && json.templates.length > 0) {
          loadTemplate(json.templates[0])
        }
      } catch (e) {
        console.error("Erreur fetch templates", e)
      }
    }
    fetchTemplates()
    // Auto-load first dataset
    if (datasets && datasets.length > 0) {
      loadData(datasets[0].path)
    }
  }, [])

  async function loadTemplate(name: string) {
    try {
      const res = await fetch(`${API_BASE}/templates/${name}`)
      if (!res.ok) throw new Error(await res.text())
      const json: Template = await res.json()
      setTemplate(json)
    } catch (e) {
      console.error("[selectors] Erreur chargement template", e)
      alert(`Erreur chargement template: ${e}`)
    }
  }

  async function loadData(path: string) {
    try {
      const res = await fetch(`${API_BASE}/static/${path}`)
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error("[selectors] Erreur chargement données", e)
      alert(`Erreur chargement données: ${e}`)
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">Sources</div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400">Template</label>
        <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1" onChange={(e)=>loadTemplate(e.target.value)} defaultValue={templates[0]}>
          {templates.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label className="text-xs text-slate-400">Données</label>
        <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1" onChange={(e)=>loadData(e.target.value)} defaultValue={datasets[0]?.path}>
          {datasets.map(d => <option key={d.path} value={d.path}>{d.label}</option>)}
        </select>
      </div>
    </div>
  )
}
