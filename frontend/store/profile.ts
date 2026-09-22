import { create } from 'zustand';
import { MasterProfile, ProfileExperience, ProfileEducation, ProfileSkill, ProfileProject } from '@/types/profile';

type ProfileState = {
  profile: MasterProfile | null;
  isLoading: boolean;
  error: string | null;

  setProfile: (profile: MasterProfile) => void;
  updateProfile: (data: Partial<MasterProfile>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Experiences
  addExperience: (exp: ProfileExperience) => void;
  updateExperience: (id: string, data: Partial<ProfileExperience>) => void;
  removeExperience: (id: string) => void;

  // Educations
  addEducation: (edu: ProfileEducation) => void;
  updateEducation: (id: string, data: Partial<ProfileEducation>) => void;
  removeEducation: (id: string) => void;

  // Skills
  addSkill: (skill: ProfileSkill) => void;
  removeSkill: (id: string) => void;

  // Projects
  addProject: (project: ProfileProject) => void;
  updateProject: (id: string, data: Partial<ProfileProject>) => void;
  removeProject: (id: string) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  setProfile: (profile) => set({ profile, isLoading: false, error: null }),
  updateProfile: (data) => set((state) => ({ 
    profile: state.profile ? { ...state.profile, ...data } : null 
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),

  // Experiences
  addExperience: (exp) => set((state) => ({
    profile: state.profile ? { ...state.profile, experiences: [...state.profile.experiences, exp] } : null,
  })),
  updateExperience: (id, data) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      experiences: state.profile.experiences.map((e) => (e.id === id ? { ...e, ...data } : e)),
    } : null,
  })),
  removeExperience: (id) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      experiences: state.profile.experiences.filter((e) => e.id !== id),
    } : null,
  })),

  // Educations
  addEducation: (edu) => set((state) => ({
    profile: state.profile ? { ...state.profile, educations: [...state.profile.educations, edu] } : null,
  })),
  updateEducation: (id, data) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      educations: state.profile.educations.map((e) => (e.id === id ? { ...e, ...data } : e)),
    } : null,
  })),
  removeEducation: (id) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      educations: state.profile.educations.filter((e) => e.id !== id),
    } : null,
  })),

  // Skills
  addSkill: (skill) => set((state) => ({
    profile: state.profile ? { ...state.profile, skills: [...state.profile.skills, skill] } : null,
  })),
  removeSkill: (id) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      skills: state.profile.skills.filter((s) => s.id !== id),
    } : null,
  })),

  // Projects
  addProject: (project) => set((state) => ({
    profile: state.profile ? { ...state.profile, projects: [...state.profile.projects, project] } : null,
  })),
  updateProject: (id, data) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      projects: state.profile.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
    } : null,
  })),
  removeProject: (id) => set((state) => ({
    profile: state.profile ? {
      ...state.profile,
      projects: state.profile.projects.filter((p) => p.id !== id),
    } : null,
  })),
}));
