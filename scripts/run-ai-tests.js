#!/usr/bin/env node

/**
 * AI Analysis Test Runner
 * Comprehensive test runner for CV analysis functionality
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🤖 Starting AI Analysis Test Suite...\n')

const testFiles = [
  '__tests__/ai-analysis.test.js',
  '__tests__/api-endpoints.test.js', 
  '__tests__/cv-analysis-integration.test.js',
  '__tests__/cv-uploader.test.tsx'
]

const runTests = async () => {
  try {
    console.log('📋 Running AI Analysis Tests:')
    console.log('  • AI Worker Analysis Tests')
    console.log('  • API Endpoint Tests')
    console.log('  • Integration Tests')
    console.log('  • Component Tests')
    console.log('')

    // Run Jest with specific test files
    const jestProcess = spawn('npx', [
      'jest',
      ...testFiles,
      '--verbose',
      '--coverage',
      '--coverageDirectory=coverage/ai-analysis',
      '--collectCoverageFrom=worker/**/*.js',
      '--collectCoverageFrom=app/api/**/*.js',
      '--collectCoverageFrom=components/**/*.{ts,tsx}',
      '--testTimeout=30000'
    ], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    })

    jestProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ All AI Analysis Tests Passed!')
        console.log('\n📊 Test Coverage Report Generated in coverage/ai-analysis/')
        console.log('\n🎉 AI Analysis System is Ready for Production!')
      } else {
        console.log('\n❌ Some tests failed. Please check the output above.')
        process.exit(1)
      }
    })

    jestProcess.on('error', (error) => {
      console.error('❌ Error running tests:', error)
      process.exit(1)
    })

  } catch (error) {
    console.error('❌ Failed to run AI analysis tests:', error)
    process.exit(1)
  }
}

// Display test information
console.log('🧪 Test Coverage Areas:')
console.log('  • CV Text Analysis with Gemini AI')
console.log('  • Score Validation and Ranges')
console.log('  • API Endpoint Security and Functionality')
console.log('  • File Upload and Processing')
console.log('  • Database Operations')
console.log('  • Error Handling and Edge Cases')
console.log('  • Performance and Load Testing')
console.log('  • Data Quality and Consistency')
console.log('')

runTests()
