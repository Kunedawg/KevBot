/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setupTestContainers.ts"],
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.spec.ts"],
  transform: {
    "^.+.tsx?$": ["ts-jest", { tsconfig: "tests/tsconfig.json" }],
  },
  globals: {
    NODE_ENV: "test",
  },
};
