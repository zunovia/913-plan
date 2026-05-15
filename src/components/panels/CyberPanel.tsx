'use client'

import { useCyberThreats } from '@/hooks/useCyberThreats'
import { ShieldAlert, ExternalLink, Loader2 } from 'lucide-react'

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-900/40 text-red-300',
  high: 'bg-orange-900/40 text-orange-300',
  medium: 'bg-yellow-900/40 text-yellow-300',
  low: 'bg-blue-900/40 text-blue-300',
  info: 'bg-gray-800/40 text-gray-400',
}

export function CyberPanel() {
  const { threats, isLoading } = useCyberThreats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={20} className="animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldAlert size={14} className="text-purple-400" />
        <span className="text-xs text-gray-400">{threats.length}件の脅威情報</span>
      </div>

      <div className="space-y-1">
        {threats.slice(0, 30).map((t) => (
          <a
            key={t.id}
            href={t.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 rounded bg-gray-800/30 hover:bg-gray-800/50 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-200 line-clamp-2 group-hover:text-white">
                  {t.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1 rounded ${SEVERITY_COLORS[t.severity] ?? SEVERITY_COLORS.info}`}>
                    {t.severity}
                  </span>
                  <span className="text-[10px] text-gray-600 uppercase">{t.source}</span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(t.publishedAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              </div>
              <ExternalLink size={10} className="text-gray-600 group-hover:text-gray-400 mt-0.5 shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
