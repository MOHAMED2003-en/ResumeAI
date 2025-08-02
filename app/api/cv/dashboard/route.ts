import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch CVs for the current user
    const { data: cvs, error: cvsError } = await supabase
      .from('cvs')
      .select(`
        id,
        filename,
        upload_date,
        status,
        scores,
        analysis
      `)
      .eq('user_id', session.user.id)
      .order('upload_date', { ascending: false })

    if (cvsError) {
      console.error('Database error:', cvsError)
      return NextResponse.json(
        { error: 'Failed to fetch CVs' },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const totalCvs = cvs?.length || 0
    const completedCvs = cvs?.filter(cv => cv.status === 'completed') || []
    const processingCvs = cvs?.filter(cv => cv.status === 'processing') || []
    
    const averageScore = completedCvs.length > 0
      ? completedCvs.reduce((sum, cv) => sum + (cv.scores?.overall || 0), 0) / completedCvs.length
      : 0

    return NextResponse.json({
      cvs: cvs || [],
      summary: {
        total: totalCvs,
        completed: completedCvs.length,
        processing: processingCvs.length,
        averageScore: Math.round(averageScore * 10) / 10,
      },
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
