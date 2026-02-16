import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from './SessionProvider'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { dictationCssVars } from '@/lib/design-tokens'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const interSerif = Inter({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Simpliant Transcribe',
  description: 'Transkription für Word und Web – präzise, schnell und DSGVO-konform.',
  icons: {
    icon: [
      { url: '/assets/simpliant-icon.svg', type: 'image/svg+xml' },
      { url: '/assets/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/assets/icon-64.png', sizes: '64x64', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${interSerif.variable} font-sans`}>
        <SessionProvider>
          <div
            className="min-h-screen bg-background text-foreground"
            style={dictationCssVars}
          >
            <Navigation />
            <main>{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
