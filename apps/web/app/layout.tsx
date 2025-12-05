import type { Metadata } from 'next'
import './globals.css'
import { LanguageInitializer } from '@/components/common/LanguageInitializer'

export const metadata: Metadata = {
  title: 'Company Search System',
  description: 'Company Search System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-display antialiased">
        <LanguageInitializer />
        {children}
      </body>
    </html>
  )
}

