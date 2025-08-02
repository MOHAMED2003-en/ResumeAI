'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'

interface AuthProviderProps {
  children: React.ReactNode
  session: Session | null
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  const [supabaseClient] = useState(() => createClientComponentClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={session}
    >
      {children}
    </SessionContextProvider>
  )
}
