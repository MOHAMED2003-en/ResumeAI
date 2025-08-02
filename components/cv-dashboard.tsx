'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { RefreshCw, FileText, Brain, GraduationCap, Briefcase, Trash2, Award, Languages, CheckCircle, AlertCircle, TrendingUp, User, Building, ChevronDown, ChevronRight, BarChart3, Eye } from 'lucide-react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface CVRecord {
  id: string
  filename: string
  upload_date: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  scores: {
    experience: number
    education: number
    skills: number
    presentation?: number
    achievements?: number
    overall: number
  } | null
  analysis: {
    summary: string
    strengths: string[]
    weaknesses?: string[]
    recommendations?: string[]
    career_level?: string
    industry_fit?: string[]
    keywords?: string[]
    certifications?: string[]
    languages?: string[]
    contact_completeness?: number | null
    ats_score?: number | null
    improvement_priority?: string[] | null
  } | null
  keywords: string[] | null
  experience_years?: number | null
  education_level?: string | null
  certifications?: string[] | null
  languages?: string[] | null
  contact_completeness?: number | null
  ats_score?: number | null
  improvement_priority?: string[] | null
}

export function CVDashboard() {
  const [cvs, setCvs] = useState<CVRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [openAnalysis, setOpenAnalysis] = useState<Record<string, boolean>>({})
  const supabase = useSupabaseClient()
  const user = useUser()

  const fetchCVs = async () => {
    if (!user) return

    try {
      setLoading(true)
      const response = await fetch('/api/cv/dashboard')
      if (response.ok) {
        const data = await response.json()
        setCvs(data.cvs || [])
      }
    } catch (error) {
      console.error('Error fetching CVs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCV = async (cvId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(cvId)
      const response = await fetch('/api/cv/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvId }),
      })

      if (response.ok) {
        // Remove the deleted CV from the local state
        setCvs(prev => prev.filter(cv => cv.id !== cvId))
        // Refresh the CV list to ensure consistency
        await fetchCVs()
      } else {
        const error = await response.json()
        alert(`Failed to delete CV: ${error.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete CV. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleAnalysis = (cvId: string) => {
    setOpenAnalysis(prev => ({
      ...prev,
      [cvId]: !prev[cvId]
    }))
  }

  useEffect(() => {
    fetchCVs()
  }, [user])

  const getStatusBadge = (status: CVRecord['status']) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      processing: { variant: 'default' as const, label: 'Processing' },
      completed: { variant: 'default' as const, label: 'Completed' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      error: { variant: 'destructive' as const, label: 'Error' },
    }
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      failed: 'bg-red-100 text-red-800'
    }

    return (
      <Badge variant={statusConfig[status].variant} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDistributionData = () => {
    const completedCvs = cvs.filter(cv => cv.status === 'completed' && cv.scores)
    if (completedCvs.length === 0) return []

    const ranges = [
      { range: '0-2', min: 0, max: 2 },
      { range: '2-4', min: 2, max: 4 },
      { range: '4-6', min: 4, max: 6 },
      { range: '6-8', min: 6, max: 8 },
      { range: '8-10', min: 8, max: 10 }
    ]

    return ranges.map(({ range, min, max }) => ({
      range,
      count: completedCvs.filter(cv => 
        cv.scores!.overall >= min && cv.scores!.overall < max
      ).length
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CV Dashboard</CardTitle>
          <CardDescription>Loading your CV analysis results...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const completedCvs = cvs.filter(cv => cv.status === 'completed')
  const scoreDistribution = getScoreDistributionData()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{cvs.length}</p>
                <p className="text-xs text-muted-foreground">Total CVs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{completedCvs.length}</p>
                <p className="text-xs text-muted-foreground">Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {completedCvs.length > 0 
                    ? (completedCvs.reduce((sum, cv) => sum + (cv.scores?.overall || 0), 0) / completedCvs.length).toFixed(1)
                    : '0'
                  }
                </p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {cvs.filter(cv => cv.status === 'processing').length}
                </p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution Chart */}
      {scoreDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of overall CV scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* CV List */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6 text-blue-600" />
                CV Analysis Dashboard
              </CardTitle>
              <CardDescription className="text-base">
                Upload and analyze your CV files with AI-powered insights
              </CardDescription>
            </div>
            <Button onClick={fetchCVs} variant="outline" size="sm" className="bg-white hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cvs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">No CVs uploaded yet</p>
              <p className="text-sm text-gray-500">Upload some CVs to see analysis results here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cvs.map((cv) => (
                <Card key={cv.id} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{cv.filename}</h3>
                          <p className="text-sm text-gray-600">
                            Uploaded {new Date(cv.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(cv.status)}
                        {cv.status === 'completed' && cv.scores && (
                          <Collapsible 
                            open={openAnalysis[cv.id]} 
                            onOpenChange={() => toggleAnalysis(cv.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                                <Eye className="h-4 w-4 mr-2" />
                                {openAnalysis[cv.id] ? 'Hide' : 'View'} Analysis
                                {openAnalysis[cv.id] ? (
                                  <ChevronDown className="h-4 w-4 ml-2" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 ml-2" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </Collapsible>
                        )}
                        <Button
                          onClick={() => handleDeleteCV(cv.id, cv.filename)}
                          variant="outline"
                          size="sm"
                          disabled={deletingId === cv.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-white"
                        >
                          {deletingId === cv.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {cv.status === 'completed' && cv.scores && (
                    <Collapsible 
                      open={openAnalysis[cv.id]} 
                      onOpenChange={() => toggleAnalysis(cv.id)}
                    >
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="bg-white rounded-lg p-6 space-y-6 border-t">
                          {/* Main Scores Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <Briefcase className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-blue-900">{cv.scores.experience}</div>
                              <div className="text-xs text-blue-600">Experience</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <GraduationCap className="h-5 w-5 text-green-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-green-900">{cv.scores.education}</div>
                              <div className="text-xs text-green-600">Education</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <Brain className="h-5 w-5 text-purple-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-purple-900">{cv.scores.skills}</div>
                              <div className="text-xs text-purple-600">Skills</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <FileText className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-orange-900">{cv.scores.presentation || 5}</div>
                              <div className="text-xs text-orange-600">Presentation</div>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <Award className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-yellow-900">{cv.scores.achievements || 5}</div>
                              <div className="text-xs text-yellow-600">Achievements</div>
                            </div>
                          </div>
                          
                          {/* Overall Score */}
                          <div className="flex items-center justify-center p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                            <div className="text-center">
                              <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                              <div className="text-4xl font-bold text-indigo-900 mb-1">{cv.scores.overall}</div>
                              <div className="text-sm text-indigo-600">Overall Score</div>
                            </div>
                          </div>

                          {/* Enhanced Analysis Section */}
                          {cv.analysis && (
                            <div className="space-y-6">
                              {/* Summary and Career Info */}
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-blue-900">Professional Summary</span>
                                </div>
                                <p className="text-sm text-blue-800 mb-3">{cv.analysis.summary}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  {cv.analysis.career_level && (
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="h-3 w-3 text-blue-500" />
                                      <span className="text-gray-600">Career Level:</span>
                                      <Badge variant="outline">{cv.analysis.career_level}</Badge>
                                    </div>
                                  )}
                                  {cv.analysis.industry_fit && (
                                    <div className="flex items-center gap-2">
                                      <Building className="h-3 w-3 text-blue-500" />
                                      <span className="text-gray-600">Industry Fit:</span>
                                      <span className="text-blue-700">{cv.analysis.industry_fit}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Strengths and Weaknesses */}
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <h4 className="font-medium text-green-700">Key Strengths</h4>
                                  </div>
                                  <ul className="text-sm space-y-2">
                                    {(cv.analysis.strengths || []).map((strength, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1 text-xs">✓</span>
                                        <span className="text-gray-700">{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertCircle className="h-4 w-4 text-orange-500" />
                                    <h4 className="font-medium text-orange-700">Areas for Improvement</h4>
                                  </div>
                                  <ul className="text-sm space-y-2">
                                    {(cv.analysis.weaknesses || cv.analysis.improvements || []).map((weakness: string, index: number) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1 text-xs">!</span>
                                        <span className="text-gray-700">{weakness}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Recommendations */}
                              {cv.analysis.recommendations && cv.analysis.recommendations.length > 0 && (
                                <div className="bg-purple-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Brain className="h-4 w-4 text-purple-500" />
                                    <h4 className="font-medium text-purple-700">Recommendations</h4>
                                  </div>
                                  <ul className="text-sm space-y-2">
                                    {cv.analysis.recommendations.map((rec: string, index: number) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <span className="text-purple-500 mt-1 text-xs">→</span>
                                        <span className="text-gray-700">{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Additional Info */}
                              {(cv.experience_years || cv.education_level || cv.certifications?.length || cv.languages?.length) && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                  {cv.experience_years && (
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-gray-900">{cv.experience_years}</div>
                                      <div className="text-xs text-gray-500">Years Experience</div>
                                    </div>
                                  )}
                                  {cv.education_level && (
                                    <div className="text-center">
                                      <div className="text-sm font-medium text-gray-900">{cv.education_level}</div>
                                      <div className="text-xs text-gray-500">Education Level</div>
                                    </div>
                                  )}
                                  {cv.certifications && cv.certifications.length > 0 && (
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-gray-900">{cv.certifications.length}</div>
                                      <div className="text-xs text-gray-500">Certifications</div>
                                    </div>
                                  )}
                                  {cv.languages && cv.languages.length > 0 && (
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-gray-900">{cv.languages.length}</div>
                                      <div className="text-xs text-gray-500">Languages</div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
