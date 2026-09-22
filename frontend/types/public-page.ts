export interface SectionsConfig {
  bio: boolean;
  experiences: boolean;
  education: boolean;
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  languages: boolean;
  links: boolean;
}

export type Theme = 'minimal' | 'modern' | 'bold' | 'elegant';

export interface PublicPage {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  sections: SectionsConfig;
  pinned_items?: Record<string, string[]> | null;
  expires_at?: string | null;
  is_active: boolean;
  theme: Theme;
  accent_color: string;
  show_photo: boolean;
  show_contact: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface PublicPageCreate {
  title: string;
  slug: string;
  sections?: Partial<SectionsConfig>;
  pinned_items?: Record<string, string[]> | null;
  expires_at?: string | null;
  is_active?: boolean;
  theme?: Theme;
  accent_color?: string;
  show_photo?: boolean;
  show_contact?: boolean;
}

export interface PublicPageUpdate extends Partial<PublicPageCreate> {}

export interface SlugCheck {
  slug: string;
  available: boolean;
  suggestion?: string | null;
}

export interface PublicPageData {
  page: {
    id: string;
    slug: string;
    title: string;
    theme: Theme;
    accent_color: string;
    show_photo: boolean;
    show_contact: boolean;
    sections: SectionsConfig;
    views: number;
  };
  profile: {
    first_name?: string;
    last_name?: string;
    username?: string;
    title?: string;
    bio?: string;
    location?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    linkedin_url?: string;
    github_url?: string;
    photo_url?: string;
    experiences: Array<{
      id: string; title: string; company: string; location?: string;
      start_date?: string; end_date?: string; current: boolean; description?: string;
    }>;
    educations: Array<{
      id: string; degree: string; school: string; location?: string;
      start_date?: string; end_date?: string; description?: string;
    }>;
    skills: Array<{ id: string; name: string; level?: string }>;
    projects: Array<{
      id: string; name: string; description?: string; url?: string;
      start_date?: string; end_date?: string;
    }>;
    certifications: Array<{
      id: string; name: string; issuer: string; date?: string; url?: string;
    }>;
    languages: Array<{ id: string; name: string; level?: string }>;
    links: Array<{ id: string; label: string; url: string }>;
  };
}
