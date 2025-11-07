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
    include: ["src/**/*.{spec,test}.{ts,tsx}"],
    exclude: ["tests/**", "playwright.config.ts"],
  },
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
      "@morina/ui": path.resolve(__dirname, "../..", "packages/ui/src"),
      "@morina/realtime-client": path.resolve(__dirname, "../..", "packages/realtime-client/src"),
    },
  },
});
