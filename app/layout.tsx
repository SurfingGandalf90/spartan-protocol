import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Spartan Protocol',
  description: 'Lean · Mobile · Durable',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#0F0F0F' }}>
        {children}
      </body>
    </html>
  )
}
