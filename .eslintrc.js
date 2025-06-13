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
    '@typescript-eslint/no-empty-object-type': ['error', {
      'allowObjectType': true
    }]
  },
  ignorePatterns: [
    '**/generated/**/*',
    '**/prisma/**/*',
    '**/*.generated.*',
    '.next',
    'build',
    'node_modules',
    '**/node_modules/**',
    '.prisma/**/*',
    '@prisma/client/**/*',
    'prisma/client/**/*'
  ],
  overrides: [
    {
      files: [
        '**/prisma/client/**/*', 
        '**/@prisma/client/**/*',
        '**/node_modules/.prisma/**/*',
        '**/node_modules/@prisma/client/**/*'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/ban-types': 'off'
      }
    }
  ]
} 