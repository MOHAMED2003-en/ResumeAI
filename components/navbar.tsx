'use client'

import { AuthButton } from './auth-button'
import { Brain, FileText } from 'lucide-react'

export function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-6">
          
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
