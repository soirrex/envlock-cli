import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest/presets/default-esm",
  moduleNameMapper: {
    "^(.*)\\.js$": "$1",
  },
  testEnvironment: "node",
  testRunner: "jest-circus/runner",
  roots: ["<rootDir>/src"],
};

export default config;
