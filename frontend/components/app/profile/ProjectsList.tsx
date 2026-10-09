"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { ProfileProject } from '@/types/profile';
import { FolderKanban, ExternalLink, Pencil, Trash2, Plus } from 'lucide-react';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TextList } from '@/components/ui/TextList';

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
        <div className="rounded-panel border-2 border-dashed border-border bg-background-subtle p-8 text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-3 border border-border">
            <FolderKanban className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-ui-sm font-semibold text-text-primary">Aucun projet ajouté</p>
          <p className="text-ui-xs text-text-secondary mt-1 mb-4">Vos réalisations, travaux ou projets personnels.</p>
          <Button variant="secondary" leftIcon={<Plus className="w-4 h-4" />} onClick={startAdd}>
            Ajouter
          </Button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={project.id || `proj-${index}`} className="group relative rounded-panel border border-border bg-background p-5 shadow-sm hover:border-primary transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-text-primary text-ui-base">{project.name}</h4>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary-hover transition-colors bg-background-subtle border border-border p-1.5 rounded-button">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  
                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-2 mt-2 text-ui-xs text-text-secondary font-medium">
                      <span>{project.start_date ? project.start_date.substring(0, 7) : '?'}</span>
                      <span>—</span>
                      <span>{project.end_date ? project.end_date.substring(0, 7) : 'En cours'}</span>
                    </div>
                  )}
                  
                  {project.description && (
                    <TextList text={project.description} className="mt-3 text-ui-sm text-text-secondary leading-relaxed" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(project)} className="p-2 text-text-muted hover:text-primary hover:bg-background-subtle rounded-button transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if(confirm("Supprimer ce projet ?")) removeProject(project.id); }} className="p-2 text-text-muted hover:text-danger-text hover:bg-danger-bg rounded-button transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <Button variant="ghost" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={startAdd} className="mt-2 border border-dashed border-border">
            Ajouter un projet
          </Button>
        </div>
      )}

      <BottomSheet isOpen={isAdding || !!editingId} onClose={closeSheet} title={editingId ? "Modifier le projet" : "Ajouter un projet"}>
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-1 gap-5">
            <Input
              label="Nom du projet *"
              value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex : Portfolio personnel, App mobile…"
              autoFocus
            />
            
            <Input
              type="url"
              label="Lien du projet"
              value={form.url || ''}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://mon-projet.com"
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

            {showDetails ? (
              <div className="animate-fade-in duration-300">
                <Textarea
                  label="Description (optionnel)"
                  rows={4}
                  value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Contexte, technos utilisées, résultats…"
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
              disabled={!form.name}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
