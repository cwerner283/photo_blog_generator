import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Travel Blog Generator',
  description: 'Create travel blogs from your photos using AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
