export interface ProfileExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  current: boolean;
  description?: string;
}

export interface ProfileEducation {
  id: string;
  degree: string;
  school: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

export interface ProfileSkill {
  id: string;
  name: string;
  category?: string;
  level?: string;
}

export interface ProfileProject {
  id: string;
  name: string;
  description?: string;
  url?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface ProfileCertification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  type?: 'text' | 'simple_list' | 'detailed_list';
  content?: string;
  items?: CustomSectionItem[];
}

export interface MasterProfile {
  id: string;
  user_id: string;
  username?: string;
  title?: string;
  bio?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  visibility: 'public' | 'private' | 'link_only';
  
  experiences: ProfileExperience[];
  educations: ProfileEducation[];
  skills: ProfileSkill[];
  projects: ProfileProject[];
  certifications: ProfileCertification[];
  custom_sections?: CustomSection[];
}
