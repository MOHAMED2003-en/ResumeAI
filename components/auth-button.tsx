'use client'

import { useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { AuthModal } from '@/components/auth-modal'

export function AuthButton() {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          {user.email}
        </div>
        <Button onClick={handleSignOut} variant="outline" size="sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button onClick={() => setShowAuthModal(true)} className="w-full">
        Sign In
      </Button>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  )
}
