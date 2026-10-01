
export interface CVProfile {
  name: string;
  title?: string;
  position?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  photo?: string;
  age?: string | number;
  nationality?: string;
  marital_status?: string;
  linkedin?: string;
  github?: string;
}

export interface CVExperience {
  position: string;
  company: string;
  dates?: string;
  start?: string;
  end?: string;
  description?: string;
  tasks?: string[];
  bullets?: string[];
  location?: string;
}

export interface CVEducation {
  degree: string;
  institution: string;
  dates?: string;
  start?: string;
  end?: string;
  description?: string;
  location?: string;
  year?: string;
  school?: string;
}

export interface CVSkillGroup {
  label?: string;
  items: string[];
}

export interface CVSkills {
  groups: CVSkillGroup[];
}

export interface CVLanguage {
  name: string;
  level: string;
}

export interface CVProject {
  name: string;
  description: string;
  link?: string;
  dates?: string;
}

export interface CVCustomSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'list';
}

export interface CVData {
  doc_type?: 'cv' | 'cover_letter';
  profile: CVProfile;
  summary?: string;
  experience?: CVExperience[];
  education?: CVEducation[];
  skills?: CVSkills;
  languages?: CVLanguage[];
  projects?: CVProject[];
  interests?: string[];
  references?: { name: string; title?: string; company?: string; phone?: string; email?: string }[];
  custom_sections?: CVCustomSection[];
  recipient?: {
    company_name?: string;
    contact_name?: string;
    contact_title?: string;
    address?: string;
  };
  letter_body?: {
    subject?: string;
    date_location?: string;
    opening?: string;
    body?: string;
    closing?: string;
  };
}

export interface TemplateSection {
  type: string;
  label?: string;
  enabled: boolean;
  column?: 'full' | 'left' | 'right' | 'main' | string;
  userCanDisable?: boolean;
  userCanMove?: boolean;
}

export interface TemplateConfig {
  templateName: string;
  displayName: string;
  sector?: string; // e.g. "Santé", "Tech"
  tokens: {
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorTextMain?: string;
    colorTextMuted?: string;
    fontHeading: string;
    fontBody: string;
    borderRadius?: string;
    spacing?: string;
    fontSize?: number;
    photoShape?: 'circle' | 'square' | 'rounded';
    sidebarWidth?: string;
    lineHeight?: number;
  };
  sections: TemplateSection[];
}

export interface TemplateProps {
  data: CVData;
  config: TemplateConfig;
  apiBaseUrl: string;
}
