export interface WeatherWarning {
  areaCode: string
  areaName: string
  level: 'advisory' | 'warning' | 'emergency' // 注意報, 警報, 特別警報
  types: string[] // ['大雨', '洪水'] etc
  issuedAt: string
  latitude: number
  longitude: number
}

// 気象庁 bosai API map.json の警報コード定義
// https://www.jma.go.jp/bosai/warning/
// 参照: JMA WARNING_INFOS (four4to6.x0.com/991/)
// 実データ検証済み: headlineText と code の対応を確認
export const WARNING_CODE_MAP: Record<
  string,
  { name: string; level: 'advisory' | 'warning' | 'emergency' }
> = {
  // 特別警報 (Emergency) — level-40/50
  '32': { name: '暴風雪', level: 'emergency' },
  '33': { name: '大雨', level: 'emergency' },
  '35': { name: '暴風', level: 'emergency' },
  '36': { name: '大雪', level: 'emergency' },
  '37': { name: '波浪', level: 'emergency' },
  '38': { name: '高潮', level: 'emergency' },
  // 警報 (Warning) — level-30
  '02': { name: '暴風雪', level: 'warning' },
  '03': { name: '大雨', level: 'warning' },
  '04': { name: '洪水', level: 'warning' },
  '05': { name: '暴風', level: 'warning' },
  '06': { name: '大雪', level: 'warning' },
  '07': { name: '波浪', level: 'warning' },
  '08': { name: '高潮', level: 'warning' },
  // 注意報 (Advisory) — level-20
  '10': { name: '大雨', level: 'advisory' },
  '12': { name: '大雪', level: 'advisory' },
  '13': { name: '風雪', level: 'advisory' },
  '14': { name: '雷', level: 'advisory' },
  '15': { name: '強風', level: 'advisory' },
  '16': { name: '波浪', level: 'advisory' },
  '17': { name: '融雪', level: 'advisory' },
  '18': { name: '洪水', level: 'advisory' },
  '19': { name: '高潮', level: 'advisory' },
  '20': { name: '濃霧', level: 'advisory' },
  '21': { name: '乾燥', level: 'advisory' },
  '22': { name: 'なだれ', level: 'advisory' },
  '23': { name: '低温', level: 'advisory' },
  '24': { name: '霜', level: 'advisory' },
  '25': { name: '着氷', level: 'advisory' },
  '26': { name: '着雪', level: 'advisory' },
}

// 気象庁 map.json の警報ステータス
export const ACTIVE_STATUSES = ['発表', '継続']
