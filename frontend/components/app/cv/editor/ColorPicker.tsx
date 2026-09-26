import React from 'react';
import { Check } from 'lucide-react';

export const COLORS = [
  { id: 'default', name: 'Défaut', value: '#4F46E5' }, // Indigo (brand)
  { id: 'blue', name: 'Bleu', value: '#2563EB' },
  { id: 'emerald', name: 'Émeraude', value: '#059669' },
  { id: 'rose', name: 'Rose', value: '#E11D48' },
  { id: 'amber', name: 'Ambre', value: '#D97706' },
  { id: 'slate', name: 'Ardoise', value: '#475569' },
];

export function ColorPicker() {
  return (
    <div className="flex flex-wrap gap-3 opacity-60 pointer-events-none">
      {COLORS.map(c => (
        <div
          key={c.id}
          className="w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-offset-1 ring-transparent"
          style={{ backgroundColor: c.value }}
        >
          {c.id === 'default' && <Check className="w-3 h-3 text-white" />}
        </div>
      ))}
    </div>
  );
}
