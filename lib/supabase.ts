import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createClient = () => createClientComponentClient()

export const createServerClient = () => createServerComponentClient({ cookies })

export interface Database {
  public: {
    Tables: {
      cvs: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          upload_date: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          scores: {
            experience: number
            education: number
            skills: number
            presentation: number
            achievements: number
            overall: number
          } | null
          analysis: {
            summary: string
            strengths: string[]
            weaknesses: string[]
            recommendations: string[]
            career_level: string
            industry_fit: string
            improvements?: string[] // Keep for backward compatibility
          } | null
          keywords: string[] | null
          experience_years: number | null
          education_level: string | null
          certifications: string[] | null
          languages: string[] | null
          contact_completeness: number | null
          ats_score: number | null
          improvement_priority: string[] | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_type: string
          file_size: number
          status?: 'pending' | 'processing' | 'completed' | 'error'
          scores?: {
            experience: number
            education: number
            skills: number
            overall: number
          } | null
          analysis?: {
            summary: string
            strengths: string[]
            improvements: string[]
          } | null
          upload_date?: string
          processed_date?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_type?: string
          file_size?: number
          status?: 'pending' | 'processing' | 'completed' | 'error'
          scores?: {
            experience: number
            education: number
            skills: number
            overall: number
          } | null
          analysis?: {
            summary: string
            strengths: string[]
            improvements: string[]
          } | null
          upload_date?: string
          processed_date?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
