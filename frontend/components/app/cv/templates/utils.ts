
import { CVData } from '@/types/cv';

export const SIDEBAR_SECTION_TYPES = ['skills', 'languages', 'contact', 'identity', 'interests', 'photo'];

/**
 * Utility to safely access nested CV data with fallback keys.
 * Often different templates or sources use slightly different field names.
 */
export const getSafeData = (data: any) => {
  if (!data) data = {};
  const profile = data.profile || {};
  const rawSkills = data.skills || profile.skills;
  const rawLanguages = data.languages || profile.languages;
  const rawInterests = data.interests || profile.interests;

  return {
    ...data,
    profile: {
      ...profile,
      name: profile.name || profile.fullName || (profile.first_name || profile.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Prénom Nom'),
      title: profile.title || profile.position || 'Poste Visé',
      phone: profile.phone || profile.tel || profile.contact_phone || '',
      email: profile.email || profile.contact_email || '',
      location: profile.location || profile.address || '',
      photo: profile.photo || profile.avatar || profile.photo_url || null,
    },
    summary: data.summary || profile.bio || profile.summary || '',
    experience: (data.experience || profile.experiences || []).map((exp: any) => ({
      ...exp,
      title: exp.title || exp.position || exp.role || 'Poste',
      company: exp.company || exp.employer || 'Entreprise',
      dates: exp.dates || (exp.start && exp.end ? `${exp.start} - ${exp.end}` : exp.start || exp.end || (exp.start_date ? `${exp.start_date} - ${exp.end_date || 'Présent'}` : '')),
      description: exp.description || exp.summary || '',
      tasks: exp.tasks || exp.bullets || [],
    })),
    education: (data.education || profile.educations || []).map((edu: any) => ({
      ...edu,
      degree: edu.degree || edu.diploma || 'Diplôme',
      institution: edu.institution || edu.school || 'Établissement',
      dates: edu.dates || edu.year || (edu.start && edu.end ? `${edu.start} - ${edu.end}` : edu.start || edu.end || (edu.start_date ? `${edu.start_date} - ${edu.end_date || ''}` : '')),
    })),
    skills: (() => {
      if (!rawSkills) return { groups: [] };
      if (Array.isArray(rawSkills)) {
        const items = rawSkills.map((s: any) => typeof s === 'string' ? s : s.name || '').filter(Boolean);
        return { groups: items.length ? [{ label: '', items }] : [] };
      }
      if (rawSkills.groups && Array.isArray(rawSkills.groups)) {
        const normalizedGroups = rawSkills.groups.map((g: any) => ({
          ...g,
          items: Array.isArray(g.items)
            ? g.items.map((i: any) => typeof i === 'string' ? i : i.name || '').filter(Boolean)
            : []
        })).filter((g: any) => g.items && g.items.length > 0);
        return { groups: normalizedGroups };
      }
      return { groups: [] };
    })(),
    languages: Array.isArray(rawLanguages) 
      ? rawLanguages.map((l: any) => typeof l === 'string' ? { name: l, level: '' } : { name: l.name || '', level: l.level || '' })
      : [],
    interests: Array.isArray(rawInterests) 
      ? rawInterests.map((i: any) => typeof i === 'string' ? i : i.name || '').filter(Boolean) 
      : [],
    projects: (data.projects || profile.projects || []).map((proj: any) => ({
      ...proj,
      name: proj.name || proj.title || 'Projet',
      description: proj.description || '',
      link: proj.link || proj.url || '',
    })),
    references: (data.references || profile.references || []).map((ref: any) => ({
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
  const section = config?.sections?.find((s: any) => s.type === type);
  if (!section) return true;
  return section.enabled !== false;
};

/**
 * Helper to get a section's label from config or a default
 */
export const getSectionLabel = (config: any, type: string, defaultLabel: string) => {
  return config?.sections?.find((s: any) => s.type === type)?.label || defaultLabel;
};

/**
 * Returns sections configured for left column or defaults sidebar sections to left column.
 */
export const getLeftColumnSections = (config: any) => {
  if (!config?.sections) return [];
  return config.sections.filter((s: any) => {
    if (s.enabled === false) return false;
    if (s.column === 'left') return true;
    if (s.column === 'right') return false;
    return SIDEBAR_SECTION_TYPES.includes(s.type);
  });
};

/**
 * Returns sections configured for right column or defaults main sections to right column.
 */
export const getRightColumnSections = (config: any) => {
  if (!config?.sections) return [];
  return config.sections.filter((s: any) => {
    if (s.enabled === false) return false;
    if (s.column === 'right') return true;
    if (s.column === 'left') return false;
    return !SIDEBAR_SECTION_TYPES.includes(s.type);
  });
};

