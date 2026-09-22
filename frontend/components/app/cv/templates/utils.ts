
import { CVData } from '@/types/cv';

/**
 * Utility to safely access nested CV data with fallback keys.
 * Often different templates or sources use slightly different field names.
 */
export const getSafeData = (data: any) => {
  const profile = data.profile || {};
  
  return {
    ...data,
    profile: {
      ...profile,
      name: profile.name || profile.fullName || 'Prénom Nom',
      title: profile.title || profile.position || 'Poste Visé',
      phone: profile.phone || profile.tel || '',
      email: profile.email || '',
      location: profile.location || profile.address || '',
      photo: profile.photo || profile.avatar || null,
    },
    experience: (data.experience || []).map((exp: any) => ({
      ...exp,
      title: exp.title || exp.position || exp.role || 'Poste',
      company: exp.company || exp.employer || 'Entreprise',
      dates: exp.dates || (exp.start && exp.end ? `${exp.start} - ${exp.end}` : exp.start || exp.end || ''),
      description: exp.description || '',
      tasks: exp.tasks || exp.bullets || [],
    })),
    education: (data.education || []).map((edu: any) => ({
      ...edu,
      degree: edu.degree || edu.diploma || 'Diplôme',
      institution: edu.institution || edu.school || 'Établissement',
      dates: edu.dates || edu.year || (edu.start && edu.end ? `${edu.start} - ${edu.end}` : edu.start || edu.end || ''),
    })),
    skills: data.skills || { groups: [] },
    languages: data.languages || [],
    projects: (data.projects || []).map((proj: any) => ({
      ...proj,
      name: proj.name || proj.title || 'Projet',
      description: proj.description || '',
      link: proj.link || proj.url || '',
    })),
    references: (data.references || []).map((ref: any) => ({
      ...ref,
      name: ref.name || 'Nom Référence',
      title: ref.title || '',
      company: ref.company || '',
      phone: ref.phone || '',
      email: ref.email || '',
    })),
  };
};

/**
 * Helper to check if a section is enabled in the config
 */
export const isSectionEnabled = (config: any, type: string) => {
  return config?.sections?.find((s: any) => s.type === type)?.enabled !== false;
};

/**
 * Helper to get a section's label from config or a default
 */
export const getSectionLabel = (config: any, type: string, defaultLabel: string) => {
  return config?.sections?.find((s: any) => s.type === type)?.label || defaultLabel;
};
