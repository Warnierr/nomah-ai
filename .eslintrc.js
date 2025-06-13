module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { 
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_'
    }],
    '@typescript-eslint/no-empty-object-type': 'error'
  },
  ignorePatterns: [
    '**/generated/**/*',
    '**/prisma/**/*',
    '**/*.generated.*',
    '.next',
    'build',
    'node_modules'
  ]
} 