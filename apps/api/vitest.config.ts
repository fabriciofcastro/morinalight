import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
      "@morina/catalogo-domain": path.resolve(
        __dirname,
        "../../packages/catalogo-domain/src/index.ts",
      ),
      "@morina/catalogo-application": path.resolve(
        __dirname,
        "../../packages/catalogo-application/src/index.ts",
      ),
      "@morina/shared-kernel": path.resolve(__dirname, "../../packages/shared-kernel/src/index.ts"),
    },
  },
});
