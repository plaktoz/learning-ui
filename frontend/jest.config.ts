import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  passWithNoTests: true,
  // .next/standalone/package.json duplicates the root package.json's "name"
  // (it's a full standalone copy for the Docker image) — ignore it, or Jest's
  // haste module map reports a naming collision.
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
};

export default createJestConfig(config);
