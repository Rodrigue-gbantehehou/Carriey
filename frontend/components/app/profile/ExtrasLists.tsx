"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { Globe, Award, X, ExternalLink, Trash2, Plus } from 'lucide-react';

import { ProfileLanguage, ProfileCertification } from '@/types/profile';
import BottomSheet from '@/components/app/shared/BottomSheet';

const LANGUAGE_LEVELS = ['Notions', 'Intermédiaire', 'Courant', 'Bilingue', 'Langue maternelle'];

const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";

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
        <EmptyState icon={<Globe className="w-8 h-8 text-gray-400" />} text="Aucune langue ajoutée" sub="Français, Anglais, Espagnol…" />
      )}

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {languages.map(l => (
            <div key={l.id} className="group flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm hover:border-gray-300 transition-all shadow-sm">
              <span className="font-medium text-gray-800">{l.name}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{l.level}</span>
              <button onClick={() => remove(l.id)} className="ml-1 text-gray-300 hover:text-red-400 transition-all focus:outline-none">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!isAdding && (
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors w-full justify-center py-3 rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50">
          <Plus className="w-4 h-4" /> Ajouter une langue
        </button>
      )}

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="Ajouter une langue">
        <div className="space-y-5 pb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue <span className="text-red-400">*</span></label>
            <input type="text" autoFocus value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex : Anglais, Espagnol…" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Niveau <span className="text-red-400">*</span></label>
            <select value={form.level || ''} onChange={e => setForm({...form, level: e.target.value})} className={inputClass}>
              <option value="">Sélectionner…</option>
              {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleAdd}
              disabled={!form.name || !form.level}
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
        <EmptyState icon={<Award className="w-8 h-8 text-gray-400" />} text="Aucune certification ajoutée" sub="Diplômes professionnels, formations, licences…" />
      )}

      {certifications.map(cert => (
        <div key={cert.id} className="group flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-5 hover:border-gray-300 transition-all shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
            <p className="text-sm text-indigo-600 font-medium mt-0.5">{cert.issuer}</p>
            {cert.date && <p className="text-xs text-gray-400 mt-0.5">{cert.date}</p>}
            {cert.url && (
              <a href={cert.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors mt-1.5 inline-flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md w-max">
                Voir le certificat
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button onClick={() => remove(cert.id)} className="p-1.5 rounded-md text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {!isAdding && (
        <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors w-full justify-center py-3 rounded-xl border border-dashed border-indigo-200 hover:bg-indigo-50">
          <Plus className="w-4 h-4" /> Ajouter une certification
        </button>
      )}

      <BottomSheet isOpen={isAdding} onClose={() => setIsAdding(false)} title="Ajouter une certification">
        <div className="space-y-5 pb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Intitulé <span className="text-red-400">*</span></label>
            <input type="text" autoFocus value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex : Permis B, TOEIC, AWS Certified…" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Organisme <span className="text-red-400">*</span></label>
            <input type="text" value={form.issuer || ''} onChange={e => setForm({...form, issuer: e.target.value})} placeholder="Ex : CERFA, ETS, Amazon…" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date d'obtention</label>
              <input type="month" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lien (optionnel)</label>
              <input type="url" value={form.url || ''} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://..." className={inputClass} />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              onClick={handleAdd}
              disabled={!form.name || !form.issuer}
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

// ---------- Shared components ----------
function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center flex flex-col items-center">
      <div className="mb-3">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{text}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-600 transition-all"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  );
}
