'use client'

import type { ReactNode } from 'react'
import { SWRConfig } from 'swr'

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
      {children}
    </SWRConfig>
  )
}
