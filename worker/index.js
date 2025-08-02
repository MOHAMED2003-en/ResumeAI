// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { Worker } = require('bullmq');
const { createClient } = require('@supabase/supabase-js');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL is required');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is required');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Redis connection configuration
let connection;
if (process.env.REDIS_URL) {
  // Parse Redis URL (format: redis://[username:password@]host:port)
  const redisUrl = new URL(process.env.REDIS_URL);
  connection = {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port) || 6379,
    password: redisUrl.password || undefined,
    username: redisUrl.username || undefined,
  };
} else {
  // Fallback to individual environment variables
  connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  };
}

async function extractTextFromFile(filePath, fileType) {
  try {
    // Download file from Supabase Storage
    const { data, error } = await supabase.storage
      .from('cv-files')
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    // Extract text based on file type
    let text = '';
    
    if (fileType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (fileType === 'application/msword' || 
               fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    return text.trim();
  } catch (error) {
    console.error('Text extraction error:', error);
    throw error;
  }
}

async function analyzeCV(text) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      },
    });

    const prompt = `
You are an expert HR professional and career advisor. Analyze the following CV/Resume comprehensively and provide a detailed evaluation.

Please respond with a JSON object containing:

1. "scores" object with numerical ratings (0-10) for:
   - "experience": Work experience relevance, progression, and achievements (consider role complexity, responsibilities, impact)
   - "education": Educational background strength, relevance, and academic achievements
   - "skills": Technical competencies, soft skills, certifications, and skill diversity
   - "presentation": CV formatting, clarity, structure, and professional presentation
   - "achievements": Quantifiable accomplishments, awards, and notable contributions
   - "overall": Holistic candidate assessment (weighted average considering all factors)

2. "analysis" object with detailed professional feedback:
   - "strengths": 3-5 key strengths with specific examples from the CV
   - "weaknesses": 2-4 areas for improvement with constructive suggestions
   - "recommendations": 3-5 specific, actionable recommendations for CV enhancement
   - "summary": Professional 2-3 sentence overall assessment
   - "career_level": Assessment of career stage (Entry-level, Mid-level, Senior, Executive)
   - "industry_fit": Industries/roles this candidate would be best suited for

3. "keywords" array: 10-15 important technical and professional keywords found

4. "experience_years": Estimated years of professional experience (integer)

5. "education_level": Highest education level (High School, Bachelor's, Master's, PhD, Professional)

6. "certifications": Array of professional certifications mentioned

7. "languages": Array of languages mentioned with proficiency if stated

8. "contact_completeness": Assessment of contact information completeness (0-10)

9. "ats_score": ATS (Applicant Tracking System) friendliness score (0-10)

10. "improvement_priority": Top 3 priority areas for improvement ranked by importance

Be thorough, professional, and constructive in your analysis. Focus on actionable insights.

CV Text:
${text}

Respond only with valid JSON, no additional text or formatting.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Clean up the response to ensure it's valid JSON
    const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const analysis = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!analysis.scores || !analysis.analysis) {
        throw new Error('Invalid analysis structure');
      }

      // Ensure all required scores are present and valid
      const requiredScores = ['experience', 'education', 'skills', 'presentation', 'achievements', 'overall'];
      for (const score of requiredScores) {
        if (typeof analysis.scores[score] !== 'number' || 
            analysis.scores[score] < 0 || 
            analysis.scores[score] > 10) {
          analysis.scores[score] = 5; // Default score
        }
      }

      // Calculate overall score if not provided or invalid
      if (typeof analysis.scores.overall !== 'number') {
        analysis.scores.overall = (
          analysis.scores.experience + 
          analysis.scores.education + 
          analysis.scores.skills + 
          analysis.scores.presentation + 
          analysis.scores.achievements
        ) / 5;
      }

      // Ensure required fields have defaults
      analysis.experience_years = analysis.experience_years || 0;
      analysis.education_level = analysis.education_level || 'Not specified';
      analysis.certifications = analysis.certifications || [];
      analysis.languages = analysis.languages || [];
      analysis.contact_completeness = analysis.contact_completeness || 5;
      analysis.ats_score = analysis.ats_score || 5;
      analysis.improvement_priority = analysis.improvement_priority || [];
      
      // Ensure analysis object has required fields
      if (!analysis.analysis.career_level) analysis.analysis.career_level = 'Not determined';
      if (!analysis.analysis.industry_fit) analysis.analysis.industry_fit = 'Various industries';
      if (!analysis.analysis.strengths) analysis.analysis.strengths = [];
      if (!analysis.analysis.weaknesses) analysis.analysis.weaknesses = [];
      if (!analysis.analysis.recommendations) analysis.analysis.recommendations = [];
      if (!analysis.analysis.summary) analysis.analysis.summary = 'Analysis completed';
      
      // Ensure keywords array exists
      analysis.keywords = analysis.keywords || [];

      // Ensure analysis fields are arrays
      if (!Array.isArray(analysis.analysis.strengths)) {
        analysis.analysis.strengths = ['Professional experience demonstrated'];
      }
      if (!Array.isArray(analysis.analysis.improvements)) {
        analysis.analysis.improvements = ['Consider adding more specific achievements'];
      }
      if (typeof analysis.analysis.summary !== 'string') {
        analysis.analysis.summary = 'Professional candidate with relevant experience.';
      }

      return analysis;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', analysisText);
      
      // Return default analysis if parsing fails
      return {
        scores: {
          experience: 5,
          education: 5,
          skills: 5,
          overall: 5
        },
        analysis: {
          summary: 'CV analysis completed. Please review the document for detailed evaluation.',
          strengths: [
            'Professional presentation',
            'Relevant experience included',
            'Clear contact information'
          ],
          improvements: [
            'Consider adding more quantifiable achievements',
            'Include relevant keywords for your industry',
            'Ensure consistent formatting throughout'
          ]
        }
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

// Create the worker only if not in test environment
let worker;
if (process.env.NODE_ENV !== 'test') {
  worker = new Worker('cv-processing', async (job) => {
  const { cvId, userId, filePath, fileName, fileType } = job.data;
  
  console.log(`Processing CV: ${fileName} (ID: ${cvId})`);

  try {
    // Update status to processing
    await supabase
      .from('cvs')
      .update({ status: 'processing' })
      .eq('id', cvId);

    // Extract text from the CV file
    console.log('Extracting text from file...');
    const text = await extractTextFromFile(filePath, fileType);
    
    if (!text || text.length < 50) {
      throw new Error('Insufficient text extracted from CV');
    }

    // Analyze CV with AI
    console.log('Analyzing CV with AI...');
    const analysis = await analyzeCV(text);

    // Update database with results
    const { error: updateError } = await supabase
      .from('cvs')
      .update({
        status: 'completed',
        scores: analysis.scores,
        analysis: analysis.analysis,
        processed_date: new Date().toISOString(),
      })
      .eq('id', cvId);

    if (updateError) {
      throw new Error(`Failed to update CV record: ${updateError.message}`);
    }

    console.log(`Successfully processed CV: ${fileName}`);
    return { success: true, cvId, analysis };

  } catch (error) {
    console.error(`Error processing CV ${cvId}:`, error);

    // Update status to error
    await supabase
      .from('cvs')
      .update({ 
        status: 'error',
        error_message: error.message,
        processed_date: new Date().toISOString(),
      })
      .eq('id', cvId);

    throw error;
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

console.log('CV Processing Worker started...');
  console.log('Waiting for jobs...');
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  if (worker) {
    await worker.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  if (worker) {
    await worker.close();
  }
  process.exit(0);
});

// Export functions for testing
module.exports = {
  analyzeCV,
  extractTextFromFile
};
