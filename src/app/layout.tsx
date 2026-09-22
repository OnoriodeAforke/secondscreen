import type { Metadata } from 'next'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'SecondScreen',
  description: 'Live esports companion app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}