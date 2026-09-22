"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileExperience } from '@/types/profile';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const inputClass = "block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm transition-all";
const emptyExp: Partial<ProfileExperience> = { current: false };

export default function ExperienceList() {
  const { profile, addExperience, updateExperience, removeExperience } = useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProfileExperience>>(emptyExp);
  const [showDetails, setShowDetails] = useState(false); // Progressive disclosure

  const experiences = profile?.experiences || [];

  const handleAdd = () => {
    if (!form.company) return;
    addExperience({
      id: crypto.randomUUID(),
      title: form.title || '',
      company: form.company,
      location: form.location,
      start_date: form.start_date,
      end_date: form.current ? undefined : form.end_date,
      current: !!form.current,
      description: form.description,
    });
    setIsAdding(false);
    setForm(emptyExp);
    setShowDetails(false);
  };

  const handleUpdate = (id: string) => {
    updateExperience(id, form);
    setEditingId(null);
    setForm(emptyExp);
    setShowDetails(false);
  };

  const startEdit = (exp: ProfileExperience) => {
    setEditingId(exp.id);
    setForm(exp);
    setShowDetails(!!exp.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyExp);
    setShowDetails(false);
  };

  // Progressive form: minimal first, details on demand
  const ExperienceForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
      {/* Core fields — always visible */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Entreprise <span className="text-red-400">*</span></label>
          <input type="text" autoFocus value={form.company || ''} onChange={e => setForm({...form, company: e.target.value})} placeholder="Ex : Akemar Service" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Poste</label>
          <input type="text" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex : Graphiste, Infirmier…" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Début</label>
          <input type="month" value={form.start_date || ''} onChange={e => setForm({...form, start_date: e.target.value})} className={inputClass} />
        </div>
        <div>
          {form.current ? (
            <div className="flex flex-col justify-end h-full pb-0.5">
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="current" checked onChange={() => setForm({...form, current: false})} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                <label htmlFor="current" className="text-sm font-medium text-gray-700">Poste actuel</label>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fin</label>
              <div className="flex items-center gap-2">
                <input type="month" value={form.end_date || ''} onChange={e => setForm({...form, end_date: e.target.value})} className={inputClass} />
                <button type="button" onClick={() => setForm({...form, current: true, end_date: undefined})} className="text-xs whitespace-nowrap text-indigo-500 hover:text-indigo-700 font-medium">Aujourd'hui</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progressive disclosure — description */}
      {showDetails ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Que faisiez-vous ?</label>
          <textarea
            rows={3}
            value={form.description || ''}
            onChange={e => setForm({...form, description: e.target.value})}
            placeholder="Décrivez vos missions principales, vos réalisations clés…"
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

      <div className="flex justify-end gap-3 pt-1">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Annuler</button>
        <button onClick={onSave} disabled={!form.company} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-40">Enregistrer</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {experiences.length === 0 && !isAdding && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
          <div className="text-3xl mb-3">💼</div>
          <p className="text-sm font-medium text-gray-500">Aucune expérience ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Emplois, missions, stages, auto-entrepreneuriat…</p>
        </div>
      )}

      {experiences.map((exp) => (
        editingId === exp.id ? (
          <ExperienceForm key={exp.id} onSave={() => handleUpdate(exp.id)} onCancel={cancelEdit} />
        ) : (
          <div key={exp.id} className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {exp.title && <h3 className="text-sm font-semibold text-gray-900">{exp.title}</h3>}
                  {exp.current && (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">En cours</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-indigo-600 font-medium">{exp.company}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  {exp.location && <span>{exp.location}</span>}
                  {(exp.start_date || exp.end_date) && (
                    <span>
                      {exp.start_date?.substring(0,7).replace('-','/') || '?'} — {exp.current ? "Aujourd'hui" : exp.end_date?.substring(0,7).replace('-','/') || '?'}
                    </span>
                  )}
                </div>
                {exp.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{exp.description}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(exp)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => removeExperience(exp.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      ))}

      {isAdding && <ExperienceForm onSave={handleAdd} onCancel={cancelEdit} />}

      {!isAdding && (
        <button
          onClick={() => { setIsAdding(true); setForm(emptyExp); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter une expérience
        </button>
      )}
    </div>
  );
}
