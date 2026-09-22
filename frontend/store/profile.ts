import { create } from 'zustand';
import { MasterProfile, ProfileExperience, ProfileEducation, ProfileSkill, ProfileProject, ProfileCertification, ProfileLanguage, ProfileAchievement, ProfileLink, ProfileDocument } from '@/types/profile';
import { profileApi } from '@/lib/profile-api';

type ProfileState = {
  profile: MasterProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  setToken: (token: string | null) => void;
  setProfile: (profile: MasterProfile) => void;
  updateProfile: (data: Partial<MasterProfile>) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Experiences
  addExperience: (exp: ProfileExperience) => Promise<void>;
  updateExperience: (id: string, data: Partial<ProfileExperience>) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;

  // Educations
  addEducation: (edu: ProfileEducation) => Promise<void>;
  updateEducation: (id: string, data: Partial<ProfileEducation>) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;

  // Skills
  addSkill: (skill: ProfileSkill) => Promise<void>;
  removeSkill: (id: string) => Promise<void>;

  // Projects
  addProject: (project: ProfileProject) => Promise<void>;
  updateProject: (id: string, data: Partial<ProfileProject>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  // Certifications
  addCertification: (cert: ProfileCertification) => Promise<void>;
  removeCertification: (id: string) => Promise<void>;

  // Languages
  addLanguage: (lang: ProfileLanguage) => Promise<void>;
  removeLanguage: (id: string) => Promise<void>;

  // Achievements
  addAchievement: (ach: ProfileAchievement) => Promise<void>;
  removeAchievement: (id: string) => Promise<void>;

  // Links
  addLink: (link: ProfileLink) => Promise<void>;
  removeLink: (id: string) => Promise<void>;

  // Documents
  addDocument: (doc: ProfileDocument) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  token: null,
  isLoading: false,
  error: null,

  setToken: (token) => set({ token }),
  setProfile: (profile) => set({ profile, isLoading: false, error: null }),
  
  updateProfile: async (data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    // Optimistic update
    set({ profile: { ...profile, ...data } });
    try {
      await profileApi.updateProfile(token, data);
    } catch (e) {
      console.error(e);
      // Revert could be implemented here
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  // Experiences
  addExperience: async (exp) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'experiences', exp);
      set((state) => ({ profile: state.profile ? { ...state.profile, experiences: [...state.profile.experiences, added] } : null }));
    } catch (e) { console.error(e); }
  },
  updateExperience: async (id, data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const updated = await profileApi.updateSubEntity(token, 'experiences', id, data);
      set((state) => ({ profile: state.profile ? { ...state.profile, experiences: state.profile.experiences.map((e) => e.id === id ? updated : e) } : null }));
    } catch (e) { console.error(e); }
  },
  removeExperience: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'experiences', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, experiences: state.profile.experiences.filter((e) => e.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Educations
  addEducation: async (edu) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'educations', edu);
      set((state) => ({ profile: state.profile ? { ...state.profile, educations: [...state.profile.educations, added] } : null }));
    } catch (e) { console.error(e); }
  },
  updateEducation: async (id, data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const updated = await profileApi.updateSubEntity(token, 'educations', id, data);
      set((state) => ({ profile: state.profile ? { ...state.profile, educations: state.profile.educations.map((e) => e.id === id ? updated : e) } : null }));
    } catch (e) { console.error(e); }
  },
  removeEducation: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'educations', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, educations: state.profile.educations.filter((e) => e.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Skills
  addSkill: async (skill) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'skills', skill);
      set((state) => ({ profile: state.profile ? { ...state.profile, skills: [...state.profile.skills, added] } : null }));
    } catch (e) { console.error(e); }
  },
  removeSkill: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'skills', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, skills: state.profile.skills.filter((s) => s.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Projects
  addProject: async (project) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'projects', project);
      set((state) => ({ profile: state.profile ? { ...state.profile, projects: [...state.profile.projects, added] } : null }));
    } catch (e) { console.error(e); }
  },
  updateProject: async (id, data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const updated = await profileApi.updateSubEntity(token, 'projects', id, data);
      set((state) => ({ profile: state.profile ? { ...state.profile, projects: state.profile.projects.map((p) => p.id === id ? updated : p) } : null }));
    } catch (e) { console.error(e); }
  },
  removeProject: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'projects', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, projects: state.profile.projects.filter((p) => p.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Certifications
  addCertification: async (cert) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'certifications', cert);
      set((state) => ({ profile: state.profile ? { ...state.profile, certifications: [...state.profile.certifications, added] } : null }));
    } catch (e) { console.error(e); }
  },
  removeCertification: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'certifications', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, certifications: state.profile.certifications.filter((c) => c.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Languages
  addLanguage: async (lang) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'languages', lang);
      set((state) => ({ profile: state.profile ? { ...state.profile, languages: [...(state.profile.languages || []), added] } : null }));
    } catch (e) { console.error(e); }
  },
  removeLanguage: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'languages', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, languages: (state.profile.languages || []).filter((l) => l.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Achievements
  addAchievement: async (ach) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'achievements', ach);
      set((state) => ({ profile: state.profile ? { ...state.profile, achievements: [...(state.profile.achievements || []), added] } : null }));
    } catch (e) { console.error(e); }
  },
  removeAchievement: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'achievements', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, achievements: (state.profile.achievements || []).filter((a) => a.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Links
  addLink: async (link) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'links', link);
      set((state) => ({ profile: state.profile ? { ...state.profile, links: [...(state.profile.links || []), added] } : null }));
    } catch (e) { console.error(e); }
  },
  removeLink: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'links', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, links: (state.profile.links || []).filter((l) => l.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },

  // Documents
  addDocument: async (doc) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'documents', doc);
      set((state) => ({ profile: state.profile ? { ...state.profile, documents: [...(state.profile.documents || []), added] } : null }));
    } catch (e) { console.error(e); }
  },
  removeDocument: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'documents', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, documents: (state.profile.documents || []).filter((d) => d.id !== id) } : null }));
    } catch (e) { console.error(e); }
  },
}));
