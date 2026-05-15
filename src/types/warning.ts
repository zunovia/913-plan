export interface WeatherWarning {
  areaCode: string
  areaName: string
  level: 'advisory' | 'warning' | 'emergency' // 注意報, 警報, 特別警報
  types: string[] // ['大雨', '洪水'] etc
  issuedAt: string
  latitude: number
  longitude: number
}

// 気象庁 map.json の警報コード定義
// https://www.jma.go.jp/bosai/warning/
export const WARNING_CODE_MAP: Record<string, { name: string; level: 'advisory' | 'warning' | 'emergency' }> = {
  '10': { name: '大雨', level: 'emergency' },       // 大雨特別警報
  '11': { name: '暴風', level: 'emergency' },       // 暴風特別警報
  '12': { name: '高潮', level: 'emergency' },       // 高潮特別警報
  '13': { name: '波浪', level: 'emergency' },       // 波浪特別警報
  '14': { name: '大雪', level: 'emergency' },       // 大雪特別警報
  '15': { name: '大雨', level: 'advisory' },        // 大雨注意報
  '16': { name: '洪水', level: 'advisory' },        // 洪水注意報
  '17': { name: '大雪', level: 'advisory' },        // 大雪注意報
  '18': { name: '暴風雪', level: 'advisory' },      // 暴風雪注意報
  '19': { name: '強風', level: 'advisory' },        // 強風注意報
  '20': { name: '大雨', level: 'warning' },         // 大雨警報
  '21': { name: '洪水', level: 'warning' },         // 洪水警報
  '22': { name: '大雪', level: 'warning' },         // 大雪警報
  '23': { name: '暴風', level: 'warning' },         // 暴風警報
  '24': { name: '暴風雪', level: 'warning' },       // 暴風雪警報
  '25': { name: '波浪', level: 'warning' },         // 波浪警報
  '26': { name: '高潮', level: 'warning' },         // 高潮警報
  '32': { name: '濃霧', level: 'advisory' },        // 濃霧注意報
  '33': { name: '雷', level: 'advisory' },          // 雷注意報
  '34': { name: '乾燥', level: 'advisory' },        // 乾燥注意報
  '35': { name: '着雪', level: 'advisory' },        // 着雪注意報
  '36': { name: 'なだれ', level: 'advisory' },      // なだれ注意報
  '37': { name: '低温', level: 'advisory' },        // 低温注意報
  '38': { name: '霜', level: 'advisory' },          // 霜注意報
  '39': { name: '着氷', level: 'advisory' },        // 着氷注意報
}

// 気象庁 map.json の警報ステータス
export const ACTIVE_STATUSES = ['発表', '継続']
