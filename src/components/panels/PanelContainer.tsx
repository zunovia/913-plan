'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useResponsive } from '@/hooks/useResponsive'
import { usePanelStore } from '@/stores/panelStore'
import { CyberPanel } from './CyberPanel'
import { DisasterPanel } from './DisasterPanel'
import { InfraPanel } from './InfraPanel'
import { MarketPanel } from './MarketPanel'
import { NewsFeedPanel } from './NewsFeedPanel'
import { TransportPanel } from './TransportPanel'
import { WeatherPanel } from './WeatherPanel'

const PANELS = {
  news: NewsFeedPanel,
  disaster: DisasterPanel,
  weather: WeatherPanel,
  market: MarketPanel,
  transport: TransportPanel,
  cyber: CyberPanel,
  infra: InfraPanel,
} as const

export function PanelContainer() {
  const { activePanel, isPanelOpen, closePanel } = usePanelStore()
  const breakpoint = useResponsive()
  const isMobile = breakpoint === 'mobile'

  const PanelComponent = activePanel ? PANELS[activePanel] : null

  const motionProps = isMobile
    ? { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }
    : { initial: { x: 350 }, animate: { x: 0 }, exit: { x: 350 } }

  return (
    <AnimatePresence>
      {isPanelOpen && PanelComponent && (
        <motion.div
          {...motionProps}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={
            isMobile
              ? 'fixed inset-x-0 bottom-[88px] top-[20vh] z-40 rounded-t-2xl bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 flex flex-col overflow-hidden'
              : 'absolute right-0 top-0 bottom-0 md:w-[300px] lg:w-[350px] bg-gray-900/95 backdrop-blur-sm border-l border-gray-700/50 z-20 flex flex-col overflow-hidden'
          }
        >
          {/* Mobile drag handle */}
          {isMobile && (
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-600" />
            </div>
          )}

          <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
            <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              {activePanel}
            </h2>
            <button
              type="button"
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
