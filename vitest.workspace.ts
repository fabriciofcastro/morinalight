import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/web/vitest.config.ts",
  "packages/ui/vitest.config.ts",
  "apps/api/vitest.config.ts",
  "packages/catalogo-application/vitest.config.ts",
  "packages/shared-kernel/vitest.config.ts",
]);
