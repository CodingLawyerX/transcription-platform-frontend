import type { Metadata } from 'next'
import { Sora, Fraunces } from 'next/font/google'
import './globals.css'
import { SessionProvider } from './SessionProvider'
import Navigation from '@/components/Navigation'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Simpliant App',
  description: 'Sichere Arbeitsbereiche, klare Workflows und kollaborative Prozesse.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={`${sora.variable} ${fraunces.variable} font-sans`}>
        <SessionProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
