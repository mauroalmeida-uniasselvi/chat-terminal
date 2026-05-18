export default {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  coveragePathIgnorePatterns: ["/node_modules/", "/src/bdd/"],
  clearMocks: true,
  restoreMocks: true,
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
};
