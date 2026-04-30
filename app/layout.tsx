import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Simulasi Gelombang',
  description: 'Simulasi fisika gelombang interaktif dengan visualisasi dan kontrol.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background h-full">
      <body className="font-sans antialiased bg-background h-full m-0 p-0">
        {children}
      </body>
    </html>
  )
}
