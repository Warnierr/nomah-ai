module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "next",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "src/generated/prisma/",
    "src/env.mjs"
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { 
      'varsIgnorePattern': '^_',
      'argsIgnorePattern': '^_'
    }]
  },
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