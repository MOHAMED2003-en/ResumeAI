import { render, screen } from '@testing-library/react'
import { CVUploader } from '@/components/cv-uploader'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Mock Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}))

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn().mockResolvedValue({
      data: { session: null },
      error: null
    }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      getPublicUrl: jest.fn()
    })
  }
}

describe('CVUploader', () => {
  beforeEach(() => {
    ;(createClientComponentClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  it('renders upload area', () => {
    render(
      <SessionContextProvider supabaseClient={mockSupabaseClient as any} initialSession={null}>
        <CVUploader />
      </SessionContextProvider>
    )

    expect(screen.getByText('Upload CVs')).toBeInTheDocument()
    expect(screen.getByText('Drag & drop CV files here, or click to select')).toBeInTheDocument()
    expect(screen.getByText('Supports PDF, DOC, and DOCX files')).toBeInTheDocument()
  })

  it('shows correct file type support', () => {
    render(
      <SessionContextProvider supabaseClient={mockSupabaseClient as any} initialSession={null}>
        <CVUploader />
      </SessionContextProvider>
    )

    expect(screen.getByText(/PDF, DOC, and DOCX/)).toBeInTheDocument()
  })
})
