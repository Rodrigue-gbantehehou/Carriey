"use client"
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useEditorStore } from '../../store/editor'

export default function SaveLoadPanel() {
  const { template, data, setTemplate, setData } = useEditorStore()
  const [tplName, setTplName] = useState('Mon template')
  const [cvTitle, setCvTitle] = useState('Mon CV')
  const [templates, setTemplates] = useState<any[]>([])
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const disabled = !supabase

  async function refreshLists() {
    if (!supabase) return
    setLoading(true)
    try {
      const { data: tdata } = await supabase.from('templates').select('id,name,definition,is_system').order('created_at', { ascending: false })
      setTemplates(tdata || [])
      const { data: rdata } = await supabase.from('resumes').select('id,title,content').order('created_at', { ascending: false })
      setResumes(rdata || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { refreshLists() }, [])

  async function saveTemplate() {
    if (!supabase || !template) return
    setLoading(true)
    try {
      await supabase.from('templates').insert({ name: tplName, definition: template, is_system: false })
      await refreshLists()
    } finally { setLoading(false) }
  }

  async function saveResume() {
    if (!supabase || !data || !template) return
    setLoading(true)
    try {
      await supabase.from('resumes').insert({ title: cvTitle, content: data })
      await refreshLists()
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Persistance (Supabase)</div>
      {!supabase && <div className="text-xs text-amber-400">Configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY pour activer la sauvegarde.</div>}

      <div className="grid grid-cols-1 gap-2">
        <div className="flex gap-2 items-center">
          <input disabled={disabled} className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm" value={tplName} onChange={e=>setTplName(e.target.value)} />
          <button disabled={disabled||!template||loading} className="px-3 py-1.5 rounded bg-sky-700 disabled:opacity-50" onClick={saveTemplate}>Sauver Template</button>
        </div>
        <div className="flex gap-2 items-center">
          <input disabled={disabled} className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm" value={cvTitle} onChange={e=>setCvTitle(e.target.value)} />
          <button disabled={disabled||!data||loading} className="px-3 py-1.5 rounded bg-teal-700 disabled:opacity-50" onClick={saveResume}>Sauver CV</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div>
          <div className="text-xs text-slate-400 mb-1">Charger Template</div>
          <select disabled={disabled||loading} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm" onChange={async (e)=>{
            const id = e.target.value; if (!id) return
            const row = templates.find(t=>String(t.id)===id)
            if (row?.definition) setTemplate(row.definition)
          }}>
            <option value="">—</option>
            {templates.map(t=> (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Charger CV</div>
          <select disabled={disabled||loading} className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm" onChange={(e)=>{
            const id = e.target.value; if (!id) return
            const row = resumes.find(r=>String(r.id)===id)
            if (row?.content) setData(row.content)
          }}>
            <option value="">—</option>
            {resumes.map(r=> (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
