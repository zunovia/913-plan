import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Japan Monitor - リアルタイムインテリジェンスダッシュボード',
  description:
    'Japan real-time intelligence dashboard: earthquakes, news, markets, flights, cyber threats, and infrastructure on an interactive map.',
  keywords: ['Japan', 'monitor', 'earthquake', 'news', 'dashboard', 'real-time'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="h-full overflow-hidden bg-gray-950 text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
