import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Queue } from 'bullmq'

// Initialize BullMQ queue
const cvProcessingQueue = new Queue('cv-processing', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cvId } = await request.json()

    if (!cvId) {
      return NextResponse.json(
        { error: 'Missing required field: cvId' },
        { status: 400 }
      )
    }

    // Verify CV exists and belongs to user
    const { data: cv, error: cvError } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .eq('user_id', session.user.id)
      .single()

    if (cvError || !cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      )
    }

    // Update status to processing
    const { error: updateError } = await supabase
      .from('cvs')
      .update({ status: 'processing' })
      .eq('id', cvId)

    if (updateError) {
      console.error('Failed to update CV status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update CV status' },
        { status: 500 }
      )
    }

    // Add job to processing queue
    await cvProcessingQueue.add('process-cv', {
      cvId,
      userId: session.user.id,
      filePath: cv.file_path,
      fileName: cv.filename,
      fileType: cv.file_type,
    })

    return NextResponse.json({
      success: true,
      message: 'CV processing started',
      cvId,
    })

  } catch (error) {
    console.error('Process API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
