'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { SWRConfig } from 'swr'
import { useSettingsStore } from '@/stores/settingsStore'

function ThemeSync() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.style.setProperty('--background', '#0a0a0a')
      root.style.setProperty('--foreground', '#ededed')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      root.style.setProperty('--background', '#f5f5f5')
      root.style.setProperty('--foreground', '#171717')
    }
    document.body.className = theme === 'dark'
      ? 'h-full overflow-hidden bg-gray-950 text-gray-100'
      : 'h-full overflow-hidden bg-gray-100 text-gray-900'
  }, [theme])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        fetcher: (url: string) => fetch(url).then((r) => r.json()),
      }}
    >
      <ThemeSync />
      {children}
    </SWRConfig>
  )
}
