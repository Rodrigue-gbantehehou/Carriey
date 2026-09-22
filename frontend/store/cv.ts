import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CV {
  id: string;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  
  // Wizard config
  usage?: string;
  disabledSections?: string[];
  disabledItems?: Record<string, string[]>;
}

interface CvState {
  cvs: CV[];
  addCv: (cv: CV) => void;
  updateCv: (id: string, data: Partial<CV>) => void;
  removeCv: (id: string) => void;
}

export const useCvStore = create<CvState>()(
  persist(
    (set) => ({
      cvs: [],
      
      addCv: (cv) => set((state) => ({
        cvs: [cv, ...state.cvs]
      })),

      updateCv: (id, data) => set((state) => ({
        cvs: state.cvs.map(cv => 
          cv.id === id 
            ? { ...cv, ...data, updatedAt: new Date().toISOString() } 
            : cv
        )
      })),

      removeCv: (id) => set((state) => ({
        cvs: state.cvs.filter(cv => cv.id !== id)
      })),
    }),
    {
      name: 'cariey-cv-storage',
    }
  )
);
