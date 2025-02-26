import ToastProvider from '@/components/ToastProvider'
import './globals.css'

import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OpenID4VP Digital Credentials Playground | Animo',
  description:
    'This playground implements the Digital Credentials API with OpenID4VP and SD-JWT/mDOC as defined in High Assurance Interoperability Profile',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'bg-gray-100')}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
