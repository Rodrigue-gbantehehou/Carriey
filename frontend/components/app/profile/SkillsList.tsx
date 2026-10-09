"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileSkill } from '@/types/profile';
import { Wrench, X, Plus } from 'lucide-react';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const LEVELS = [
  { value: 'Débutant', label: 'Débutant', color: 'bg-background-subtle text-text-secondary border-border' },
  { value: 'Intermédiaire', label: 'Intermédiaire', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'Avancé', label: 'Avancé', color: 'bg-primary-subtle text-indigo-700 border-primary/20' },
  { value: 'Expert', label: 'Expert', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function SkillsList() {
  const { profile, addSkill, removeSkill } = useProfileStore();
  const [form, setForm] = useState<Partial<ProfileSkill>>({});
  const [isAdding, setIsAdding] = useState(false);

  const skills = profile?.skills || [];

  const handleAdd = () => {
    if (!form.name?.trim()) return;
    addSkill({
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
    LEVELS.find(l => l.value === level)?.color || 'bg-background-subtle text-text-secondary border-border';

  return (
    <div className="space-y-4">
      {/* Empty state */}
      {skills.length === 0 && (
        <div className="rounded-panel border-2 border-dashed border-border bg-background-subtle p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3 border border-border">
            <Wrench className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-ui-sm font-semibold text-text-primary">Aucune compétence ajoutée</p>
          <p className="text-ui-xs text-text-secondary mt-1 mb-4">Vos outils, logiciels, langues et soft-skills.</p>
          <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAdding(true)}>
            Ajouter
          </Button>
        </div>
      )}

      {/* Skills display */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="group flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 shadow-sm text-ui-sm font-medium text-text-primary hover:border-primary transition-colors"
            >
              <span>{skill.name}</span>
              {skill.level && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getLevelStyle(skill.level)}`}>
                  {skill.level}
                </span>
              )}
              <button
                onClick={() => removeSkill(skill.id)}
                className="ml-1 text-text-muted hover:text-danger-text focus:outline-none transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          
          <Button variant="ghost" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAdding(true)} className="mt-2 border border-dashed border-border">
            Ajouter une compétence
          </Button>
        </div>
      )}

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="Ajouter une compétence">
        <div className="space-y-5 pb-6">
          <Input
            label="Compétence *"
            value={form.name || ''}
            onChange={e => setForm({ ...form, name: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Ex : Gestion de projet, React, Soins patients…"
            autoFocus
          />
          <div>
            <label className="block text-ui-sm font-medium text-text-primary mb-1.5">Niveau (optionnel)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LEVELS.map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setForm({ ...form, level: form.level === level.value ? undefined : level.value })}
                  className={`py-2 px-1 text-[11px] font-bold rounded-button border uppercase tracking-wide transition-colors ${
                    form.level === level.value 
                      ? 'border-primary bg-background-subtle text-primary shadow-sm' 
                      : 'border-border bg-background text-text-secondary hover:bg-background-subtle'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              fullWidth
              onClick={handleAdd}
              disabled={!form.name?.trim()}
            >
              Ajouter la compétence
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
