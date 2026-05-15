import { create } from 'zustand'
import type { PanelType } from '@/types/layers'

interface PanelState {
  activePanel: PanelType | null
  isPanelOpen: boolean

  setActivePanel: (panel: PanelType | null) => void
  togglePanel: (panel: PanelType) => void
  closePanel: () => void
}

export const usePanelStore = create<PanelState>((set) => ({
  activePanel: 'news',
  isPanelOpen: true,

  setActivePanel: (panel) => set({ activePanel: panel, isPanelOpen: panel !== null }),
  togglePanel: (panel) =>
    set((state) => {
      if (state.activePanel === panel && state.isPanelOpen) {
        return { isPanelOpen: false }
      }
      return { activePanel: panel, isPanelOpen: true }
    }),
  closePanel: () => set({ isPanelOpen: false }),
}))
