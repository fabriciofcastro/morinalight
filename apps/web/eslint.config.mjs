import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import cleanArchPlugin from "./eslint-rules/index.js";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  {
    plugins: {
      "clean-arch": cleanArchPlugin,
    },

    rules: {
      /* =====================================
       * 🏗️ CLEAN ARCHITECTURE
       * ===================================== */

      // ❌ Domain não pode ter dependências externas
      "clean-arch/no-domain-dependencies": "error",

      // ❌ Application não pode importar Infrastructure
      "clean-arch/no-application-infrastructure-imports": "error",

      // ❌ Presentation não pode importar Infrastructure
      "clean-arch/no-presentation-infrastructure-imports": "error",

      // ⚠️ Componentes não devem ter lógica de negócio
      "clean-arch/no-business-logic-in-components": "warn",

      /* =====================================
       * 🚫 BLOQUEIOS CRÍTICOS
       * ===================================== */

      // ❌ Nunca permitir any
      "@typescript-eslint/no-explicit-any": "error",

      // ❌ Console.log proibido
      "no-console": ["error", { allow: ["warn", "error"] }],

      // ❌ Código inseguro (IA adora)
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",

      // ❌ Promessas esquecidas
      "@typescript-eslint/no-floating-promises": "error",

      // ❌ Boolean trap
      "@typescript-eslint/strict-boolean-expressions": "error",

      // ❌ Comparações frouxas
      "eqeqeq": ["error", "always"],

      // ❌ Debug
      "no-debugger": "error",

      /* =====================================
       * 🧠 QUALIDADE OBRIGATÓRIA
       * ===================================== */

      // Evita inferência preguiçosa
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
        },
      ],

      // Hooks corretos
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);
