import type { Metadata } from 'next'
import { DM_Sans, Inter } from 'next/font/google'

import './globals.css'

import { Providers } from '@/components/shared/providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-display',
  display: 'swap'
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Smart Canteen',
  description: 'Skip the queue. Book your seat. Order ahead.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
