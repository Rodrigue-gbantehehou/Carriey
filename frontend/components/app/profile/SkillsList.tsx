"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileSkill } from '@/types/profile';
import { Wrench, X, Plus } from 'lucide-react';

const inputClass = "block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm transition-all";

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
    if (e.key === 'Escape') { setIsAdding(false); setForm({}); }
  };

  const getLevelStyle = (level?: string) =>
    LEVELS.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-600';

  return (
    <div className="space-y-6">
      {/* Skills display */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-300 transition-all"
            >
              <span>{skill.name}</span>
              {skill.level && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getLevelStyle(skill.level)}`}>
                  {skill.level}
                </span>
              )}
              <button
                onClick={() => removeSkill(skill.id)}
                className="ml-0.5 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {skills.length === 0 && !isAdding && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <Wrench className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">Aucune compétence ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Listez ce que vous savez faire, quel que soit votre métier.</p>
        </div>
      )}

      {/* Inline add form */}
      {isAdding && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Compétence <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name || ''}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={handleKeyDown}
                placeholder="Ex : Gestion de projet, Photoshop, Soins patients…"
                className={inputClass}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau (optionnel)</label>
              <div className="flex gap-2 flex-wrap">
                {LEVELS.map(l => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setForm({ ...form, level: form.level === l.value ? undefined : l.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${form.level === l.value
                        ? `${l.color} border-current`
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsAdding(false); setForm({}); }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter une compétence
        </button>
      )}
    </div>
  );
}
