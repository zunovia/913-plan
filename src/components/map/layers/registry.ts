import type { LayerDefinition } from '@/types/layers'

export const LAYER_REGISTRY: LayerDefinition[] = [
  {
    key: 'earthquakes',
    label: '地震',
    icon: 'activity',
    renderers: ['flat', 'globe'],
    defaultVisible: true,
    refreshInterval: 60_000,
  },
  {
    key: 'weather',
    label: '気象警報',
    icon: 'cloud-rain',
    renderers: ['flat', 'globe'],
    defaultVisible: true,
    refreshInterval: 600_000,
  },
  {
    key: 'flights',
    label: '航空機',
    icon: 'plane',
    renderers: ['flat', 'globe'],
    defaultVisible: false,
    refreshInterval: 15_000,
  },
  {
    key: 'vessels',
    label: '船舶',
    icon: 'ship',
    renderers: ['flat', 'globe'],
    defaultVisible: false,
    refreshInterval: 30_000,
  },
  {
    key: 'cables',
    label: '海底ケーブル',
    icon: 'cable',
    renderers: ['flat', 'globe'],
    defaultVisible: false,
    refreshInterval: 0,
  },
  {
    key: 'dataCenters',
    label: 'データセンター',
    icon: 'server',
    renderers: ['flat', 'globe'],
    defaultVisible: false,
    refreshInterval: 0,
  },
  {
    key: 'cyberThreats',
    label: 'サイバー脅威',
    icon: 'shield-alert',
    renderers: ['flat'],
    defaultVisible: false,
    refreshInterval: 600_000,
  },
  {
    key: 'prefectures',
    label: '都道府県',
    icon: 'map',
    renderers: ['flat'],
    defaultVisible: true,
    refreshInterval: 0,
  },
]

export function getLayerDef(key: string) {
  return LAYER_REGISTRY.find((l) => l.key === key)
}
