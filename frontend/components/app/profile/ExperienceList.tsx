"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileExperience } from '@/types/profile';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import BottomSheet from '@/components/app/shared/BottomSheet';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";
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
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-600">Aucune expérience ajoutée</p>
          <p className="text-xs text-gray-400 mt-1">Vos emplois, stages, alternances...</p>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="space-y-3">
          {experiences.map((exp, index) => (
            <div key={exp.id || `exp-${index}`} className="group relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-base">{exp.title || 'Poste sans titre'}</h4>
                  <p className="font-medium text-indigo-600 text-sm mt-0.5">{exp.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-gray-500 font-medium">
                    {exp.start_date && <span>{exp.start_date.substring(0, 7)}</span>}
                    {exp.start_date && (exp.end_date || exp.current) && <span>—</span>}
                    {exp.current ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Aujourd'hui</span>
                    ) : (
                      exp.end_date && <span>{exp.end_date.substring(0, 7)}</span>
                    )}
                    {exp.location && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{exp.location}</span>
                      </>
                    )}
                  </div>
                  
                  {exp.description && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 line-clamp-3 whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(exp)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm("Supprimer cette expérience ?")) removeExperience(exp.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={startAdd} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors w-full justify-center py-3.5 rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50">
        <Plus className="w-4 h-4" /> Ajouter une expérience
      </button>

      <BottomSheet isOpen={isAdding || !!editingId} onClose={closeSheet} title={editingId ? "Modifier l'expérience" : "Ajouter une expérience"}>
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Entreprise <span className="text-red-400">*</span></label>
              <input type="text" autoFocus value={form.company || ''} onChange={e => setForm({...form, company: e.target.value})} placeholder="Ex : Google, Hôpital de Paris..." className={inputClass} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Poste</label>
              <input type="text" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex : Développeur web, Infirmier..." className={inputClass} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Début</label>
                <input type="month" value={form.start_date || ''} onChange={e => setForm({...form, start_date: e.target.value})} className={inputClass} />
              </div>
              <div>
                {form.current ? (
                  <div className="flex flex-col justify-end h-full pb-3">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked onChange={() => setForm({...form, current: false})} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">Poste actuel</span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1.5">
                      Fin
                      <button type="button" onClick={() => setForm({...form, current: true, end_date: undefined})} className="text-[10px] text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-full hover:bg-indigo-100 transition-colors">Actuel ?</button>
                    </label>
                    <input type="month" value={form.end_date || ''} onChange={e => setForm({...form, end_date: e.target.value})} className={inputClass} />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lieu</label>
              <input type="text" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} placeholder="Ex : Paris, Remote..." className={inputClass} />
            </div>

            {showDetails ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Que faisiez-vous ?</label>
                <textarea
                  rows={4}
                  value={form.description || ''}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Décrivez vos missions, vos résultats..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            ) : (
              <button type="button" onClick={() => setShowDetails(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 text-left">
                + Ajouter une description
              </button>
            )}
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={!form.company}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
