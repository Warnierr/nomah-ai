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
  overrides: [
    {
      files: [
        'src/generated/**/*', 
        'prisma/client/**/*',
        '**/*.generated.ts',
        '**/*.generated.tsx'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      },
    },
  ],
  ignorePatterns: [
    'src/generated/**/*',
    'prisma/client/**/*',
    '.next',
    'build',
    'node_modules',
    '**/*.generated.ts',
    '**/*.generated.tsx'
  ],
} 