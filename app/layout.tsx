// app/layout.tsx — Javari Marketing
// Fortune 50 quality shell — auth, nav, Javari AI widget, social footer
// CR AudioViz AI, LLC · May 2026
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import AppShell from '@/components/AppShell'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Javari Marketing | AI Social Media & Campaign Manager',
  description: 'AI-powered social media management, campaign scheduling, and content generation for every platform. Built by CR AudioViz AI.',
  keywords: 'social media manager, AI marketing, content generation, campaign management',
  openGraph: {
    title: 'Javari Marketing — AI Social Media Manager',
    description: 'Schedule posts, generate content, and run campaigns across 15+ platforms with AI.',
    siteName: 'Javari Marketing',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0a0a0f' }}>
        <AuthProvider>
          <AppShell
            appName="Javari Marketing"
            appColor="#ef4444"
            appEmoji="📣"
            appDesc="AI social media manager — schedule, generate & publish to 15+ platforms"
            showCTA={true}
            ctaHeadline="Grow your audience with AI"
            handoffApp="Javari AI"
            handoffUrl="https://javariai.com"
            handoffPitch="Let Javari AI write all your content automatically"
          >
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
