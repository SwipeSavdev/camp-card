/** jest.config.ts (template) */
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)", "**/?(*.)+(spec|test).(ts|tsx|js)"],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx,js}", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  reporters: ["default"],
};

export default config;
