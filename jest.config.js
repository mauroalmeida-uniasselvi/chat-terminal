export default {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/bdd/"],
  clearMocks: true,
  restoreMocks: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
};
