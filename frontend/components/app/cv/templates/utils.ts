
import { CVData } from '@/types/cv';

export const SIDEBAR_SECTION_TYPES = ['skills', 'languages', 'contact', 'identity', 'interests', 'photo'];

/**
 * Utility to safely access nested CV data with fallback keys.
 * Often different templates or sources use slightly different field names.
 */
export const formatDateToMonthYear = (dateStr: string): string => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  const match = str.match(/^(\d{4})-(\d{2})(?:-\d{2})?(?:T.*)?$/);
  if (match) {
    return `${match[2]}/${match[1]}`;
  }
  return str;
};

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
    experience: (data.experience || profile.experiences || []).map((exp: any) => {
      const start = formatDateToMonthYear(exp.start || exp.start_date);
      const end = formatDateToMonthYear(exp.end || exp.end_date) || (exp.start || exp.start_date ? 'Présent' : '');
      const defaultDates = start && end && start !== end ? `${start} - ${end}` : start || end;
      return {
        ...exp,
        title: exp.title || exp.position || exp.role || 'Poste',
        company: exp.company || exp.employer || 'Entreprise',
        dates: exp.dates || defaultDates,
        description: exp.description || exp.summary || '',
        tasks: exp.tasks || exp.bullets || [],
      };
    }),
    education: (data.education || profile.educations || []).map((edu: any) => {
      const start = formatDateToMonthYear(edu.start || edu.start_date);
      const end = formatDateToMonthYear(edu.end || edu.end_date);
      const defaultDates = start && end && start !== end ? `${start} - ${end}` : start || end || edu.year;
      return {
        ...edu,
        degree: edu.degree || edu.diploma || 'Diplôme',
        institution: edu.institution || edu.school || 'Établissement',
        dates: edu.dates || defaultDates,
      };
    }),
    skills: (() => {
      if (!rawSkills) return { groups: [] };

      const getSkillLevel = (lvl: any) => {
        if (lvl === undefined || lvl === null) return 85;
        if (typeof lvl === 'number') return lvl;
        const s = String(lvl).toLowerCase().trim();
        const num = parseInt(s);
        if (!isNaN(num) && num > 0) return num;
        if (s.includes('expert') || s.includes('courant') || s.includes('bilingue') || s.includes('native') || s.includes('fluent') || s.includes('excellent') || s.includes('master')) return 95;
        if (s.includes('avancé') || s.includes('advanced') || s.includes('bon')) return 80;
        if (s.includes('intermédiaire') || s.includes('intermediate') || s.includes('moyen')) return 60;
        if (s.includes('débutant') || s.includes('notions') || s.includes('beginner') || s.includes('basic') || s.includes('junior')) return 40;
        return 85;
      };

      const formatSkill = (s: any) => {
        if (typeof s === 'string') return { name: s, level: 85 };
        return { name: s.name || '', level: getSkillLevel(s.level) };
      };

      if (Array.isArray(rawSkills)) {
        const items = rawSkills.map(formatSkill).filter((s: any) => s.name);
        return { groups: items.length ? [{ label: '', items }] : [] };
      }
      if (rawSkills.groups && Array.isArray(rawSkills.groups)) {
        const normalizedGroups = rawSkills.groups.map((g: any) => ({
          ...g,
          items: Array.isArray(g.items)
            ? g.items.map(formatSkill).filter((i: any) => i.name)
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
    projects: (data.projects || profile.projects || []).map((proj: any) => {
      const start = formatDateToMonthYear(proj.start || proj.start_date);
      const end = formatDateToMonthYear(proj.end || proj.end_date) || (proj.start || proj.start_date ? 'Présent' : '');
      const defaultDates = start && end && start !== end ? `${start} - ${end}` : start || end;
      return {
        ...proj,
        name: proj.name || proj.title || 'Projet',
        description: proj.description || '',
        link: proj.link || proj.url || '',
        dates: proj.dates || defaultDates,
      };
    }),
    references: (data.references || profile.references || []).map((ref: any) => ({
      ...ref,
      name: ref.name || 'Nom Référence',
      title: ref.title || '',
      company: ref.company || '',
      phone: ref.phone || '',
      email: ref.email || '',
    })),
    certifications: (data.certifications || profile.certifications || []).map((cert: any) => {
      const date = formatDateToMonthYear(cert.date || cert.year);
      return {
        ...cert,
        name: cert.name || cert.title || 'Certification',
        issuer: cert.issuer || cert.organization || '',
        date: cert.dates || date || cert.date || cert.year || '',
        url: cert.url || cert.link || '',
      };
    }),
    custom_sections: data.custom_sections || profile.custom_sections || [],
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

