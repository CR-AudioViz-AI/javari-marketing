// app/layout.tsx — Javari Marketing
// Fortune 50 quality — uses AppShell for full ecosystem integration
// May 17, 2026 — CR AudioViz AI, LLC
import type { Metadata } from 'next'
import './globals.css'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Javari Marketing | Javari by CR AudioViz AI',
  description: 'AI marketing tools for businesses',
  keywords: 'Javari Marketing, Javari, AI, CR AudioViz AI',
}

import AppShell from '@/components/AppShell'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <AppShell
          appName="Javari Marketing"
          appColor="#ef4444"
          appEmoji="📢"
          appDesc="AI marketing tools for businesses"
      handoffApp="Javari Social"
      handoffUrl="https://javarisocial.com"
      handoffPitch="Generate your social posts with AI →"
        >
          {children}
        </AppShell>
      </body>
    </html>
  )
}
