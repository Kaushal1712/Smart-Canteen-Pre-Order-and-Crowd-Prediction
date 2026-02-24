'use client'

import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '14px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            padding: '16px'
          }
        }}
      />
    </MotionConfig>
  )
}
