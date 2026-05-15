import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'
type TileProvider = 'openfreemap' | 'google'

interface SettingsState {
  theme: Theme
  tileProvider: TileProvider
  autoRotateGlobe: boolean
  showTicker: boolean
  tickerSpeed: number

  setTheme: (theme: Theme) => void
  setTileProvider: (provider: TileProvider) => void
  setAutoRotateGlobe: (v: boolean) => void
  setShowTicker: (v: boolean) => void
  setTickerSpeed: (speed: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      tileProvider: 'openfreemap',
      autoRotateGlobe: true,
      showTicker: true,
      tickerSpeed: 50,

      setTheme: (theme) => set({ theme }),
      setTileProvider: (tileProvider) => set({ tileProvider }),
      setAutoRotateGlobe: (autoRotateGlobe) => set({ autoRotateGlobe }),
      setShowTicker: (showTicker) => set({ showTicker }),
      setTickerSpeed: (tickerSpeed) => set({ tickerSpeed }),
    }),
    { name: 'japan-monitor-settings' },
  ),
)
