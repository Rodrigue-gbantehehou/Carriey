"use client"
import React, { useMemo } from 'react'

export type StyleInput = Partial<{ align: string; color: string; size: number }>

export default function StylePanel({ selectedIndex, onChange }: { selectedIndex: number | null | undefined, onChange: (style: StyleInput) => void }) {
  const disabled = useMemo(() => selectedIndex == null, [selectedIndex])

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">Style de la section {selectedIndex!=null ? `#${selectedIndex+1}` : ''}</div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Alignement</label>
          <select disabled={disabled} className="bg-slate-800 border border-slate-700 rounded px-2 py-1" onChange={(e)=>onChange({ align: e.target.value })}>
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Couleur (hex)</label>
          <input disabled={disabled} type="text" placeholder="#111827" className="bg-slate-800 border border-slate-700 rounded px-2 py-1" onBlur={(e)=>onChange({ color: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Taille (px)</label>
          <input disabled={disabled} type="number" min={10} max={28} className="bg-slate-800 border border-slate-700 rounded px-2 py-1" onChange={(e)=>onChange({ size: parseInt(e.target.value||'0', 10) || undefined })} />
        </div>
      </div>
      {disabled && <div className="text-xs text-slate-500">Sélectionnez une section pour modifier son style.</div>}
    </div>
  )
}
