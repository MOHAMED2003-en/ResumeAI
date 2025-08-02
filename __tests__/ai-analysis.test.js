const { analyzeCV } = require('../worker/index.js')

// Mock the Google AI SDK
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            scores: {
              experience: 7.5,
              education: 8.2,
              skills: 7.8,
              presentation: 8.0,
              achievements: 7.3,
              overall: 7.8
            },
            analysis: {
              summary: "Strong candidate with solid technical background and relevant experience.",
              strengths: [
                "Excellent technical skills in modern frameworks",
                "Strong educational background",
                "Good project experience"
              ],
              weaknesses: [
                "Could improve presentation formatting",
                "Missing some industry certifications"
              ],
              recommendations: [
                "Add more quantifiable achievements",
                "Include industry-specific keywords",
                "Improve CV formatting and structure"
              ],
              career_level: "Mid-level",
              industry_fit: ["Technology", "Software Development", "IT Services"]
            },
            keywords: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker"],
            certifications: ["AWS Certified Developer"],
            languages: ["English", "French"],
            contact_completeness: 85,
            ats_score: 78,
            improvement_priority: ["Add certifications", "Quantify achievements", "Improve formatting"]
          }))
        }
      })
    })
  }))
}))

describe('AI Analysis Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  describe('analyzeCV function', () => {
    test('should analyze CV text and return structured data', async () => {
      const sampleCVText = `
        John Doe
        Software Developer
        Email: john.doe@email.com
        Phone: +1234567890
        
        Experience:
        - Senior Software Developer at Tech Corp (2020-2023)
        - Developed React applications with Node.js backend
        - Led team of 5 developers on major project
        
        Education:
        - Bachelor's in Computer Science, University of Tech (2016-2020)
        - GPA: 3.8/4.0
        
        Skills:
        - JavaScript, React, Node.js, Python
        - AWS, Docker, Kubernetes
        - Agile, Scrum
      `

      const result = await analyzeCV(sampleCVText)

      // Test that the function returns the expected structure
      expect(result).toHaveProperty('scores')
      expect(result).toHaveProperty('analysis')
      expect(result).toHaveProperty('keywords')
      expect(result).toHaveProperty('certifications')
      expect(result).toHaveProperty('languages')
      expect(result).toHaveProperty('contact_completeness')
      expect(result).toHaveProperty('ats_score')
      expect(result).toHaveProperty('improvement_priority')

      // Test scores structure
      expect(result.scores).toHaveProperty('experience')
      expect(result.scores).toHaveProperty('education')
      expect(result.scores).toHaveProperty('skills')
      expect(result.scores).toHaveProperty('presentation')
      expect(result.scores).toHaveProperty('achievements')
      expect(result.scores).toHaveProperty('overall')

      // Test that scores are numbers between 0 and 10
      Object.values(result.scores).forEach(score => {
        expect(typeof score).toBe('number')
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(10)
      })

      // Test analysis structure
      expect(result.analysis).toHaveProperty('summary')
      expect(result.analysis).toHaveProperty('strengths')
      expect(result.analysis).toHaveProperty('weaknesses')
      expect(result.analysis).toHaveProperty('recommendations')
      expect(result.analysis).toHaveProperty('career_level')
      expect(result.analysis).toHaveProperty('industry_fit')

      // Test that arrays are actually arrays
      expect(Array.isArray(result.analysis.strengths)).toBe(true)
      expect(Array.isArray(result.analysis.weaknesses)).toBe(true)
      expect(Array.isArray(result.analysis.recommendations)).toBe(true)
      expect(Array.isArray(result.analysis.industry_fit)).toBe(true)
      expect(Array.isArray(result.keywords)).toBe(true)
      expect(Array.isArray(result.certifications)).toBe(true)
      expect(Array.isArray(result.languages)).toBe(true)
      expect(Array.isArray(result.improvement_priority)).toBe(true)

      // Test specific values
      expect(result.scores.overall).toBe(7.8)
      expect(result.analysis.career_level).toBe('Mid-level')
      expect(result.contact_completeness).toBe(85)
      expect(result.ats_score).toBe(78)
    })

    test('should handle empty CV text gracefully', async () => {
      const result = await analyzeCV('')

      expect(result).toHaveProperty('scores')
      expect(result).toHaveProperty('analysis')
      expect(result.scores.overall).toBeGreaterThanOrEqual(0)
      expect(result.scores.overall).toBeLessThanOrEqual(10)
    })

    test('should handle malformed CV text', async () => {
      const malformedText = 'Random text without proper CV structure...'
      
      const result = await analyzeCV(malformedText)

      expect(result).toHaveProperty('scores')
      expect(result).toHaveProperty('analysis')
      expect(typeof result.scores.overall).toBe('number')
      expect(typeof result.analysis.summary).toBe('string')
    })

    test('should validate score ranges', async () => {
      const result = await analyzeCV('Sample CV text')

      // All scores should be between 0 and 10
      const scores = result.scores
      expect(scores.experience).toBeGreaterThanOrEqual(0)
      expect(scores.experience).toBeLessThanOrEqual(10)
      expect(scores.education).toBeGreaterThanOrEqual(0)
      expect(scores.education).toBeLessThanOrEqual(10)
      expect(scores.skills).toBeGreaterThanOrEqual(0)
      expect(scores.skills).toBeLessThanOrEqual(10)
      expect(scores.presentation).toBeGreaterThanOrEqual(0)
      expect(scores.presentation).toBeLessThanOrEqual(10)
      expect(scores.achievements).toBeGreaterThanOrEqual(0)
      expect(scores.achievements).toBeLessThanOrEqual(10)
      expect(scores.overall).toBeGreaterThanOrEqual(0)
      expect(scores.overall).toBeLessThanOrEqual(10)
    })

    test('should validate contact completeness and ATS score ranges', async () => {
      const result = await analyzeCV('Sample CV text')

      // Contact completeness should be between 0 and 100
      expect(result.contact_completeness).toBeGreaterThanOrEqual(0)
      expect(result.contact_completeness).toBeLessThanOrEqual(100)

      // ATS score should be between 0 and 100
      expect(result.ats_score).toBeGreaterThanOrEqual(0)
      expect(result.ats_score).toBeLessThanOrEqual(100)
    })

    test('should return meaningful analysis content', async () => {
      const result = await analyzeCV('Experienced software developer with 5 years in React and Node.js')

      // Summary should be a non-empty string
      expect(typeof result.analysis.summary).toBe('string')
      expect(result.analysis.summary.length).toBeGreaterThan(0)

      // Strengths should have at least one item
      expect(result.analysis.strengths.length).toBeGreaterThan(0)
      expect(typeof result.analysis.strengths[0]).toBe('string')

      // Career level should be one of expected values
      const validCareerLevels = ['Entry-level', 'Mid-level', 'Senior', 'Executive']
      expect(validCareerLevels).toContain(result.analysis.career_level)

      // Keywords should contain relevant terms
      expect(result.keywords.length).toBeGreaterThan(0)
      expect(typeof result.keywords[0]).toBe('string')
    })
  })

  describe('Error Handling', () => {
    test('should handle AI API errors gracefully', async () => {
      // Mock AI to throw an error
      const { GoogleGenerativeAI } = require('@google/generative-ai')
      GoogleGenerativeAI.mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockRejectedValue(new Error('AI API Error'))
        })
      }))

      // The function should handle errors and return default values
      await expect(analyzeCV('Sample text')).rejects.toThrow()
    })

    test('should handle invalid JSON response from AI', async () => {
      // Mock AI to return invalid JSON
      const { GoogleGenerativeAI } = require('@google/generative-ai')
      GoogleGenerativeAI.mockImplementationOnce(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: jest.fn().mockReturnValue('Invalid JSON response')
            }
          })
        })
      }))

      // The function should handle invalid JSON gracefully
      await expect(analyzeCV('Sample text')).rejects.toThrow()
    })
  })

  describe('Performance Tests', () => {
    test('should complete analysis within reasonable time', async () => {
      const startTime = Date.now()
      
      await analyzeCV('Sample CV text for performance testing')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within 5 seconds (generous limit for testing)
      expect(duration).toBeLessThan(5000)
    })

    test('should handle large CV text efficiently', async () => {
      // Create a large CV text (simulate a very detailed CV)
      const largeCVText = 'Experience: ' + 'A'.repeat(10000) + '\nEducation: ' + 'B'.repeat(5000)
      
      const startTime = Date.now()
      const result = await analyzeCV(largeCVText)
      const endTime = Date.now()
      
      expect(result).toHaveProperty('scores')
      expect(endTime - startTime).toBeLessThan(10000) // 10 seconds max
    })
  })
})
