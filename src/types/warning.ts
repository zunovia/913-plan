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
// 特別警報: 02-07, 警報: 10-16, 注意報: 17-32
export const WARNING_CODE_MAP: Record<
  string,
  { name: string; level: 'advisory' | 'warning' | 'emergency' }
> = {
  // 特別警報 (Emergency)
  '02': { name: '暴風雪', level: 'emergency' },
  '03': { name: '大雨', level: 'emergency' },
  '04': { name: '暴風', level: 'emergency' },
  '05': { name: '大雪', level: 'emergency' },
  '06': { name: '波浪', level: 'emergency' },
  '07': { name: '高潮', level: 'emergency' },
  // 警報 (Warning)
  '10': { name: '大雨', level: 'warning' },
  '11': { name: '洪水', level: 'warning' },
  '12': { name: '大雪', level: 'warning' },
  '13': { name: '暴風', level: 'warning' },
  '14': { name: '暴風雪', level: 'warning' },
  '15': { name: '波浪', level: 'warning' },
  '16': { name: '高潮', level: 'warning' },
  // 注意報 (Advisory)
  '17': { name: '高潮', level: 'advisory' },
  '18': { name: '大雨', level: 'advisory' },
  '19': { name: '洪水', level: 'advisory' },
  '20': { name: '大雪', level: 'advisory' },
  '21': { name: '雷', level: 'advisory' },
  '22': { name: '強風', level: 'advisory' },
  '23': { name: '風雪', level: 'advisory' },
  '24': { name: '波浪', level: 'advisory' },
  '25': { name: '融雪', level: 'advisory' },
  '26': { name: '濃霧', level: 'advisory' },
  '27': { name: '乾燥', level: 'advisory' },
  '28': { name: 'なだれ', level: 'advisory' },
  '29': { name: '低温', level: 'advisory' },
  '30': { name: '霜', level: 'advisory' },
  '31': { name: '着氷', level: 'advisory' },
  '32': { name: '着雪', level: 'advisory' },
}

// 気象庁 map.json の警報ステータス
export const ACTIVE_STATUSES = ['発表', '継続']
