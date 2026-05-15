export type LayerType =
  | 'earthquakes'
  | 'weather'
  | 'flights'
  | 'vessels'
  | 'cables'
  | 'dataCenters'
  | 'cyberThreats'
  | 'prefectures'

export type MapMode = '2d' | '3d'

export interface LayerDefinition {
  key: LayerType
  label: string
  icon: string
  renderers: ('flat' | 'globe')[]
  defaultVisible: boolean
  refreshInterval: number
}

export type PanelType = 'news' | 'disaster' | 'market' | 'transport' | 'cyber' | 'infra'
