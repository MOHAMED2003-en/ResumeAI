import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

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

    const { fileName, fileType, fileSize } = await request.json()

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, fileSize' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const cvId = uuidv4()
    const filePath = `cvs/${session.user.id}/${cvId}/${fileName}`

    // Create CV record in database
    const { error: dbError } = await supabase
      .from('cvs')
      .insert({
        id: cvId,
        user_id: session.user.id,
        filename: fileName,
        file_path: filePath,
        file_type: fileType,
        file_size: fileSize,
        status: 'pending',
        upload_date: new Date().toISOString(),
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create CV record' },
        { status: 500 }
      )
    }

    // Generate presigned URL for upload
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cv-files')
      .createSignedUploadUrl(filePath, {
        upsert: true
      })

    if (uploadError) {
      console.error('Storage error:', uploadError)
      // Try to create the bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage
        .createBucket('cv-files', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 10485760 // 10MB
        })
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.error('Bucket creation error:', bucketError)
      }
      
      return NextResponse.json(
        { error: `Failed to generate upload URL: ${uploadError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      cvId,
      uploadUrl: uploadData.signedUrl,
      filePath,
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
