const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Transform ES modules in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(bullmq|msgpackr|@supabase|@google)/)',
  ],
  // Handle module aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Handle Node.js modules in browser environment
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
