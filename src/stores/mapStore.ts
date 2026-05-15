import { create } from 'zustand'
import type { LayerType, MapMode } from '@/types/layers'

interface ViewState {
  longitude: number
  latitude: number
  zoom: number
  pitch: number
  bearing: number
}

interface MapState {
  mode: MapMode
  viewState: ViewState
  visibleLayers: Set<LayerType>
  selectedFeature: { type: LayerType; id: string; data: unknown } | null
  isLoading: boolean

  setMode: (mode: MapMode) => void
  setViewState: (vs: Partial<ViewState>) => void
  toggleLayer: (layer: LayerType) => void
  setLayerVisible: (layer: LayerType, visible: boolean) => void
  selectFeature: (feature: MapState['selectedFeature']) => void
  clearSelection: () => void
}

const DEFAULT_VIEW: ViewState = {
  longitude: 137,
  latitude: 38,
  zoom: 5,
  pitch: 0,
  bearing: 0,
}

const DEFAULT_VISIBLE: LayerType[] = ['earthquakes', 'weather', 'prefectures']

export const useMapStore = create<MapState>((set) => ({
  mode: '2d',
  viewState: DEFAULT_VIEW,
  visibleLayers: new Set<LayerType>(DEFAULT_VISIBLE),
  selectedFeature: null,
  isLoading: false,

  setMode: (mode) => set({ mode }),
  setViewState: (vs) =>
    set((state) => ({ viewState: { ...state.viewState, ...vs } })),
  toggleLayer: (layer) =>
    set((state) => {
      const next = new Set(state.visibleLayers)
      if (next.has(layer)) next.delete(layer)
      else next.add(layer)
      return { visibleLayers: next }
    }),
  setLayerVisible: (layer, visible) =>
    set((state) => {
      const next = new Set(state.visibleLayers)
      if (visible) next.add(layer)
      else next.delete(layer)
      return { visibleLayers: next }
    }),
  selectFeature: (feature) => set({ selectedFeature: feature }),
  clearSelection: () => set({ selectedFeature: null }),
}))
