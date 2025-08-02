'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export function CVUploader() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const supabase = useSupabaseClient()
  const user = useUser()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending'
    }))
    
    setUploadFiles(prev => [...prev, ...newFiles])
    
    // Start uploading each file
    newFiles.forEach(uploadFile => {
      handleFileUpload(uploadFile)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  })

  const handleFileUpload = async (uploadFile: UploadFile) => {
    try {
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' } : f)
      )

      // Get presigned URL from our API
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: uploadFile.file.name,
          fileType: uploadFile.file.type,
          fileSize: uploadFile.file.size,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, cvId } = await response.json()

      // Upload file to Supabase Storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadFile.file,
        headers: {
          'Content-Type': uploadFile.file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'processing', progress: 100 } : f)
      )

      // Trigger processing
      await fetch('/api/cv/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvId }),
      })

      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'completed' } : f)
      )

    } catch (error) {
      console.error('Upload error:', error)
      setUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        } : f)
      )
    }
  }

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusText = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing...'
      case 'completed':
        return 'Completed'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CVs</CardTitle>
        <CardDescription>
          Upload PDF, DOC, or DOCX files to analyze and score CVs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Drag & drop CV files here, or click to select</p>
              <p className="text-sm text-gray-500">Supports PDF, DOC, and DOCX files</p>
            </div>
          )}
        </div>

        {uploadFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Upload Progress</h3>
            {uploadFiles.map((uploadFile) => (
              <div key={uploadFile.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(uploadFile.status)}
                    <span className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {getStatusText(uploadFile.status)}
                  </span>
                </div>
                {uploadFile.status === 'uploading' && (
                  <Progress value={uploadFile.progress} className="h-2" />
                )}
                {uploadFile.error && (
                  <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
