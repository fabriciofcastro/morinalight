import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@morina/preficha-domain": new URL("../preficha-domain/src/index.ts", import.meta.url)
        .pathname,
      "@morina/shared-kernel": new URL("../shared-kernel/src/index.ts", import.meta.url).pathname,
    },
  },
});


