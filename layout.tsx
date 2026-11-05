import type { Metadata } from 'next'
import './style.css'

export const metadata: Metadata = {
  title: 'Sudan Aviation NextGen | Aviation Community',
  description: 'Aviation community, learning, forums and member chat.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>
}
