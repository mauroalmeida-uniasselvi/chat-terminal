export default {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/bdd/"],
  clearMocks: true,
  restoreMocks: true,
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
};
