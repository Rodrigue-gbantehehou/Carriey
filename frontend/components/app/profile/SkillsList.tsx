"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileSkill } from '@/types/profile';
import { Wrench, X, Plus } from 'lucide-react';
import BottomSheet from '@/components/app/shared/BottomSheet';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

const LEVELS = [
  { value: 'Débutant', label: 'Débutant', color: 'bg-gray-100 text-gray-600' },
  { value: 'Intermédiaire', label: 'Intermédiaire', color: 'bg-blue-50 text-blue-700' },
  { value: 'Avancé', label: 'Avancé', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'Expert', label: 'Expert', color: 'bg-purple-50 text-purple-700' },
];

export default function SkillsList() {
  const { profile, addSkill, removeSkill } = useProfileStore();
  const [form, setForm] = useState<Partial<ProfileSkill>>({});
  const [isAdding, setIsAdding] = useState(false);

  const skills = profile?.skills || [];

  const handleAdd = () => {
    if (!form.name?.trim()) return;
    addSkill({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      level: form.level,
    });
    setForm({});
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const getLevelStyle = (level?: string) =>
    LEVELS.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-4">
      {/* Empty state */}
      {skills.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-600">Aucune compétence ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Vos outils, logiciels, langues et soft-skills.</p>
        </div>
      )}

      {/* Skills display */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="group flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 shadow-sm text-sm font-medium text-gray-700 hover:border-gray-300 transition-all"
            >
              <span>{skill.name}</span>
              {skill.level && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getLevelStyle(skill.level)}`}>
                  {skill.level}
                </span>
              )}
              <button
                onClick={() => removeSkill(skill.id)}
                className="ml-1 text-gray-300 hover:text-red-400 focus:outline-none transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors w-full justify-center py-3.5 rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50">
        <Plus className="w-4 h-4" /> Ajouter une compétence
      </button>

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="Ajouter une compétence">
        <div className="space-y-5 pb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Compétence <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder="Ex : Gestion de projet, React, Soins patients…"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau (optionnel)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LEVELS.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setForm({ ...form, level: form.level === level.value ? undefined : level.value })}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg border uppercase tracking-wide transition-all ${
                    form.level === level.value 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleAdd}
              disabled={!form.name?.trim()}
              className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
            >
              Ajouter la compétence
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
