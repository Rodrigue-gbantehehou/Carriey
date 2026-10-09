"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileExperience } from '@/types/profile';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';

import BottomSheet from '@/components/app/shared/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TextList } from '@/components/ui/TextList';

const emptyExp: Partial<ProfileExperience> = { current: false };

export default function ExperienceList() {
  const { profile, addExperience, updateExperience, removeExperience } = useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProfileExperience>>(emptyExp);
  const [showDetails, setShowDetails] = useState(false);

  const experiences = profile?.experiences || [];

  const handleSave = () => {
    if (!form.company) return;
    
    // API expects YYYY-MM-DD or null. <input type="month"> gives YYYY-MM.
    const formatDate = (d?: string) => (d && d.length === 7) ? `${d}-01` : (d || undefined);

    const payload = {
      title: form.title || '',
      company: form.company,
      location: form.location || undefined,
      start_date: formatDate(form.start_date),
      end_date: form.current ? undefined : formatDate(form.end_date),
      current: !!form.current,
      description: form.description || undefined,
    };
    
    if (editingId) {
      updateExperience(editingId, payload);
    } else {
      addExperience({
        ...payload,
      });
    }
    
    closeSheet();
  };

  const startAdd = () => {
    setForm(emptyExp);
    setEditingId(null);
    setShowDetails(false);
    setIsAdding(true);
  };

  const startEdit = (exp: ProfileExperience) => {
    setForm({
      ...exp,
      // Truncate back to YYYY-MM so the <input type="month"> can parse it
      start_date: exp.start_date ? exp.start_date.substring(0, 7) : undefined,
      end_date: exp.end_date ? exp.end_date.substring(0, 7) : undefined,
    });
    setEditingId(exp.id);
    setShowDetails(!!exp.description);
    setIsAdding(true); // Re-using the same BottomSheet
  };

  const closeSheet = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyExp);
  };

  return (
    <div className="space-y-4">
      {experiences.length === 0 && (
        <div className="rounded-panel border-2 border-dashed border-border bg-background-subtle p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3 border border-border">
            <Briefcase className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-ui-sm font-semibold text-text-primary">Aucune expérience ajoutée</p>
          <p className="text-ui-xs text-text-secondary mt-1 mb-4">Vos emplois, stages, alternances...</p>
          <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={startAdd}>
            Ajouter
          </Button>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="space-y-3">
          {experiences.map((exp, index) => (
            <div key={exp.id || `exp-${index}`} className="group relative rounded-panel border border-border bg-background p-5 shadow-sm hover:border-primary transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary text-ui-base">{exp.title || 'Poste sans titre'}</h4>
                  <p className="font-medium text-primary text-ui-sm mt-0.5">{exp.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-ui-xs text-text-secondary font-medium">
                    {exp.start_date && <span>{exp.start_date.substring(0, 7)}</span>}
                    {exp.start_date && (exp.end_date || exp.current) && <span>—</span>}
                    {exp.current ? (
                      <span className="text-success-text bg-success-bg px-2 py-0.5 rounded-full">Aujourd'hui</span>
                    ) : (
                      exp.end_date && <span>{exp.end_date.substring(0, 7)}</span>
                    )}
                    {exp.location && (
                      <>
                        <span className="text-border">•</span>
                        <span>{exp.location}</span>
                      </>
                    )}
                  </div>
                  
                  {exp.description && (
                    <TextList text={exp.description} className="mt-3 text-ui-sm text-text-secondary leading-relaxed" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(exp)} className="p-2 text-text-muted hover:text-primary hover:bg-background-subtle rounded-button transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm("Supprimer cette expérience ?")) removeExperience(exp.id); }} className="p-2 text-text-muted hover:text-danger-text hover:bg-danger-bg rounded-button transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="ghost" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={startAdd} className="mt-2 border border-dashed border-border">
            Ajouter une expérience
          </Button>
        </div>
      )}

      <BottomSheet isOpen={isAdding || !!editingId} onClose={closeSheet} title={editingId ? "Modifier l'expérience" : "Ajouter une expérience"}>
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Entreprise *"
              value={form.company || ''}
              onChange={e => setForm({...form, company: e.target.value})}
              placeholder="Ex : Google, Hôpital de Paris..."
              autoFocus
            />
            
            <Input
              label="Poste"
              value={form.title || ''}
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="Ex : Développeur web, Infirmier..."
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="month"
                label="Début"
                value={form.start_date || ''}
                onChange={e => setForm({...form, start_date: e.target.value})}
              />
              
              <div>
                {form.current ? (
                  <div className="flex flex-col justify-end h-[68px] pb-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked onChange={() => setForm({...form, current: false})} className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                      <span className="text-ui-sm font-medium text-text-primary group-hover:text-primary transition-colors">Poste actuel</span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute right-0 top-0 text-[10px]">
                      <button type="button" onClick={() => setForm({...form, current: true, end_date: undefined})} className="text-primary uppercase tracking-wider bg-background-subtle px-2 py-0.5 rounded-full hover:bg-border transition-colors">Actuel ?</button>
                    </div>
                    <Input
                      type="month"
                      label="Fin"
                      value={form.end_date || ''}
                      onChange={e => setForm({...form, end_date: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <Input
              label="Lieu"
              value={form.location || ''}
              onChange={e => setForm({...form, location: e.target.value})}
              placeholder="Ex : Paris, Remote..."
            />

            {showDetails ? (
              <div className="animate-fade-in duration-300">
                <Textarea
                  label="Que faisiez-vous ?"
                  rows={4}
                  value={form.description || ''}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Décrivez vos missions, vos résultats..."
                />
              </div>
            ) : (
              <button type="button" onClick={() => setShowDetails(true)} className="text-ui-sm font-medium text-primary hover:text-primary-hover text-left">
                + Ajouter une description
              </button>
            )}
          </div>
          
          <div className="pt-4">
            <Button
              fullWidth
              onClick={handleSave}
              disabled={!form.company}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
