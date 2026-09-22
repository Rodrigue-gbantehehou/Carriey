"use client";

import { useState } from 'react';
import { useProfileStore } from '@/store/profile';
import { Globe, Award, X, ExternalLink, Trash2, Plus } from 'lucide-react';

interface Language {
  id: string;
  name: string;
  level: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

const LANGUAGE_LEVELS = ['Notions', 'Intermédiaire', 'Courant', 'Bilingue', 'Langue maternelle'];

const inputClass = "block w-full rounded-md border border-gray-200 bg-white py-2.5 px-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm transition-all";

// ---------- Languages ----------
export function LanguagesList() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<Language>>({});

  const handleAdd = () => {
    if (!form.name || !form.level) return;
    setLanguages(prev => [...prev, { id: crypto.randomUUID(), name: form.name!, level: form.level! }]);
    setForm({});
    setIsAdding(false);
  };

  const remove = (id: string) => setLanguages(prev => prev.filter(l => l.id !== id));

  return (
    <div className="space-y-4">
      {languages.length === 0 && !isAdding && (
        <EmptyState icon={<Globe className="w-8 h-8 text-gray-400" />} text="Aucune langue ajoutée" sub="Français, Anglais, Espagnol…" />
      )}

      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {languages.map(l => (
            <div key={l.id} className="group flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm hover:border-gray-300 transition-all">
              <span className="font-medium text-gray-800">{l.name}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{l.level}</span>
              <button onClick={() => remove(l.id)} className="ml-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setIsAdding(false); setForm({}); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Annuler</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Ajouter</button>
          </div>
        </div>
      )}

      {!isAdding && (
        <AddButton onClick={() => setIsAdding(true)} label="Ajouter une langue" />
      )}
    </div>
  );
}

// ---------- Certifications ----------
export function CertificationsList() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<Certification>>({});

  const handleAdd = () => {
    if (!form.name || !form.issuer) return;
    setCertifications(prev => [...prev, { id: crypto.randomUUID(), name: form.name!, issuer: form.issuer!, date: form.date, url: form.url }]);
    setForm({});
    setIsAdding(false);
  };

  const remove = (id: string) => setCertifications(prev => prev.filter(c => c.id !== id));

  return (
    <div className="space-y-4">
      {certifications.length === 0 && !isAdding && (
        <EmptyState icon={<Award className="w-8 h-8 text-gray-400" />} text="Aucune certification ajoutée" sub="Diplômes professionnels, formations, licences…" />
      )}

      {certifications.map(cert => (
        <div key={cert.id} className="group flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-all">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
            <p className="text-sm text-indigo-600 font-medium mt-0.5">{cert.issuer}</p>
            {cert.date && <p className="text-xs text-gray-400 mt-0.5">{cert.date}</p>}
            {cert.url && (
              <a href={cert.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors mt-1 inline-flex items-center gap-1">
                Voir le certificat
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <button onClick={() => remove(cert.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {isAdding && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Intitulé <span className="text-red-400">*</span></label>
              <input type="text" autoFocus value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex : Permis B, TOEIC, AWS Certified…" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Organisme <span className="text-red-400">*</span></label>
              <input type="text" value={form.issuer || ''} onChange={e => setForm({...form, issuer: e.target.value})} placeholder="Ex : CERFA, ETS, Amazon…" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date d'obtention</label>
              <input type="month" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lien du certificat</label>
              <input type="url" value={form.url || ''} onChange={e => setForm({...form, url: e.target.value})} placeholder="https://…" className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setIsAdding(false); setForm({}); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Annuler</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Ajouter</button>
          </div>
        </div>
      )}

      {!isAdding && (
        <AddButton onClick={() => setIsAdding(true)} label="Ajouter une certification" />
      )}
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
