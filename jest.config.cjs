module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts'],
  // Unit tests must also work after clean:all, before the distribution is built.
  moduleNameMapper: {
    '^mathjslab-markdown$': '<rootDir>/src/markdown-core.ts',
    '^mathjslab-markdown/extensions$': '<rootDir>/src/markdown-extensions.ts',
    '^mathjslab-markdown/hdl$': '<rootDir>/src/markdown-hdl.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['<rootDir>/test/markdown/**/*.spec.ts'],
  transform: {
    '^.+\\.[cm]?ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json', useESM: true }],
  },
};
