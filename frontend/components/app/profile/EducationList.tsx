"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileEducation } from '@/types/profile';
import { GraduationCap, Pencil, Trash2, Plus } from 'lucide-react';

import BottomSheet from '@/components/app/shared/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TextList } from '@/components/ui/TextList';

const emptyEdu: Partial<ProfileEducation> = {};

export default function EducationList() {
  const { profile, addEducation, updateEducation, removeEducation } = useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProfileEducation>>(emptyEdu);
  const [showDetails, setShowDetails] = useState(false);

  const educations = profile?.educations || [];

  const handleSave = () => {
    if (!form.degree || !form.school) return;
    const fmtDate = (d?: string) => (d && d.length === 7) ? `${d}-01` : (d || undefined);
    
    if (editingId) {
      updateEducation(editingId, { ...form, start_date: fmtDate(form.start_date), end_date: fmtDate(form.end_date) });
    } else {
      addEducation({
        degree: form.degree,
        school: form.school,
        location: form.location,
        start_date: fmtDate(form.start_date),
        end_date: fmtDate(form.end_date),
        description: form.description,
      });
    }
    
    closeSheet();
  };

  const startAdd = () => {
    setForm(emptyEdu);
    setEditingId(null);
    setShowDetails(false);
    setIsAdding(true);
  };

  const startEdit = (edu: ProfileEducation) => {
    setForm({
      ...edu,
      start_date: edu.start_date ? edu.start_date.substring(0, 7) : undefined,
      end_date: edu.end_date ? edu.end_date.substring(0, 7) : undefined,
    });
    setEditingId(edu.id);
    setShowDetails(!!edu.description);
    setIsAdding(true);
  };

  const closeSheet = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyEdu);
  };

  return (
    <div className="space-y-4">
      {educations.length === 0 && (
        <div className="rounded-panel border-2 border-dashed border-border bg-background-subtle p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3 border border-border">
            <GraduationCap className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-ui-sm font-semibold text-text-primary">Aucune formation ajoutée</p>
          <p className="text-ui-xs text-text-secondary mt-1 mb-4">Vos diplômes, certifications scolaires...</p>
          <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={startAdd}>
            Ajouter
          </Button>
        </div>
      )}

      {educations.length > 0 && (
        <div className="space-y-3">
          {educations.map((edu, index) => (
            <div key={edu.id || `edu-${index}`} className="group relative rounded-panel border border-border bg-background p-5 shadow-sm hover:border-primary transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-primary text-ui-base">{edu.degree || 'Sans diplôme'}</h4>
                  <p className="font-medium text-primary text-ui-sm mt-0.5">{edu.school}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-ui-xs text-text-secondary font-medium">
                    {edu.start_date && <span>{edu.start_date.substring(0, 7)}</span>}
                    {edu.start_date && edu.end_date && <span>—</span>}
                    {edu.end_date && <span>{edu.end_date.substring(0, 7)}</span>}
                    {edu.location && (
                      <>
                        <span className="text-border">•</span>
                        <span>{edu.location}</span>
                      </>
                    )}
                  </div>
                  
                  {edu.description && (
                    <TextList text={edu.description} className="mt-3 text-ui-sm text-text-secondary leading-relaxed" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(edu)} className="p-2 text-text-muted hover:text-primary hover:bg-background-subtle rounded-button transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm("Supprimer cette formation ?")) removeEducation(edu.id); }} className="p-2 text-text-muted hover:text-danger-text hover:bg-danger-bg rounded-button transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="ghost" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={startAdd} className="mt-2 border border-dashed border-border">
            Ajouter une formation
          </Button>
        </div>
      )}

      <BottomSheet isOpen={isAdding || !!editingId} onClose={closeSheet} title={editingId ? "Modifier la formation" : "Ajouter une formation"}>
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Diplôme / Titre *"
              value={form.degree || ''}
              onChange={e => setForm({ ...form, degree: e.target.value })}
              placeholder="Ex : Master en Informatique"
              autoFocus
            />
            
            <Input
              label="École / Université *"
              value={form.school || ''}
              onChange={e => setForm({ ...form, school: e.target.value })}
              placeholder="Ex : Université Paris-Dauphine"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="month"
                label="Date de début"
                value={form.start_date || ''}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
              />
              <Input
                type="month"
                label="Date de fin"
                value={form.end_date || ''}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
            
            <Input
              label="Localisation"
              value={form.location || ''}
              onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="Ex : Paris, France"
            />

            {showDetails ? (
              <div className="animate-fade-in duration-300">
                <Textarea
                  label="Description (optionnel)"
                  rows={3}
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Spécialisation, mention, activités parascolaires…"
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
              disabled={!form.degree || !form.school}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
