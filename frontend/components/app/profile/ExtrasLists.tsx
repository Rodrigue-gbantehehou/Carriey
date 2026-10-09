"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { Globe, Award, X, ExternalLink, Trash2, Plus } from 'lucide-react';

import { ProfileLanguage, ProfileCertification } from '@/types/profile';
import BottomSheet from '@/components/app/shared/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

const LANGUAGE_LEVELS = ['Notions', 'Intermédiaire', 'Courant', 'Bilingue', 'Langue maternelle'];

// ---------- Languages ----------
export function LanguagesList() {
  const { profile, addLanguage, removeLanguage } = useProfileStore();
  const languages = profile?.languages || [];
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<ProfileLanguage>>({});

  const handleAdd = () => {
    if (!form.name || !form.level) return;
    addLanguage({ name: form.name, level: form.level });
    setForm({});
    setIsAdding(false);
  };

  const remove = (id: string) => removeLanguage(id);

  return (
    <div className="space-y-4">
      {languages.length === 0 && (
        <EmptyState icon={<Globe className="w-8 h-8 text-text-muted" />} text="Aucune langue ajoutée" sub="Français, Anglais, Espagnol…" />
      )}

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {languages.map(l => (
            <div key={l.id} className="group flex items-center gap-2 bg-background border border-border rounded-full px-4 py-1.5 text-ui-sm hover:border-primary transition-colors shadow-sm">
              <span className="font-medium text-text-primary">{l.name}</span>
              <span className="text-ui-xs text-text-muted">·</span>
              <span className="text-ui-xs text-text-secondary">{l.level}</span>
              <button onClick={() => remove(l.id)} className="ml-1 text-text-muted hover:text-danger-text transition-colors focus:outline-none">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!isAdding && (
        <Button variant="ghost" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAdding(true)} className="border border-dashed border-border">
          Ajouter une langue
        </Button>
      )}

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="Ajouter une langue">
        <div className="space-y-5 pb-6">
          <Input
            label="Langue *"
            value={form.name || ''}
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="Ex : Anglais, Espagnol…"
            autoFocus
          />
          <Select
            label="Niveau *"
            value={form.level || ''}
            onChange={e => setForm({...form, level: e.target.value})}
          >
            <option value="">Sélectionner…</option>
            {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </Select>
          
          <div className="pt-4">
            <Button
              fullWidth
              onClick={handleAdd}
              disabled={!form.name || !form.level}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

// ---------- Certifications ----------
export function CertificationsList() {
  const { profile, addCertification, removeCertification } = useProfileStore();
  const certifications = profile?.certifications || [];
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<ProfileCertification>>({});

  const handleAdd = () => {
    if (!form.name || !form.issuer) return;
    const fmtDate = (d?: string) => (d && d.length === 7) ? `${d}-01` : (d || undefined);
    addCertification({ name: form.name, issuer: form.issuer, date: fmtDate(form.date), url: form.url });
    setForm({});
    setIsAdding(false);
  };

  const remove = (id: string) => removeCertification(id);

  return (
    <div className="space-y-4">
      {certifications.length === 0 && (
        <EmptyState icon={<Award className="w-8 h-8 text-text-muted" />} text="Aucune certification ajoutée" sub="Diplômes professionnels, formations, licences…" />
      )}

      {certifications.length > 0 && (
        <div className="space-y-3">
          {certifications.map(cert => (
            <div key={cert.id} className="group flex items-start justify-between gap-4 rounded-panel border border-border bg-background p-5 hover:border-primary transition-colors shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-ui-sm font-semibold text-text-primary">{cert.name}</p>
                <p className="text-ui-sm text-primary font-medium mt-0.5">{cert.issuer}</p>
                {cert.date && <p className="text-ui-xs text-text-secondary mt-0.5">{cert.date}</p>}
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noreferrer" className="text-ui-xs text-primary hover:text-primary-hover transition-colors mt-1.5 inline-flex items-center gap-1 bg-background-subtle border border-border px-2 py-1 rounded-button w-max">
                    Voir le certificat
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button onClick={() => remove(cert.id)} className="p-1.5 rounded-button text-text-muted hover:bg-danger-bg hover:text-danger-text transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!isAdding && (
        <Button variant="ghost" fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsAdding(true)} className="border border-dashed border-border">
          Ajouter une certification
        </Button>
      )}

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="Ajouter une certification">
        <div className="space-y-5 pb-6">
          <Input
            label="Intitulé *"
            value={form.name || ''}
            onChange={e => setForm({...form, name: e.target.value})}
            placeholder="Ex : Permis B, TOEIC, AWS Certified…"
            autoFocus
          />
          <Input
            label="Organisme *"
            value={form.issuer || ''}
            onChange={e => setForm({...form, issuer: e.target.value})}
            placeholder="Ex : CERFA, ETS, Amazon…"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="month"
              label="Date d'obtention"
              value={form.date || ''}
              onChange={e => setForm({...form, date: e.target.value})}
            />
            <Input
              type="url"
              label="Lien (optionnel)"
              value={form.url || ''}
              onChange={e => setForm({...form, url: e.target.value})}
              placeholder="https://..."
            />
          </div>
          
          <div className="pt-4">
            <Button
              fullWidth
              onClick={handleAdd}
              disabled={!form.name || !form.issuer}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

// ---------- Shared components ----------
function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <div className="rounded-panel border-2 border-dashed border-border bg-background-subtle p-8 text-center flex flex-col items-center">
      <div className="mb-3 bg-background rounded-full p-3 border border-border">{icon}</div>
      <p className="text-ui-sm font-semibold text-text-primary">{text}</p>
      <p className="text-ui-xs text-text-secondary mt-1">{sub}</p>
    </div>
  );
}
