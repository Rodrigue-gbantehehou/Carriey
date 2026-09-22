"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileEducation } from '@/types/profile';
import { GraduationCap, Pencil, Trash2, Plus } from 'lucide-react';

const inputClass = "block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm transition-all";

const emptyEdu: Partial<ProfileEducation> = {};

export default function EducationList() {
  const { profile, addEducation, updateEducation, removeEducation } = useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProfileEducation>>(emptyEdu);
  const [showDetails, setShowDetails] = useState(false);

  const educations = profile?.educations || [];

  const handleAdd = () => {
    if (!form.degree || !form.school) return;
    addEducation({
      id: crypto.randomUUID(),
      degree: form.degree,
      school: form.school,
      location: form.location,
      start_date: form.start_date,
      end_date: form.end_date,
      description: form.description,
    });
    setIsAdding(false);
    setForm(emptyEdu);
    setShowDetails(false);
  };

  const handleUpdate = (id: string) => {
    updateEducation(id, form);
    setEditingId(null);
    setForm(emptyEdu);
    setShowDetails(false);
  };

  const startEdit = (edu: ProfileEducation) => {
    setEditingId(edu.id);
    setForm(edu);
    setShowDetails(!!edu.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyEdu);
    setShowDetails(false);
  };

  const EducationForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Diplôme / Titre <span className="text-red-400">*</span></label>
          <input type="text" value={form.degree || ''} onChange={e => setForm({ ...form, degree: e.target.value })} placeholder="Ex : Master en Informatique" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">École / Université <span className="text-red-400">*</span></label>
          <input type="text" value={form.school || ''} onChange={e => setForm({ ...form, school: e.target.value })} placeholder="Ex : Université Paris-Dauphine" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Localisation</label>
          <input type="text" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Ex : Paris, France" className={inputClass} />
        </div>
        <div>{/* spacer */}</div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de début</label>
          <input type="month" value={form.start_date || ''} onChange={e => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date de fin</label>
          <input type="month" value={form.end_date || ''} onChange={e => setForm({ ...form, end_date: e.target.value })} className={inputClass} />
        </div>
        <div className="sm:col-span-2 mt-2">
          {showDetails ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
              <textarea
                rows={2}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Spécialisation, mention, activités parascolaires…"
                className={`${inputClass} resize-none`}
                autoFocus
              />
              <button type="button" onClick={() => setShowDetails(false)} className="mt-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                − Masquer la description
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une description
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Annuler</button>
        <button onClick={onSave} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Enregistrer</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Empty state */}
      {educations.length === 0 && !isAdding && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">Aucune formation ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Ajoutez vos diplômes, certifications et bootcamps.</p>
        </div>
      )}

      {/* Existing items */}
      {educations.map((edu) => (
        editingId === edu.id ? (
          <EducationForm key={edu.id} onSave={() => handleUpdate(edu.id)} onCancel={cancelEdit} />
        ) : (
          <div key={edu.id} className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900">{edu.degree}</h3>
                <p className="mt-0.5 text-sm text-indigo-600 font-medium">{edu.school}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  {edu.location && <span>{edu.location}</span>}
                  {(edu.start_date || edu.end_date) && (
                    <span>
                      {edu.start_date?.substring(0, 7).replace('-', '/') || '?'} — {edu.end_date?.substring(0, 7).replace('-', '/') || '?'}
                    </span>
                  )}
                </div>
                {edu.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{edu.description}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(edu)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => removeEducation(edu.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      ))}

      {/* Add form */}
      {isAdding && <EducationForm onSave={handleAdd} onCancel={cancelEdit} />}

      {/* Add button */}
      {!isAdding && (
        <button
          onClick={() => { setIsAdding(true); setForm(emptyEdu); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter une formation
        </button>
      )}
    </div>
  );
}
