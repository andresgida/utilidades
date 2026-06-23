/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': ['jest-preset-angular', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    }],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  moduleNameMapper: {
    '^@core/(.*)$':           '<rootDir>/src/app/core/$1',
    '^@domain/(.*)$':         '<rootDir>/src/app/domain/$1',
    '^@application/(.*)$':    '<rootDir>/src/app/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/app/infrastructure/$1',
    '^@shared/(.*)$':         '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$':       '<rootDir>/src/app/features/$1',
    '^@env/(.*)$':            '<rootDir>/src/environments/$1',
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 }
  },
};
