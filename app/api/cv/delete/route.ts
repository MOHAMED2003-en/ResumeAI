import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function DELETE(request: NextRequest) {
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

    // First, get the CV record to verify ownership and get file path
    const { data: cv, error: fetchError } = await supabase
      .from('cvs')
      .select('*')
      .eq('id', cvId)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !cv) {
      return NextResponse.json(
        { error: 'CV not found or access denied' },
        { status: 404 }
      )
    }

    // Delete the file from storage
    if (cv.file_path) {
      const { error: storageError } = await supabase.storage
        .from('cv-files')
        .remove([cv.file_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the CV record from database
    const { error: deleteError } = await supabase
      .from('cvs')
      .delete()
      .eq('id', cvId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Database deletion error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete CV record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'CV deleted successfully',
      cvId,
    })

  } catch (error) {
    console.error('Delete CV API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
