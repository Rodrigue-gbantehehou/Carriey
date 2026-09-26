import { Theme, SectionsConfig } from '@/types/public-page';

export const THEMES: { id: Theme; label: string; desc: string; preview: string }[] = [
  { id: 'modern', label: 'Modern', desc: 'Dégradé coloré, cartes', preview: 'bg-gradient-to-br from-indigo-500 to-purple-500' },
  { id: 'minimal', label: 'Minimal', desc: 'Blanc, sobre, élégant', preview: 'bg-white border-2 border-gray-200' },
  { id: 'bold', label: 'Bold', desc: 'Fond sombre, fort impact', preview: 'bg-gray-950' },
  { id: 'elegant', label: 'Élégant', desc: 'Crème, style portfolio', preview: 'bg-amber-50 border border-amber-200' },
];

export const SECTION_LABELS: Record<keyof SectionsConfig, string> = {
  bio: 'À propos',
  experiences: 'Expériences',
  education: 'Formation',
  skills: 'Compétences',
  projects: 'Projets',
  certifications: 'Certifications',
  languages: 'Langues',
  links: 'Liens',
};

export const EXPIRY_OPTIONS = [
  { value: '', label: 'Permanent' },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '3 mois' },
];

export function daysLeft(expiresAt?: string | null) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  return days;
}

export function getExpiresAt(option: string): string | null {
  if (!option) return null;
  const days = parseInt(option);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const inputClass = "block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3.5 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all";
