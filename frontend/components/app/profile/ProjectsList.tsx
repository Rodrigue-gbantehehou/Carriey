"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileProject } from '@/types/profile';
import { FolderKanban, ExternalLink, Pencil, Trash2, Plus } from 'lucide-react';
import BottomSheet from '@/components/app/shared/BottomSheet';

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

const emptyProject: Partial<ProfileProject> = {};

export default function ProjectsList() {
  const { profile, addProject, updateProject, removeProject } = useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProfileProject>>(emptyProject);
  const [showDetails, setShowDetails] = useState(false);

  const projects = profile?.projects || [];

  const handleSave = () => {
    if (!form.name) return;
    const fmtDate = (d?: string) => (d && d.length === 7) ? `${d}-01` : (d || undefined);
    
    if (editingId) {
      updateProject(editingId, { ...form, start_date: fmtDate(form.start_date), end_date: fmtDate(form.end_date) });
    } else {
      addProject({
        // id removed
        name: form.name,
        description: form.description,
        url: form.url,
        start_date: fmtDate(form.start_date),
        end_date: fmtDate(form.end_date),
      });
    }
    
    closeSheet();
  };

  const startAdd = () => {
    setForm(emptyProject);
    setEditingId(null);
    setShowDetails(false);
    setIsAdding(true);
  };

  const startEdit = (project: ProfileProject) => {
    setForm(project);
    setEditingId(project.id);
    setShowDetails(!!project.description);
    setIsAdding(true);
  };

  const closeSheet = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyProject);
  };

  return (
    <div className="space-y-4">
      {projects.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-600">Aucun projet ajouté</p>
          <p className="text-xs text-gray-400 mt-1">Vos réalisations, travaux ou projets personnels.</p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="space-y-3">
          {projects.map(project => (
            <div key={project.id} className="group relative rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-gray-300 transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-base">{project.name}</h4>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 transition-colors bg-indigo-50 p-1.5 rounded-lg">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                      <span>{project.start_date || '?'}</span>
                      <span>—</span>
                      <span>{project.end_date || 'En cours'}</span>
                    </div>
                  )}
                  
                  {project.description && (
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(project)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm("Supprimer ce projet ?")) removeProject(project.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={startAdd} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors w-full justify-center py-3.5 rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50">
        <Plus className="w-4 h-4" /> Ajouter un projet
      </button>

      <BottomSheet isOpen={isAdding || !!editingId} onClose={closeSheet} title={editingId ? "Modifier le projet" : "Ajouter un projet"}>
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du projet <span className="text-red-400">*</span></label>
              <input type="text" autoFocus value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex : Portfolio personnel, App mobile…" className={inputClass} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lien du projet</label>
              <input type="url" value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://mon-projet.com" className={inputClass} />
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

            {showDetails ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optionnel)</label>
                <textarea
                  rows={4}
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Contexte, technos utilisées, résultats…"
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
              disabled={!form.name}
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
