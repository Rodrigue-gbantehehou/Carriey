import { create } from 'zustand';
import { CV } from '@/lib/cv-api';

interface CvState {
  cvs: CV[];
  loading: boolean;
  setCvs: (cvs: CV[]) => void;
  setLoading: (loading: boolean) => void;
  addCv: (cv: CV) => void;
  updateCv: (id: string, data: Partial<CV>) => void;
  removeCv: (id: string) => void;
}

export const useCvStore = create<CvState>((set) => ({
  cvs: [],
  loading: false,
  
  setCvs: (cvs) => set({ cvs }),
  setLoading: (loading) => set({ loading }),
  
  addCv: (cv) => set((state) => ({
    cvs: [cv, ...state.cvs]
  })),

  updateCv: (id, data) => set((state) => ({
    cvs: state.cvs.map(cv => 
      cv.id === id 
        ? { ...cv, ...data, updated_at: new Date().toISOString() } 
        : cv
    )
  })),

  removeCv: (id) => set((state) => ({
    cvs: state.cvs.filter(cv => cv.id !== id)
  })),
}));
