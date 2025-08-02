import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/landing-page'

export default async function Home() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is already authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  // Show landing page for unauthenticated users
  return <LandingPage />
}
