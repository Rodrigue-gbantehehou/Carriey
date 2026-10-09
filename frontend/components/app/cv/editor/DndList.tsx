"use client"
import React, { useRef, useEffect, useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

export type Item = { index: number; id: string; label: string; type: string }

function Row({ item, move, selected, onSelect }: { item: Item; move: (from: number, to: number) => void; selected: boolean; onSelect: (i: number) => void }) {
  const ref = useRef<HTMLDivElement | null>(null)

  const [, drop] = useDrop<{ index: number }>(() => ({
    accept: 'SECTION',
    hover(dragItem) {
      if (!ref.current) return
      const from = dragItem.index
      const to = item.index
      if (from === to) return
      move(from, to)
      dragItem.index = to
    }
  }), [item.index, move])

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SECTION',
    item: { index: item.index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [item.index])

  drag(drop(ref))

  return (
    <div ref={ref} onClick={() => onSelect(item.index)} className={`flex items-center justify-between rounded-lg px-3 py-2.5 border cursor-pointer transition-colors ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white hover:bg-background-subtle text-text-primary'} ${isDragging ? 'opacity-50 scale-[0.98]' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="cursor-grab select-none text-text-muted hover:text-primary transition-colors p-1 -ml-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </span>
        <span className="text-sm font-semibold">{item.label} <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest ml-1">({item.type})</span></span>
      </div>
    </div>
  )
}

export default function DndList({ sections, onMove, selectedIndex, onSelect }: { sections: { label: string; type: string }[]; onMove: (from: number, to: number) => void; selectedIndex?: number | null; onSelect?: (i: number) => void }) {
  const [isTouch, setIsTouch] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  if (!mounted) return null // Prevent hydration mismatch

  return (
    <DndProvider backend={isTouch ? TouchBackend : HTML5Backend} options={isTouch ? { enableMouseEvents: true, delayTouchStart: 100 } : undefined}>
      <div className="space-y-2">
        {sections.map((s, idx) => (
          <Row key={`${s.label}-${idx}`} item={{ index: idx, id: `${idx}`, label: s.label, type: s.type }} move={onMove} selected={selectedIndex===idx} onSelect={(i)=>onSelect && onSelect(i)} />
        ))}
      </div>
    </DndProvider>
  )
}
