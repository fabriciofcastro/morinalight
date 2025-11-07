import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
    },
    globals: true,
  },
  resolve: {
    alias: {
      "@morina/ui": path.resolve(__dirname, "src"),
    },
  },
});
