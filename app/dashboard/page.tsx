import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CVUploader } from '@/components/cv-uploader'
import { CVDashboard } from '@/components/cv-dashboard'
import { Navbar } from '@/components/navbar'
import { AuthProvider } from '@/components/auth-provider'
import { WebSocketProvider } from '@/components/websocket-provider'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <AuthProvider session={session}>
      <WebSocketProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
          <Navbar />
          <main className="container mx-auto px-4 pt-24 pb-8">
            <div className="space-y-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back!
                </h1>
                <p className="text-xl text-gray-600">Upload and analyze your CVs with AI-powered insights</p>
              </div>
              
              <CVUploader />
              <CVDashboard />
            </div>
          </main>
        </div>
      </WebSocketProvider>
    </AuthProvider>
  )
}
