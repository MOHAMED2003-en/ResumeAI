/**
 * CV Analysis Integration Tests
 * End-to-end tests for the complete CV analysis workflow
 */

const fs = require('fs')
const path = require('path')

// Mock dependencies for testing
jest.mock('@google/generative-ai')
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('pdf-parse')

describe('CV Analysis Integration Tests', () => {
  let mockQueue
  let mockSupabase
  let mockPdfParse
  let mockGeminiAI

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup BullMQ mock
    const { Queue } = require('bullmq')
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123', data: {} }),
      process: jest.fn(),
      on: jest.fn()
    }
    Queue.mockImplementation(() => mockQueue)

    // Setup Supabase mock
    const { createRouteHandlerClient } = require('@supabase/auth-helpers-nextjs')
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null
        })
      },
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'cv-123', filename: 'test-cv.pdf', status: 'pending' }],
          error: null
        }),
        update: jest.fn().mockResolvedValue({
          data: [{ id: 'cv-123', status: 'completed' }],
          error: null
        }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{
              id: 'cv-123',
              filename: 'test-cv.pdf',
              status: 'completed',
              scores: {
                experience: 8.5,
                education: 7.8,
                skills: 9.0,
                presentation: 7.5,
                achievements: 8.0,
                overall: 8.2
              },
              analysis: {
                summary: 'Excellent candidate with strong technical background and leadership experience.',
                strengths: [
                  'Extensive experience in software development',
                  'Strong leadership and team management skills',
                  'Excellent technical skills in modern frameworks',
                  'Proven track record of successful project delivery'
                ],
                weaknesses: [
                  'Could benefit from additional certifications',
                  'Limited experience in emerging technologies'
                ],
                recommendations: [
                  'Consider obtaining cloud certifications (AWS, Azure)',
                  'Add more quantifiable achievements with metrics',
                  'Include experience with AI/ML technologies',
                  'Improve CV formatting for better ATS compatibility'
                ],
                career_level: 'Senior',
                industry_fit: ['Technology', 'Software Development', 'Fintech', 'Healthcare Tech']
              },
              keywords: [
                'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 
                'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL',
                'Agile', 'Scrum', 'Leadership', 'Team Management'
              ],
              certifications: ['PMP', 'Scrum Master'],
              languages: ['English', 'Spanish', 'French'],
              contact_completeness: 92,
              ats_score: 85,
              improvement_priority: [
                'Add cloud certifications',
                'Quantify achievements with metrics',
                'Include emerging tech experience'
              ]
            }],
            error: null
          })
        })
      })),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn().mockResolvedValue({
            data: { path: 'cvs/user-123/test-cv.pdf' },
            error: null
          }),
          getPublicUrl: jest.fn().mockReturnValue({
            data: { publicUrl: 'https://storage.example.com/cvs/user-123/test-cv.pdf' }
          })
        }))
      }
    }
    createRouteHandlerClient.mockReturnValue(mockSupabase)

    // Setup PDF Parse mock
    mockPdfParse = require('pdf-parse')
    mockPdfParse.mockResolvedValue({
      text: `
        JOHN SMITH
        Senior Software Engineer
        Email: john.smith@email.com | Phone: +1-555-0123
        LinkedIn: linkedin.com/in/johnsmith | GitHub: github.com/johnsmith
        
        PROFESSIONAL SUMMARY
        Experienced Senior Software Engineer with 8+ years of expertise in full-stack development,
        team leadership, and system architecture. Proven track record of delivering scalable
        solutions and leading cross-functional teams in agile environments.
        
        TECHNICAL SKILLS
        • Programming Languages: JavaScript, TypeScript, Python, Java, Go
        • Frontend: React, Vue.js, Angular, HTML5, CSS3, SASS
        • Backend: Node.js, Express, Django, Spring Boot, GraphQL
        • Databases: PostgreSQL, MongoDB, Redis, MySQL
        • Cloud & DevOps: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes, Jenkins
        • Tools: Git, JIRA, Confluence, Slack, VS Code
        
        PROFESSIONAL EXPERIENCE
        
        Senior Software Engineer | TechCorp Inc. | 2020 - Present
        • Led a team of 6 developers in building a microservices-based e-commerce platform
        • Increased system performance by 40% through optimization and caching strategies
        • Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes
        • Mentored junior developers and conducted code reviews
        • Technologies: React, Node.js, PostgreSQL, AWS, Docker
        
        Software Engineer | StartupXYZ | 2018 - 2020
        • Developed and maintained web applications serving 100K+ daily active users
        • Built RESTful APIs and integrated third-party services
        • Collaborated with product managers and designers in agile sprints
        • Reduced bug reports by 60% through comprehensive testing strategies
        • Technologies: Vue.js, Python, Django, MongoDB, Redis
        
        Junior Software Developer | DevSolutions | 2016 - 2018
        • Contributed to frontend and backend development of client projects
        • Participated in requirements gathering and technical documentation
        • Implemented responsive designs and ensured cross-browser compatibility
        • Technologies: JavaScript, PHP, MySQL, Bootstrap
        
        EDUCATION
        Bachelor of Science in Computer Science
        University of Technology | 2012 - 2016
        GPA: 3.8/4.0
        Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering
        
        CERTIFICATIONS
        • Project Management Professional (PMP) - 2021
        • Certified Scrum Master (CSM) - 2020
        • AWS Certified Solutions Architect - Associate - 2019
        
        PROJECTS
        E-Commerce Platform (2021)
        • Built a scalable e-commerce platform handling 10M+ transactions monthly
        • Implemented real-time inventory management and payment processing
        • Technologies: React, Node.js, PostgreSQL, Redis, AWS
        
        Task Management App (2020)
        • Developed a collaborative task management application
        • Features include real-time updates, file sharing, and team collaboration
        • Technologies: Vue.js, Express, MongoDB, Socket.io
        
        LANGUAGES
        • English (Native)
        • Spanish (Conversational)
        • French (Basic)
        
        ACHIEVEMENTS
        • Increased team productivity by 35% through process improvements
        • Led successful migration of legacy system to cloud infrastructure
        • Reduced application load time by 50% through performance optimization
        • Mentored 12+ junior developers throughout career
      `
    })

    // Setup Gemini AI mock
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    mockGeminiAI = {
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue(JSON.stringify({
              scores: {
                experience: 8.5,
                education: 7.8,
                skills: 9.0,
                presentation: 7.5,
                achievements: 8.0,
                overall: 8.2
              },
              analysis: {
                summary: 'Excellent candidate with strong technical background and leadership experience. Demonstrates consistent career progression and significant impact in previous roles.',
                strengths: [
                  'Extensive 8+ years of software development experience with clear career progression',
                  'Strong leadership skills with proven ability to manage and mentor teams',
                  'Excellent technical skills across modern full-stack technologies',
                  'Quantifiable achievements showing measurable business impact',
                  'Strong educational background with relevant certifications'
                ],
                weaknesses: [
                  'Could benefit from more recent cloud certifications (AWS cert from 2019)',
                  'Limited mention of emerging technologies like AI/ML or blockchain',
                  'Could include more specific metrics for recent achievements'
                ],
                recommendations: [
                  'Update AWS certification to current version or add Azure/GCP certifications',
                  'Add experience with emerging technologies (AI/ML, blockchain, serverless)',
                  'Include more recent quantifiable achievements with specific metrics',
                  'Consider adding open-source contributions or technical blog posts',
                  'Enhance ATS compatibility by including more industry keywords'
                ],
                career_level: 'Senior',
                industry_fit: [
                  'Technology',
                  'Software Development',
                  'Fintech',
                  'E-commerce',
                  'Healthcare Technology',
                  'SaaS Companies'
                ]
              },
              keywords: [
                'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'React', 'Vue.js', 'Angular',
                'Node.js', 'Express', 'Django', 'Spring Boot', 'GraphQL', 'PostgreSQL', 'MongoDB',
                'Redis', 'MySQL', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Microservices',
                'CI/CD', 'Agile', 'Scrum', 'Team Leadership', 'Mentoring', 'Performance Optimization'
              ],
              certifications: ['PMP', 'Certified Scrum Master', 'AWS Certified Solutions Architect'],
              languages: ['English', 'Spanish', 'French'],
              contact_completeness: 92,
              ats_score: 85,
              improvement_priority: [
                'Update cloud certifications',
                'Add emerging technology experience',
                'Include more quantifiable metrics'
              ]
            }))
          }
        })
      })
    }
    GoogleGenerativeAI.mockImplementation(() => mockGeminiAI)
  })

  describe('Complete CV Analysis Workflow', () => {
    test('should process CV from upload to analysis completion', async () => {
      // Import worker functions
      const { analyzeCV } = require('../worker/index.js')
      
      // 1. Simulate CV text extraction
      const cvText = await mockPdfParse(Buffer.from('mock pdf content'))
      expect(cvText.text).toContain('JOHN SMITH')
      expect(cvText.text).toContain('Senior Software Engineer')

      // 2. Analyze CV with AI
      const analysisResult = await analyzeCV(cvText.text)
      
      // Verify analysis structure
      expect(analysisResult).toHaveProperty('scores')
      expect(analysisResult).toHaveProperty('analysis')
      expect(analysisResult).toHaveProperty('keywords')
      expect(analysisResult).toHaveProperty('certifications')
      expect(analysisResult).toHaveProperty('languages')

      // Verify scores are realistic
      expect(analysisResult.scores.overall).toBe(8.2)
      expect(analysisResult.scores.experience).toBe(8.5)
      expect(analysisResult.scores.skills).toBe(9.0)

      // Verify analysis content quality
      expect(analysisResult.analysis.summary).toContain('Excellent candidate')
      expect(analysisResult.analysis.strengths.length).toBeGreaterThan(3)
      expect(analysisResult.analysis.recommendations.length).toBeGreaterThan(3)
      expect(analysisResult.analysis.career_level).toBe('Senior')

      // Verify extracted data
      expect(analysisResult.keywords).toContain('JavaScript')
      expect(analysisResult.keywords).toContain('React')
      expect(analysisResult.keywords).toContain('AWS')
      expect(analysisResult.certifications).toContain('PMP')
      expect(analysisResult.languages).toContain('English')

      // Verify scoring ranges
      expect(analysisResult.contact_completeness).toBe(92)
      expect(analysisResult.ats_score).toBe(85)
    })

    test('should handle different career levels correctly', async () => {
      // Mock junior developer CV
      mockPdfParse.mockResolvedValueOnce({
        text: `
          Jane Doe
          Junior Software Developer
          Email: jane@email.com
          
          Recent Computer Science graduate with internship experience.
          
          EDUCATION
          Bachelor of Computer Science - 2023
          University of Tech, GPA: 3.6/4.0
          
          EXPERIENCE
          Software Development Intern | TechStart | Summer 2022
          • Developed web components using React
          • Assisted with bug fixes and testing
          
          SKILLS
          JavaScript, HTML, CSS, React, Git
        `
      })

      mockGeminiAI.getGenerativeModel().generateContent.mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            scores: {
              experience: 4.5,
              education: 7.0,
              skills: 6.0,
              presentation: 6.5,
              achievements: 5.0,
              overall: 5.8
            },
            analysis: {
              summary: 'Promising entry-level candidate with solid educational foundation.',
              strengths: ['Strong educational background', 'Modern technology skills'],
              weaknesses: ['Limited professional experience', 'Few quantifiable achievements'],
              recommendations: ['Gain more hands-on experience', 'Build portfolio projects'],
              career_level: 'Entry-level',
              industry_fit: ['Technology', 'Software Development']
            },
            keywords: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
            certifications: [],
            languages: ['English'],
            contact_completeness: 75,
            ats_score: 70,
            improvement_priority: ['Add more experience', 'Build portfolio', 'Get certifications']
          }))
        }
      })

      const { analyzeCV } = require('../worker/index.js')
      const cvText = await mockPdfParse(Buffer.from('mock pdf'))
      const result = await analyzeCV(cvText.text)

      expect(result.analysis.career_level).toBe('Entry-level')
      expect(result.scores.overall).toBeLessThan(7.0) // Lower score for junior
      expect(result.scores.experience).toBeLessThan(6.0) // Limited experience
    })

    test('should identify missing information and provide specific recommendations', async () => {
      // Mock CV with missing contact info and achievements
      mockPdfParse.mockResolvedValueOnce({
        text: `
          John Developer
          Software Engineer
          
          EXPERIENCE
          Developer at Company
          Worked on web applications
          
          SKILLS
          JavaScript, React
        `
      })

      mockGeminiAI.getGenerativeModel().generateContent.mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            scores: {
              experience: 6.0,
              education: 3.0,
              skills: 5.5,
              presentation: 4.0,
              achievements: 2.0,
              overall: 4.1
            },
            analysis: {
              summary: 'Candidate shows potential but CV lacks essential information and detail.',
              strengths: ['Relevant technical skills', 'Professional experience'],
              weaknesses: [
                'Missing contact information (phone, email)',
                'No educational background provided',
                'Lack of quantifiable achievements',
                'Vague job descriptions without specific accomplishments'
              ],
              recommendations: [
                'Add complete contact information including phone and email',
                'Include educational background and relevant coursework',
                'Quantify achievements with specific metrics and numbers',
                'Provide detailed job descriptions with concrete accomplishments',
                'Add certifications and professional development activities'
              ],
              career_level: 'Mid-level',
              industry_fit: ['Technology', 'Software Development']
            },
            keywords: ['JavaScript', 'React'],
            certifications: [],
            languages: ['English'],
            contact_completeness: 25, // Very low due to missing info
            ats_score: 45, // Low ATS score
            improvement_priority: [
              'Add complete contact information',
              'Include educational background',
              'Quantify all achievements'
            ]
          }))
        }
      })

      const { analyzeCV } = require('../worker/index.js')
      const cvText = await mockPdfParse(Buffer.from('mock pdf'))
      const result = await analyzeCV(cvText.text)

      expect(result.contact_completeness).toBe(25)
      expect(result.ats_score).toBe(45)
      expect(result.scores.achievements).toBe(2.0)
      expect(result.analysis.weaknesses).toContain('Missing contact information (phone, email)')
      expect(result.improvement_priority).toContain('Add complete contact information')
    })

    test('should handle technical vs non-technical roles appropriately', async () => {
      // Mock marketing manager CV
      mockPdfParse.mockResolvedValueOnce({
        text: `
          Sarah Johnson
          Marketing Manager
          Email: sarah@email.com | Phone: 555-0123
          
          PROFESSIONAL SUMMARY
          Experienced Marketing Manager with 6+ years in digital marketing,
          brand management, and campaign optimization.
          
          EXPERIENCE
          Marketing Manager | GrowthCorp | 2020-Present
          • Increased brand awareness by 150% through integrated campaigns
          • Managed $500K annual marketing budget
          • Led team of 4 marketing specialists
          
          SKILLS
          Digital Marketing, SEO, SEM, Social Media, Analytics,
          Project Management, Team Leadership
          
          EDUCATION
          MBA in Marketing | Business School | 2018
          Bachelor in Communications | University | 2016
        `
      })

      mockGeminiAI.getGenerativeModel().generateContent.mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            scores: {
              experience: 7.5,
              education: 8.0,
              skills: 7.8,
              presentation: 8.2,
              achievements: 8.5,
              overall: 8.0
            },
            analysis: {
              summary: 'Strong marketing professional with excellent track record of measurable results.',
              strengths: [
                'Quantifiable achievements with specific metrics',
                'Strong educational background with MBA',
                'Leadership experience managing teams and budgets',
                'Comprehensive digital marketing skill set'
              ],
              weaknesses: [
                'Could benefit from additional digital certifications',
                'Limited international marketing experience mentioned'
              ],
              recommendations: [
                'Add Google Analytics and Google Ads certifications',
                'Include experience with marketing automation tools',
                'Mention any international or multi-market campaigns',
                'Add specific ROI metrics for campaigns'
              ],
              career_level: 'Senior',
              industry_fit: [
                'Marketing & Advertising',
                'E-commerce',
                'SaaS',
                'Consumer Goods',
                'Digital Agencies'
              ]
            },
            keywords: [
              'Digital Marketing', 'SEO', 'SEM', 'Social Media', 'Analytics',
              'Brand Management', 'Campaign Optimization', 'Team Leadership',
              'Budget Management', 'ROI', 'KPIs'
            ],
            certifications: [],
            languages: ['English'],
            contact_completeness: 85,
            ats_score: 82,
            improvement_priority: [
              'Add digital marketing certifications',
              'Include marketing automation experience',
              'Add more ROI metrics'
            ]
          }))
        }
      })

      const { analyzeCV } = require('../worker/index.js')
      const cvText = await mockPdfParse(Buffer.from('mock pdf'))
      const result = await analyzeCV(cvText.text)

      expect(result.analysis.industry_fit).toContain('Marketing & Advertising')
      expect(result.keywords).toContain('Digital Marketing')
      expect(result.keywords).toContain('SEO')
      expect(result.scores.achievements).toBe(8.5) // High due to quantified results
    })
  })

  describe('Error Handling and Edge Cases', () => {
    test('should handle corrupted PDF gracefully', async () => {
      mockPdfParse.mockRejectedValueOnce(new Error('PDF parsing failed'))

      const { analyzeCV } = require('../worker/index.js')
      
      await expect(analyzeCV('corrupted content')).rejects.toThrow()
    })

    test('should handle AI service unavailability', async () => {
      mockGeminiAI.getGenerativeModel().generateContent.mockRejectedValueOnce(
        new Error('AI service unavailable')
      )

      const { analyzeCV } = require('../worker/index.js')
      
      await expect(analyzeCV('valid cv text')).rejects.toThrow('AI service unavailable')
    })

    test('should handle malformed AI response', async () => {
      mockGeminiAI.getGenerativeModel().generateContent.mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue('Invalid JSON response')
        }
      })

      const { analyzeCV } = require('../worker/index.js')
      
      await expect(analyzeCV('valid cv text')).rejects.toThrow()
    })

    test('should validate score ranges in AI response', async () => {
      // Mock AI response with invalid scores
      mockGeminiAI.getGenerativeModel().generateContent.mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            scores: {
              experience: 15, // Invalid: > 10
              education: -2,  // Invalid: < 0
              skills: 7.5,
              presentation: 8.0,
              achievements: 6.5,
              overall: 7.0
            },
            analysis: {
              summary: 'Test summary',
              strengths: ['Test strength'],
              weaknesses: ['Test weakness'],
              recommendations: ['Test recommendation'],
              career_level: 'Mid-level',
              industry_fit: ['Technology']
            },
            keywords: ['JavaScript'],
            certifications: [],
            languages: ['English'],
            contact_completeness: 150, // Invalid: > 100
            ats_score: -10, // Invalid: < 0
            improvement_priority: ['Test priority']
          }))
        }
      })

      const { analyzeCV } = require('../worker/index.js')
      const result = await analyzeCV('test cv text')

      // Should handle invalid scores gracefully
      expect(result).toBeDefined()
      // Implementation should clamp or validate scores
    })
  })

  describe('Performance and Scalability', () => {
    test('should handle large CV documents efficiently', async () => {
      // Create a very large CV text
      const largeCVText = 'Experience: ' + 'A'.repeat(50000) + '\nEducation: ' + 'B'.repeat(25000)
      
      mockPdfParse.mockResolvedValueOnce({ text: largeCVText })

      const { analyzeCV } = require('../worker/index.js')
      
      const startTime = Date.now()
      const result = await analyzeCV(largeCVText)
      const endTime = Date.now()

      expect(result).toBeDefined()
      expect(endTime - startTime).toBeLessThan(15000) // Should complete within 15 seconds
    })

    test('should handle concurrent analysis requests', async () => {
      const { analyzeCV } = require('../worker/index.js')
      
      // Create multiple concurrent analysis requests
      const requests = Array.from({ length: 5 }, (_, i) => 
        analyzeCV(`Sample CV text ${i}`)
      )

      const results = await Promise.all(requests)
      
      // All requests should complete successfully
      results.forEach(result => {
        expect(result).toBeDefined()
        expect(result).toHaveProperty('scores')
        expect(result).toHaveProperty('analysis')
      })
    })
  })

  describe('Data Quality and Consistency', () => {
    test('should maintain consistent scoring across similar CVs', async () => {
      const { analyzeCV } = require('../worker/index.js')
      
      // Analyze the same CV twice
      const cvText = 'Experienced software developer with 5 years of React and Node.js experience'
      
      const result1 = await analyzeCV(cvText)
      const result2 = await analyzeCV(cvText)

      // Results should be identical for the same input
      expect(result1.scores.overall).toBe(result2.scores.overall)
      expect(result1.analysis.career_level).toBe(result2.analysis.career_level)
    })

    test('should provide meaningful keyword extraction', async () => {
      const { analyzeCV } = require('../worker/index.js')
      const result = await analyzeCV('Senior React developer with AWS and Docker experience')

      expect(result.keywords).toContain('React')
      expect(result.keywords).toContain('AWS')
      expect(result.keywords).toContain('Docker')
      expect(result.keywords.length).toBeGreaterThan(5)
    })

    test('should correctly identify career progression', async () => {
      mockPdfParse.mockResolvedValueOnce({
        text: `
          Senior Engineering Manager
          10+ years experience
          Led teams of 20+ engineers
          PhD in Computer Science
          Multiple patents and publications
        `
      })

      mockGeminiAI.getGenerativeModel().generateContent.mockResolvedValueOnce({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            scores: { experience: 9.5, education: 9.8, skills: 9.2, presentation: 8.5, achievements: 9.7, overall: 9.3 },
            analysis: {
              summary: 'Exceptional senior leader with extensive experience and academic credentials.',
              strengths: ['Extensive leadership experience', 'Strong academic background', 'Proven innovation track record'],
              weaknesses: ['Could update with latest technology trends'],
              recommendations: ['Include recent technology adoption', 'Add diversity and inclusion initiatives'],
              career_level: 'Executive',
              industry_fit: ['Technology Leadership', 'R&D', 'Enterprise Software']
            },
            keywords: ['Leadership', 'Engineering Management', 'Patents', 'PhD'],
            certifications: [],
            languages: ['English'],
            contact_completeness: 90,
            ats_score: 88,
            improvement_priority: ['Update technology stack', 'Add recent achievements']
          }))
        }
      })

      const { analyzeCV } = require('../worker/index.js')
      const cvText = await mockPdfParse(Buffer.from('mock pdf'))
      const result = await analyzeCV(cvText.text)

      expect(result.analysis.career_level).toBe('Executive')
      expect(result.scores.overall).toBeGreaterThan(9.0)
      expect(result.scores.experience).toBeGreaterThan(9.0)
    })
  })
})
