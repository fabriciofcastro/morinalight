import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@morina/catalogo-domain": new URL("../catalogo-domain/src/index.ts", import.meta.url)
        .pathname,
      "@morina/shared-kernel": new URL("../shared-kernel/src/index.ts", import.meta.url).pathname,
    },
  },
});
