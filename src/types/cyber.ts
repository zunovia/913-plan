export interface CyberThreat {
  id: string
  title: string
  description: string
  source: 'jpcert' | 'otx' | 'other'
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  publishedAt: string
  link: string
  indicators?: string[]
  tags?: string[]
}
