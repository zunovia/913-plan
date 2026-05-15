import { create } from 'zustand'

interface FilterState {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d'
  minMagnitude: number
  language: 'ja' | 'en' | 'both'

  setTimeRange: (range: FilterState['timeRange']) => void
  setMinMagnitude: (mag: number) => void
  setLanguage: (lang: FilterState['language']) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  timeRange: '24h',
  minMagnitude: 3.0,
  language: 'both',

  setTimeRange: (timeRange) => set({ timeRange }),
  setMinMagnitude: (minMagnitude) => set({ minMagnitude }),
  setLanguage: (language) => set({ language }),
}))
