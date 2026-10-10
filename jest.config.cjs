module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testMatch: ['<rootDir>/test/markdown/**/*.spec.ts'],
  transform: {
    '^.+\\.[cm]?ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json', useESM: true }],
  },
};
