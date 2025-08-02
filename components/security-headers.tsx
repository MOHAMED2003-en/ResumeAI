'use client'

import { useEffect } from 'react'

export function SecurityHeaders() {
  useEffect(() => {
    // Set security headers via meta tags for client-side
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Content Security Policy
    setMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com;"
    )

    // Other security headers
    setMetaTag('X-Content-Type-Options', 'nosniff')
    setMetaTag('X-Frame-Options', 'DENY')
    setMetaTag('X-XSS-Protection', '1; mode=block')
    setMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin')
  }, [])

  return null
}
