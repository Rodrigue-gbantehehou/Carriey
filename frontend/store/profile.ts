import { create } from 'zustand';
import { MasterProfile, ProfileExperience, ProfileEducation, ProfileSkill, ProfileProject, ProfileCertification, ProfileLanguage, ProfileAchievement, ProfileLink, ProfileDocument } from '@/types/profile';
import { profileApi } from '@/lib/profile-api';
import toast from 'react-hot-toast';

// Base URL de l'API — jamais hardcodée
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? '/api/v1').replace(/\/$/, '');

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
  addExperience: (exp: Omit<ProfileExperience, 'id'>) => Promise<void>;
  updateExperience: (id: string, data: Partial<ProfileExperience>) => Promise<void>;
  removeExperience: (id: string) => Promise<void>;

  // Educations
  addEducation: (edu: Omit<ProfileEducation, 'id'>) => Promise<void>;
  updateEducation: (id: string, data: Partial<ProfileEducation>) => Promise<void>;
  removeEducation: (id: string) => Promise<void>;

  // Skills
  addSkill: (skill: Omit<ProfileSkill, 'id'>) => Promise<void>;
  removeSkill: (id: string) => Promise<void>;

  // Projects
  addProject: (project: Omit<ProfileProject, 'id'>) => Promise<void>;
  updateProject: (id: string, data: Partial<ProfileProject>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  // Certifications
  addCertification: (cert: Omit<ProfileCertification, 'id'>) => Promise<void>;
  removeCertification: (id: string) => Promise<void>;

  // Languages
  addLanguage: (lang: Omit<ProfileLanguage, 'id'>) => Promise<void>;
  removeLanguage: (id: string) => Promise<void>;

  // Achievements
  addAchievement: (ach: Omit<ProfileAchievement, 'id'>) => Promise<void>;
  removeAchievement: (id: string) => Promise<void>;

  // Links
  addLink: (link: Omit<ProfileLink, 'id'>) => Promise<void>;
  removeLink: (id: string) => Promise<void>;

  // Documents
  addDocument: (doc: Omit<ProfileDocument, 'id'>) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;

  // Custom Sections
  addCustomSection: (section: any) => Promise<void>;
  removeCustomSection: (id: string) => Promise<void>;
  addCustomSectionItem: (sectionId: string, item: any) => Promise<void>;
  removeCustomSectionItem: (sectionId: string, itemId: string) => Promise<void>;
  updateCustomSectionItem: (sectionId: string, itemId: string, data: any) => Promise<void>;
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
      toast.error("Une erreur est survenue lors de la mise à jour du profil.");
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
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  updateExperience: async (id, data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const updated = await profileApi.updateSubEntity(token, 'experiences', id, data);
      set((state) => ({ profile: state.profile ? { ...state.profile, experiences: state.profile.experiences.map((e) => e.id === id ? updated : e) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeExperience: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'experiences', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, experiences: state.profile.experiences.filter((e) => e.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Educations
  addEducation: async (edu) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'educations', edu);
      set((state) => ({ profile: state.profile ? { ...state.profile, educations: [...state.profile.educations, added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  updateEducation: async (id, data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const updated = await profileApi.updateSubEntity(token, 'educations', id, data);
      set((state) => ({ profile: state.profile ? { ...state.profile, educations: state.profile.educations.map((e) => e.id === id ? updated : e) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeEducation: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'educations', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, educations: state.profile.educations.filter((e) => e.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Skills
  addSkill: async (skill) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'skills', skill);
      set((state) => ({ profile: state.profile ? { ...state.profile, skills: [...state.profile.skills, added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeSkill: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'skills', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, skills: state.profile.skills.filter((s) => s.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Projects
  addProject: async (project) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'projects', project);
      set((state) => ({ profile: state.profile ? { ...state.profile, projects: [...state.profile.projects, added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  updateProject: async (id, data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const updated = await profileApi.updateSubEntity(token, 'projects', id, data);
      set((state) => ({ profile: state.profile ? { ...state.profile, projects: state.profile.projects.map((p) => p.id === id ? updated : p) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeProject: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'projects', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, projects: state.profile.projects.filter((p) => p.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Certifications
  addCertification: async (cert) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'certifications', cert);
      set((state) => ({ profile: state.profile ? { ...state.profile, certifications: [...state.profile.certifications, added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeCertification: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'certifications', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, certifications: state.profile.certifications.filter((c) => c.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Languages
  addLanguage: async (lang) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'languages', lang);
      set((state) => ({ profile: state.profile ? { ...state.profile, languages: [...(state.profile.languages || []), added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeLanguage: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'languages', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, languages: (state.profile.languages || []).filter((l) => l.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Achievements
  addAchievement: async (ach) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'achievements', ach);
      set((state) => ({ profile: state.profile ? { ...state.profile, achievements: [...(state.profile.achievements || []), added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeAchievement: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'achievements', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, achievements: (state.profile.achievements || []).filter((a) => a.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Links
  addLink: async (link) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'links', link);
      set((state) => ({ profile: state.profile ? { ...state.profile, links: [...(state.profile.links || []), added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeLink: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'links', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, links: (state.profile.links || []).filter((l) => l.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Documents
  addDocument: async (doc) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'documents', doc);
      set((state) => ({ profile: state.profile ? { ...state.profile, documents: [...(state.profile.documents || []), added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeDocument: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'documents', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, documents: (state.profile.documents || []).filter((d) => d.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

  // Custom Sections
  addCustomSection: async (section) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const added = await profileApi.addSubEntity(token, 'custom_sections', section);
      set((state) => ({ profile: state.profile ? { ...state.profile, custom_sections: [...(state.profile.custom_sections || []), added] } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeCustomSection: async (id) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      await profileApi.deleteSubEntity(token, 'custom_sections', id);
      set((state) => ({ profile: state.profile ? { ...state.profile, custom_sections: (state.profile.custom_sections || []).filter((c: any) => c.id !== id) } : null }));
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  addCustomSectionItem: async (sectionId, item) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const res = await fetch(`${API_BASE}/profile/me/custom_sections/${sectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error("Failed to add custom section item");
      const addedItem = await res.json();
      set((state) => {
        if (!state.profile) return { profile: null };
        const updatedSections = (state.profile.custom_sections || []).map((cs: any) => {
          if (cs.id === sectionId) {
            return { ...cs, items: [...(cs.items || []), addedItem] };
          }
          return cs;
        });
        return { profile: { ...state.profile, custom_sections: updatedSections } };
      });
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  removeCustomSectionItem: async (sectionId, itemId) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const res = await fetch(`${API_BASE}/profile/me/custom_sections/${sectionId}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete custom section item");
      set((state) => {
        if (!state.profile) return { profile: null };
        const updatedSections = (state.profile.custom_sections || []).map((cs: any) => {
          if (cs.id === sectionId) {
            return { ...cs, items: (cs.items || []).filter((i: any) => i.id !== itemId) };
          }
          return cs;
        });
        return { profile: { ...state.profile, custom_sections: updatedSections } };
      });
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },
  updateCustomSectionItem: async (sectionId, itemId, data) => {
    const { token, profile } = get();
    if (!token || !profile) return;
    try {
      const res = await fetch(`${API_BASE}/profile/me/custom_sections/${sectionId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update custom section item");
      const updatedItem = await res.json();
      set((state) => {
        if (!state.profile) return { profile: null };
        const updatedSections = (state.profile.custom_sections || []).map((cs: any) => {
          if (cs.id === sectionId) {
            return { ...cs, items: (cs.items || []).map((i: any) => i.id === itemId ? updatedItem : i) };
          }
          return cs;
        });
        return { profile: { ...state.profile, custom_sections: updatedSections } };
      });
    } catch (e) { console.error(e); toast.error("Une erreur est survenue lors de la sauvegarde."); }
  },

}));
