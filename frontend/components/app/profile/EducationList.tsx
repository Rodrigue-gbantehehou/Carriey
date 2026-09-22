"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileEducation } from '@/types/profile';
import { GraduationCap, Pencil, Trash2, Plus } from 'lucide-react';

import BottomSheet from '@/components/app/shared/BottomSheet';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

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
        id: crypto.randomUUID(),
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
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-600">Aucune formation ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Vos diplômes, certifications scolaires...</p>
        </div>
      )}

      {educations.length > 0 && (
        <div className="space-y-3">
          {educations.map(edu => (
            <div key={edu.id} className="group relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base">{edu.degree || 'Sans diplôme'}</h4>
                  <p className="font-medium text-indigo-600 text-sm mt-0.5">{edu.school}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-gray-500 font-medium">
                    {edu.start_date && <span>{edu.start_date}</span>}
                    {edu.start_date && edu.end_date && <span>—</span>}
                    {edu.end_date && <span>{edu.end_date}</span>}
                    {edu.location && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{edu.location}</span>
                      </>
                    )}
                  </div>
                  
                  {edu.description && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 line-clamp-3">
                      {edu.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(edu)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm("Supprimer cette formation ?")) removeEducation(edu.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={startAdd} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors w-full justify-center py-3.5 rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50">
        <Plus className="w-4 h-4" /> Ajouter une formation
      </button>

      <BottomSheet isOpen={isAdding || !!editingId} onClose={closeSheet} title={editingId ? "Modifier la formation" : "Ajouter une formation"}>
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Diplôme / Titre <span className="text-red-400">*</span></label>
              <input type="text" autoFocus value={form.degree || ''} onChange={e => setForm({ ...form, degree: e.target.value })} placeholder="Ex : Master en Informatique" className={inputClass} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">École / Université <span className="text-red-400">*</span></label>
              <input type="text" value={form.school || ''} onChange={e => setForm({ ...form, school: e.target.value })} placeholder="Ex : Université Paris-Dauphine" className={inputClass} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de début</label>
                <input type="month" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de fin</label>
                <input type="month" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Localisation</label>
              <input type="text" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex : Paris, France" className={inputClass} />
            </div>

            {showDetails ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Spécialisation, mention, activités parascolaires…"
                  className={`${inputClass} resize-y`}
                />
              </div>
            ) : (
              <button type="button" onClick={() => setShowDetails(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 text-left">
                + Ajouter une description
              </button>
            )}
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={!form.degree || !form.school}
              className="w-full bg-indigo-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
