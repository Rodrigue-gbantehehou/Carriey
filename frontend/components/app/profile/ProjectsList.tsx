"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileProject } from '@/types/profile';
import { FolderKanban, ExternalLink, Pencil, Trash2, Plus } from 'lucide-react';

const inputClass = "block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm transition-all";

const emptyProject: Partial<ProfileProject> = {};

export default function ProjectsList() {
  const { profile, addProject, updateProject, removeProject } = useProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProfileProject>>(emptyProject);
  const [showDetails, setShowDetails] = useState(false);

  const projects = profile?.projects || [];

  const handleAdd = () => {
    if (!form.name) return;
    addProject({
      id: crypto.randomUUID(),
      name: form.name,
      description: form.description,
      url: form.url,
      start_date: form.start_date,
      end_date: form.end_date,
    });
    setIsAdding(false);
    setForm(emptyProject);
    setShowDetails(false);
  };

  const handleUpdate = (id: string) => {
    updateProject(id, form);
    setEditingId(null);
    setForm(emptyProject);
    setShowDetails(false);
  };

  const startEdit = (project: ProfileProject) => {
    setEditingId(project.id);
    setForm(project);
    setShowDetails(!!project.description);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyProject);
    setShowDetails(false);
  };

  const ProjectForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom du projet <span className="text-red-400">*</span></label>
          <input type="text" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex : Portfolio personnel, App mobile…" className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Lien du projet</label>
          <input type="url" value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://mon-projet.com" className={inputClass} />
        </div>
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
                rows={3}
                value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Contexte du projet, technologies utilisées, résultats…"
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
      {projects.length === 0 && !isAdding && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <FolderKanban className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">Aucun projet ajouté</p>
          <p className="text-xs text-gray-400 mt-1">Partagez vos réalisations, travaux ou projets personnels.</p>
        </div>
      )}

      {/* Existing items */}
      {projects.map((project) => (
        editingId === project.id ? (
          <ProjectForm key={project.id} onSave={() => handleUpdate(project.id)} onCancel={cancelEdit} />
        ) : (
          <div key={project.id} className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-700 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {(project.start_date || project.end_date) && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {project.start_date?.substring(0, 7).replace('-', '/') || '?'} — {project.end_date?.substring(0, 7).replace('-', '/') || 'En cours'}
                  </p>
                )}
                {project.description && <p className="mt-2 text-sm text-gray-500 line-clamp-2">{project.description}</p>}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(project)} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => removeProject(project.id)} className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      ))}

      {/* Add form */}
      {isAdding && <ProjectForm onSave={handleAdd} onCancel={cancelEdit} />}

      {/* Add button */}
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un projet
        </button>
      )}
    </div>
  );
}
