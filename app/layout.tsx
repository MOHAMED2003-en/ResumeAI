import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { AuthProvider } from '@/components/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CV Analysis MVP',
  description: 'Upload and analyze CVs with AI-powered scoring',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
