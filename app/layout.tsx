import { Inter } from 'next/font/google'
import './globals.css'
import EcosystemNav from '@/components/ecosystem/EcosystemNav'
import EcosystemFooter from '@/components/ecosystem/EcosystemFooter'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Marketing Command Center | CR AudioViz AI',
  description: 'AI-powered marketing strategy generator with 100+ FREE platforms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-white antialiased`}>
        <EcosystemNav appName="Javari Marketing" />{children}<EcosystemFooter />
      </body>
    </html>
  )
}
