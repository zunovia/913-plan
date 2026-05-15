'use client'

import { usePanelStore } from '@/stores/panelStore'
import { NewsFeedPanel } from './NewsFeedPanel'
import { DisasterPanel } from './DisasterPanel'
import { MarketPanel } from './MarketPanel'
import { TransportPanel } from './TransportPanel'
import { CyberPanel } from './CyberPanel'
import { InfraPanel } from './InfraPanel'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PANELS = {
  news: NewsFeedPanel,
  disaster: DisasterPanel,
  market: MarketPanel,
  transport: TransportPanel,
  cyber: CyberPanel,
  infra: InfraPanel,
} as const

export function PanelContainer() {
  const { activePanel, isPanelOpen, closePanel } = usePanelStore()

  const PanelComponent = activePanel ? PANELS[activePanel] : null

  return (
    <AnimatePresence>
      {isPanelOpen && PanelComponent && (
        <motion.div
          initial={{ x: 350 }}
          animate={{ x: 0 }}
          exit={{ x: 350 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-[350px] bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 z-20 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
            <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              {activePanel}
            </h2>
            <button
              onClick={closePanel}
              className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PanelComponent />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
