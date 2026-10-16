import { create } from 'zustand';

interface UiState {
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCreateModalOpen: false,
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  isMobileDrawerOpen: false,
  openMobileDrawer: () => set({ isMobileDrawerOpen: true }),
  closeMobileDrawer: () => set({ isMobileDrawerOpen: false }),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),
}));
