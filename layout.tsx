import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Morph Interface',
  description: 'Upload, integrate, and evolve with Morph GNN',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-void-900 text-white antialiased">{children}</body>
    </html>
  )
}
