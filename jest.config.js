module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/main.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
};
