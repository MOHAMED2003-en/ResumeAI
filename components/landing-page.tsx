'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AuthModal } from '@/components/auth-modal'
import { motion } from 'framer-motion'

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  const stats = [
    { emoji: '👥', value: '10K+', label: 'CVs Analyzed' },
    { emoji: '⭐', value: '4.9', label: 'User Rating' },
    { emoji: '🚀', value: '95%', label: 'Success Rate' },
    { emoji: '⚡', value: '<30s', label: 'Analysis Time' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="relative z-10 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-2"
            >
              <div className="text-2xl">📄</div>
              <span className="text-xl font-bold text-white">CV Analyzer</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <Button 
                onClick={handleSignIn}
                variant="ghost" 
                className="text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleSignUp}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 backdrop-blur-sm"
              >
                Get Started
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-6xl mb-6 animate-bounce">🚀</div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> CV</span>
              <br />
              with AI Power
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get instant AI-powered analysis, detailed scoring, and personalized recommendations 
              to make your CV stand out in today's competitive job market 💼
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button 
              onClick={handleSignUp}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 px-8 py-4 text-lg backdrop-blur-sm"
            >
              Start Free Analysis
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl mb-2">{stat.emoji}</div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      

      

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/20 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="text-2xl">📄</div>
              <span className="text-xl font-bold text-white">CV Analyzer</span>
            </div>
            <div className="text-gray-300 text-center md:text-right">
              <p className="mb-2">Made with ❤️ by <span className="font-semibold text-white">Ennajami Mohammed</span></p>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
