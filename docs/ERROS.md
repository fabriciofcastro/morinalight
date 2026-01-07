✅ [ENV] Arquivo .env carregado de: /home/fabricio/projects/morinalight/apps/api/.env
@morina/api:dev: 🔵 [PRISMA] Conectando ao banco: postgresql://***:***@localhost:5432/morina
@morina/api:dev: [SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.
@morina/api:dev: [2026-01-06 15:14:06.985 -0300] INFO (51257): ✅ Documentação Swagger registrada
@morina/api:dev:     routePrefix: "/docs"
@morina/api:dev: [2026-01-06 15:14:06.986 -0300] INFO (51257): 📚 Acesse a documentação em
@morina/api:dev:     url: "http://localhost:3333/docs"
@morina/api:dev: [2026-01-06 15:14:07.046 -0300] INFO (51257): Módulo de autenticação JWT registrado
@morina/api:dev: [2026-01-06 15:14:07.060 -0300] INFO (51257): Módulo Preficha registrado
@morina/api:dev: ✅ [REDIS] Conectando...
@morina/api:dev: ✅ [REDIS] Conectado e pronto
@morina/api:dev: prisma:query SELECT "public"."BlockedIP"."id", "public"."BlockedIP"."ip", "public"."BlockedIP"."reason", "public"."BlockedIP"."blockedAt", "public"."BlockedIP"."expiresAt", "public"."BlockedIP"."createdBy" FROM "public"."BlockedIP" WHERE ("public"."BlockedIP"."expiresAt" IS NULL OR "public"."BlockedIP"."expiresAt" > $1) OFFSET $2
@morina/api:dev: [2026-01-06 15:14:07.732 -0300] INFO (51257): ✅ Módulo Users registrado com todas as rotas
@morina/api:dev: [2026-01-06 15:14:07.735 -0300] INFO (51257): ✅ Módulo Profile registrado com todas as rotas
@morina/api:dev: [2026-01-06 15:14:07.743 -0300] INFO (51257): Módulo Clientes registrado
@morina/api:dev: [2026-01-06 15:14:07.750 -0300] INFO (51257): ✅ Módulo Pré-Fichas Técnicas (Moldes Liberados) registrado
@morina/api:dev: [2026-01-06 15:14:07.761 -0300] INFO (51257): ✅ Módulo Fichas de Custo de Aviamentos registrado
@morina/api:dev: [2026-01-06 15:14:07.765 -0300] INFO (51257): ✅ Módulo Status Customizado Ficha Custo registrado
@morina/api:dev: [2026-01-06 15:14:07.811 -0300] INFO (51257): Módulo Estrutura Organizacional registrado
@morina/api:dev: [2026-01-06 15:14:07.832 -0300] INFO (51257): Módulo Permissions registrado
@morina/api:dev: [2026-01-06 15:14:07.840 -0300] INFO (51257): ✅ Módulo Notifications registrado com todas as rotas CRUD
@morina/api:dev: [2026-01-06 15:14:08.152 -0300] INFO (51257): Server listening at http://127.0.0.1:3333
@morina/api:dev: [2026-01-06 15:14:08.152 -0300] INFO (51257): Server listening at http://192.168.15.3:3333
@morina/api:dev: [2026-01-06 15:14:08.152 -0300] INFO (51257): Server listening at http://172.18.0.1:3333
@morina/api:dev: [2026-01-06 15:14:08.152 -0300] INFO (51257): Servidor HTTP iniciado
@morina/api:dev:     port: 3333
@morina/api:dev: [2026-01-06 15:14:08.152 -0300] INFO (51257): 📚 Documentação Swagger disponível em
@morina/api:dev:     url: "http://localhost:3333/docs"
@morina/api:dev: [GovernanceScheduler] Starting Risk Monitor (every 5m)...
web:dev:  ✓ Compiled in 1162ms
web:dev:  ✓ Compiled in 1135ms
web:dev:  ✓ Compiled in 673ms
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(auth)/login/page.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/index.ts:86:1
web:dev: Module not found: Can't resolve './components/select'
web:dev:   84 | export * from "./components/rich-text-editor";
web:dev:   85 | export * from "./components/search-bar";
web:dev: > 86 | export * from "./components/select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   87 | export * from "./components/skeleton";
web:dev:   88 | export * from "./components/skip-link";
web:dev:   89 | export * from "./components/slider";
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   #1 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component Browser]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #2 [Client Component Browser]:
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   #3 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/layout/EnterpriseSidebar.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Client Component SSR]
web:dev:     ./apps/web/src/app/(app)/layout.tsx [Server Component]
web:dev: 
web:dev:   #4 [Client Component SSR]:
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/form-select.tsx:7:1
web:dev: Module not found: Can't resolve './select'
web:dev:    5 | import { cn } from "../lib/cn";
web:dev:    6 | import { FormField } from "./form-field";
web:dev: >  7 | import { Select, type SelectProps } from "./select";
web:dev:      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:    8 |
web:dev:    9 | export interface FormSelectProps extends SelectProps {
web:dev:   10 |   label?: string;
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/form-select.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev:  ⨯ ./packages/ui/src/components/time-picker.tsx:6:1
web:dev: Module not found: Can't resolve './select'
web:dev:   4 | import type * as React from "react";
web:dev:   5 | import { cn } from "../lib/cn";
web:dev: > 6 | import { Select } from "./select";
web:dev:     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
web:dev:   7 |
web:dev:   8 | /**
web:dev:   9 |  * TimePicker Component - Enterprise Grade
web:dev: 
web:dev: 
web:dev: 
web:dev: Import traces:
web:dev:   Client Component Browser:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component Browser]
web:dev:     ./packages/ui/src/index.ts [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component Browser]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev:   Client Component SSR:
web:dev:     ./packages/ui/src/components/time-picker.tsx [Client Component SSR]
web:dev:     ./packages/ui/src/index.ts [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Client Component SSR]
web:dev:     ./apps/web/src/components/theme-shell.tsx [Server Component]
web:dev:     ./apps/web/src/app/layout.tsx [Server Component]
web:dev: 
web:dev: https://nextjs.org/docs/messages/module-not-found
web:dev: 
web:dev: 
web:dev: ℹ️ [INFO] Starting threat feed update
web:dev: ℹ️ [INFO] Threat feed update completed
web:dev:  ✓ Compiled in 1126ms
web:dev:  ✓ Compiled in 1749ms
web:dev: ℹ️ [INFO] Starting threat feed update
web:dev: ℹ️ [INFO] Threat feed update completed
web:dev: ℹ️ [INFO] Starting threat feed update
web:dev: ℹ️ [INFO] Threat feed update completed
^C>                                                                                                                                                   @morina/realtime:dev: 5:41:14 PM [tsx] Previous process hasn't exited yet. Force killing...
@morina/api:dev: 5:41:14 PM [tsx] Previous process hasn't exited yet. Force killing...
 ELIFECYCLE  Command failed.
cli:dev:  ELIFECYCLE  Command failed.                                                                                                                 
@morina/realtime:dev:  ELIFECYCLE  Command failed with exit code 130.
@morina/observability:dev:  ELIFECYCLE  Command failed.
[fabricio@fedora]~/projects/morinalight%  ERROR  run failed: command  exited (1)

[fabricio@fedora]~/projects/morinalight% bun scripts/setup-enforcement.ts 
zsh: bun: command not found...
[fabricio@fedora]~/projects/morinalight% cd script 
cd: no such file or directory: script
[fabricio@fedora]~/projects/morinalight% cd scripts
[fabricio@fedora]~/projects/morinalight/scripts% npx tsx scripts/setup-enforcement.ts
sh: line 1: tsx: command not found
[fabricio@fedora]~/projects/morinalight/scripts% npx tsx scripts/auto_setup_script.ts
sh: line 1: tsx: command not found
[fabricio@fedora]~/projects/morinalight/scripts% npx tsx /auto_setup_script.ts 
sh: line 1: tsx: command not found
[fabricio@fedora]~/projects/morinalight/scripts% cd ..
[fabricio@fedora]~/projects/morinalight% npx tsx scripts/auto_setup_script.ts
sh: line 1: tsx: command not found
[fabricio@fedora]~/projects/morinalight% 
[fabricio@fedora]~/projects/morinalight% npx tsx scripts/auto_setup_script.ts
sh: line 1: tsx: command not found
[fabricio@fedora]~/projects/morinalight% 
[fabricio@fedora]~/projects/morinalight% npm install -D tsx
npm error Cannot read properties of null (reading 'matches')
npm error A complete log of this run can be found in: /home/fabricio/.npm/_logs/2026-01-06T21_43_32_698Z-debug-0.log
[fabricio@fedora]~/projects/morinalight% npm install -D tsx -w .

npm error No workspaces found:
npm error   --workspace=.
npm error A complete log of this run can be found in: /home/fabricio/.npm/_logs/2026-01-06T21_45_38_892Z-debug-0.log
[fabricio@fedora]~/projects/morinalight% pnpm install -D tsx -w .

packages/ui                              |  WARN  deprecated next@16.0.1
apps/web                                 |  WARN  deprecated @types/ioredis@5.0.0
apps/web                                 |  WARN  deprecated @types/node-cache@4.2.5
apps/web                                 |  WARN  deprecated @types/qrcode.react@3.0.0
apps/api                                 |  WARN  deprecated @types/cookie@1.0.0
 WARN  9 deprecated subdependencies found: are-we-there-yet@2.0.0, fstream@1.0.12, gauge@3.0.2, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, npmlog@5.0.1, rimraf@2.7.1, rimraf@3.0.2
Progress: resolved 2164, reused 0, downloaded 0, added 0, done
 WARN  Issues with peer dependencies found
apps/api
└─┬ fastify-type-provider-zod 6.1.0
  └── ✕ unmet peer zod@>=4.1.5: found 3.25.76

apps/web
├─┬ react-diff-viewer-continued 3.4.0
│ ├── ✕ unmet peer react@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
│ └── ✕ unmet peer react-dom@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
└─┬ react-spring 10.0.3
  └─┬ @react-spring/zdog 10.0.3
    ├── ✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0
    └── ✕ unmet peer react-dom@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0

packages/ui
└─┬ @tanstack/zod-form-adapter 0.42.1
  └── ✕ unmet peer zod@^3.x: found 4.3.5

devDependencies:
+ morinalight link:
+ tsx ^4.20.6

Already up to date
. prepare$ husky
└─ Done in 163ms
Done in 17.2s using pnpm v10.18.2
[fabricio@fedora]~/projects/morinalight% npx tsx scripts/auto_setup_script.ts
🎖️  CONFIGURANDO LEI MARCIAL...

✅ Criado: .cursorrules
✅ Criado: .github/copilot-instructions.md
✅ Criado: .ai/project-context.md
✅ Criado: scripts/validate-fsd.js
✅ Criado: scripts/check-quality.js
✅ Criado: .github/workflows/enforce.yml

📦 Instalando dependências...
⚠️  Rode manualmente: pnpm add -D chalk

📝 Atualizando package.json...
✅ package.json atualizado

🪝 Configurando Husky...
✅ Criado: .husky/pre-commit
✅ Husky configurado
✅ Criado: .vscode/settings.json

📝 Atualizando .gitignore...
✅ .gitignore atualizado

==================================================
🎉 LEI MARCIAL CONFIGURADA!

Próximos passos:
1. Configure variáveis de ambiente (Sentry, etc)
2. Rode: pnpm enforce
3. Teste com: git add . && git commit -m "test"
4. Configure secrets no GitHub Actions

Comandos disponíveis:
  pnpm enforce        # Validação completa
  pnpm enforce:fsd    # Valida apenas FSD
  pnpm type-check     # Type checking
  pnpm lint           # ESLint
  pnpm test           # Testes unitários

[fabricio@fedora]~/projects/morinalight% pnpm add -D chalk
 ERR_PNPM_ADDING_TO_ROOT  Running this command will add the dependency to the workspace root, which might not be what you want - if you really meant it, make it explicit by running this command again with the -w flag (or --workspace-root). If you don't want to see this warning anymore, you may set the ignore-workspace-root-check setting to true.
[fabricio@fedora]~/projects/morinalight% pnpm add -D chalk -w


   ╭──────────────────────────────────────────╮
   │                                          │
   │   Update available! 10.18.2 → 10.27.0.   │
   │   Changelog: https://pnpm.io/v/10.27.0   │
   │     To update, run: pnpm self-update     │
   │                                          │
   ╰──────────────────────────────────────────╯

packages/ui                              |  WARN  deprecated next@16.0.1
apps/web                                 |  WARN  deprecated @types/qrcode.react@3.0.0
apps/web                                 |  WARN  deprecated @types/node-cache@4.2.5
apps/web                                 |  WARN  deprecated @types/ioredis@5.0.0
apps/api                                 |  WARN  deprecated @types/cookie@1.0.0
 WARN  9 deprecated subdependencies found: are-we-there-yet@2.0.0, fstream@1.0.12, gauge@3.0.2, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, npmlog@5.0.1, rimraf@2.7.1, rimraf@3.0.2
Progress: resolved 2164, reused 0, downloaded 0, added 0, done
 WARN  Issues with peer dependencies found
apps/api
└─┬ fastify-type-provider-zod 6.1.0
  └── ✕ unmet peer zod@>=4.1.5: found 3.25.76

apps/web
├─┬ react-diff-viewer-continued 3.4.0
│ ├── ✕ unmet peer react@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
│ └── ✕ unmet peer react-dom@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
└─┬ react-spring 10.0.3
  └─┬ @react-spring/zdog 10.0.3
    ├── ✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0
    └── ✕ unmet peer react-dom@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0

packages/ui
└─┬ @tanstack/zod-form-adapter 0.42.1
  └── ✕ unmet peer zod@^3.x: found 4.3.5

devDependencies:
+ chalk ^5.6.2

Already up to date
. prepare$ husky
└─ Done in 194ms
Done in 15.8s using pnpm v10.18.2
[fabricio@fedora]~/projects/morinalight% pnpm config set ignore-workspace-root-check true

[fabricio@fedora]~/projects/morinalight% pnpm enforce


> morinalight@ enforce /home/fabricio/projects/morinalight
> node scripts/check-quality.js


🛡️  VALIDAÇÃO DE QUALIDADE

🔍 TypeScript...
apps/api/src/modules/permissions/services/ml-ensemble.service.ts:100:5 - error TS1131: Property or signature expected.

100     modelsT rained: number;
        ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:103:2 - error TS1109: Expression expected.

103 }> {
     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:104:12 - error TS1005: ',' expected.

104     console.log('🔄 Training ensemble models...');
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:104:50 - error TS1005: ',' expected.

104     console.log('🔄 Training ensemble models...');
                                                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:106:11 - error TS1005: ':' expected.

106     const trainingData = await this.collectTrainingData(orgId);
              ~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:106:63 - error TS1005: ',' expected.

106     const trainingData = await this.collectTrainingData(orgId);
                                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:11 - error TS1005: ':' expected.

107     const metrics: Record<string, ModelMetrics> = { };
              ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:18 - error TS1005: ',' expected.

107     const metrics: Record<string, ModelMetrics> = { };
                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:49 - error TS1005: '(' expected.

107     const metrics: Record<string, ModelMetrics> = { };
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:51 - error TS1136: Property assignment expected.

107     const metrics: Record<string, ModelMetrics> = { };
                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:143:3 - error TS1128: Declaration or statement expected.

143   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:3 - error TS1434: Unexpected keyword or identifier.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:35 - error TS1005: ',' expected.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:50 - error TS1005: ',' expected.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
                                                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:59 - error TS1005: ';' expected.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
                                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:149:11 - error TS1005: ':' expected.

149     const features = await this.extractFeatures(userId, orgId);
              ~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:149:63 - error TS1005: ',' expected.

149     const features = await this.extractFeatures(userId, orgId);
                                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:150:11 - error TS1005: ':' expected.

150     const modelPredictions = [];
              ~~~~~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:150:32 - error TS1005: ',' expected.

150     const modelPredictions = [];
                                   ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:9 - error TS1359: Identifier expected. 'const' is a reserved word that cannot be used here.

153     for(const [modelName, model] of this.models.entries()) {
            ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:15 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:34 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                     ~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:37 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                        ~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:41 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                            ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:58 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                                             ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:60 - error TS1136: Property assignment expected.

153     for(const [modelName, model] of this.models.entries()) {
                                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:187:3 - error TS1128: Declaration or statement expected.

187   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:192:3 - error TS1434: Unexpected keyword or identifier.

192   async evaluateEnsemble(orgId: string): Promise < {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:192:31 - error TS1005: ',' expected.

192   async evaluateEnsemble(orgId: string): Promise < {
                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:192:40 - error TS1005: ';' expected.

192   async evaluateEnsemble(orgId: string): Promise < {
                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:193:34 - error TS1005: ',' expected.

193     ensembleMetrics: ModelMetrics;
                                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:194:52 - error TS1005: ',' expected.

194     individualMetrics: Record<string, ModelMetrics>;
                                                       ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:195:24 - error TS1005: ',' expected.

195     improvement: number; // % de melhoria sobre melhor modelo individual
                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:197:11 - error TS1005: ':' expected.

197     const testData = await this.collectTestData(orgId);
              ~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:197:55 - error TS1005: ',' expected.

197     const testData = await this.collectTestData(orgId);
                                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:200:11 - error TS1005: ':' expected.

200     const ensembleMetrics = await this.evaluateOnTestData(testData, 'ensemble');
              ~~~~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:200:80 - error TS1005: ',' expected.

200     const ensembleMetrics = await this.evaluateOnTestData(testData, 'ensemble');
                                                                                   ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:11 - error TS1005: ':' expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
              ~~~~~~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:28 - error TS1005: ',' expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:59 - error TS1005: '(' expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
                                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:61 - error TS1136: Property assignment expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
                                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:217:3 - error TS1128: Declaration or statement expected.

217   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:222:3 - error TS1434: Unexpected keyword or identifier.

222   async autoFeatureEngineering(rawFeatures: any): Promise < {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:222:43 - error TS1005: ',' expected.

222   async autoFeatureEngineering(rawFeatures: any): Promise < {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:222:49 - error TS1005: ';' expected.

222   async autoFeatureEngineering(rawFeatures: any): Promise < {
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:223:29 - error TS1005: ',' expected.

223     originalFeatures: number;
                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:224:31 - error TS1005: ',' expected.

224     engineeredFeatures: number;
                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:225:25 - error TS1011: An element access expression should take an argument.

225     newFeatures: string[];
                            

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:225:26 - error TS1005: ',' expected.

225     newFeatures: string[];
                             ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:11 - error TS1005: ':' expected.

227     const newFeatures: string[] = [];
              ~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:22 - error TS1005: ',' expected.

227     const newFeatures: string[] = [];
                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:30 - error TS1005: ',' expected.

227     const newFeatures: string[] = [];
                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:31 - error TS1109: Expression expected.

227     const newFeatures: string[] = [];
                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:33 - error TS1005: ':' expected.

227     const newFeatures: string[] = [];
                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:37 - error TS1005: ',' expected.

227     const newFeatures: string[] = [];
                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:230:19 - error TS1005: ',' expected.

230     if(rawFeatures.permissionCount && rawFeatures.roleCount) {
                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:230:60 - error TS1005: ',' expected.

230     if(rawFeatures.permissionCount && rawFeatures.roleCount) {
                                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:230:62 - error TS1136: Property assignment expected.

230     if(rawFeatures.permissionCount && rawFeatures.roleCount) {
                                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:256:3 - error TS1128: Declaration or statement expected.

256   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:3 - error TS1434: Unexpected keyword or identifier.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:38 - error TS1005: ',' expected.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:53 - error TS1005: ',' expected.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
                                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:62 - error TS1005: ';' expected.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
                                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:262:36 - error TS1005: ',' expected.

262     bestParams: Record<string, any>;
                                       ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:263:25 - error TS1005: ',' expected.

263     bestAccuracy: number;
                            ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:264:22 - error TS1005: ',' expected.

264     trialsRun: number;
                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:266:12 - error TS1005: ',' expected.

266     console.log(`🔧 Tuning hyperparameters for ${modelType}...`);
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:266:65 - error TS1005: ',' expected.

266     console.log(`🔧 Tuning hyperparameters for ${modelType}...`);
                                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:268:11 - error TS1005: ':' expected.

268     const paramGrid = this.getParameterGrid(modelType);
              ~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:268:55 - error TS1005: ',' expected.

268     const paramGrid = this.getParameterGrid(modelType);
                                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:269:9 - error TS1005: ',' expected.

269     let bestAccuracy = 0;
            ~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:269:25 - error TS1005: ',' expected.

269     let bestAccuracy = 0;
                            ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:270:9 - error TS1005: ',' expected.

270     let bestParams = {};
            ~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:270:24 - error TS1005: ',' expected.

270     let bestParams = {};
                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:271:9 - error TS1005: ',' expected.

271     let trialsRun = 0;
            ~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:271:22 - error TS1005: ',' expected.

271     let trialsRun = 0;
                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:9 - error TS1359: Identifier expected. 'const' is a reserved word that cannot be used here.

274     for(const params of paramGrid) {
            ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:15 - error TS1005: ',' expected.

274     for(const params of paramGrid) {
                  ~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:22 - error TS1005: ',' expected.

274     for(const params of paramGrid) {
                         ~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:25 - error TS1005: ',' expected.

274     for(const params of paramGrid) {
                            ~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:286:5 - error TS1005: ',' expected.

286     console.log(`✅ Best params found: ${JSON.stringify(bestParams)} with ${(bestAccuracy * 100).toFixed(2)}% accuracy`);
        ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:286:12 - error TS1005: ',' expected.

286     console.log(`✅ Best params found: ${JSON.stringify(bestParams)} with ${(bestAccuracy * 100).toFixed(2)}% accuracy`);
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:286:120 - error TS1005: ',' expected.

286     console.log(`✅ Best params found: ${JSON.stringify(bestParams)} with ${(bestAccuracy * 100).toFixed(2)}% accuracy`);
                                                                                                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:288:12 - error TS1005: ':' expected.

288     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:292:6 - error TS1005: ',' expected.

292     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:3 - error TS1128: Declaration or statement expected.

296   private async collectTrainingData(orgId: string): Promise < any > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:11 - error TS1434: Unexpected keyword or identifier.

296   private async collectTrainingData(orgId: string): Promise < any > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:42 - error TS1005: ',' expected.

296   private async collectTrainingData(orgId: string): Promise < any > {
                                             ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:51 - error TS1005: ';' expected.

296   private async collectTrainingData(orgId: string): Promise < any > {
                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:298:12 - error TS1005: ':' expected.

298     return { features: [], labels: [] };
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:298:40 - error TS1005: ',' expected.

298     return { features: [], labels: [] };
                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:3 - error TS1128: Declaration or statement expected.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:11 - error TS1434: Unexpected keyword or identifier.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:40 - error TS1005: ',' expected.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:46 - error TS1005: ';' expected.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:303:12 - error TS1005: ':' expected.

303     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:309:6 - error TS1005: ',' expected.

309     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:3 - error TS1128: Declaration or statement expected.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:11 - error TS1434: Unexpected keyword or identifier.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:39 - error TS1005: ',' expected.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:45 - error TS1005: ';' expected.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:314:12 - error TS1005: ':' expected.

314     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:320:6 - error TS1005: ',' expected.

320     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:3 - error TS1128: Declaration or statement expected.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:11 - error TS1434: Unexpected keyword or identifier.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:43 - error TS1005: ',' expected.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:49 - error TS1005: ';' expected.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:325:12 - error TS1005: ':' expected.

325     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:331:6 - error TS1005: ',' expected.

331     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:3 - error TS1128: Declaration or statement expected.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:11 - error TS1434: Unexpected keyword or identifier.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:30 - error TS1005: ',' expected.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:36 - error TS1005: ';' expected.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
                                       ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:336:12 - error TS1005: ':' expected.

336     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:342:6 - error TS1005: ',' expected.

342     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:3 - error TS1128: Declaration or statement expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:11 - error TS1434: Unexpected keyword or identifier.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:39 - error TS1005: ',' expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:54 - error TS1005: ',' expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
                                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:63 - error TS1005: ';' expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
                                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:347:12 - error TS1005: ':' expected.

347     return {};
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:347:14 - error TS1005: ',' expected.

347     return {};
                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:3 - error TS1128: Declaration or statement expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:11 - error TS1434: Unexpected keyword or identifier.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:43 - error TS1005: ',' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:61 - error TS1005: ',' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:67 - error TS1005: ';' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:99 - error TS1005: ',' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                                                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:352:12 - error TS1005: ':' expected.

352     return { isAnomaly: false, confidence: 0.7 };
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:352:49 - error TS1005: ',' expected.

352     return { isAnomaly: false, confidence: 0.7 };
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:3 - error TS1128: Declaration or statement expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:35 - error TS1005: ',' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:53 - error TS1005: ',' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:59 - error TS1011: An element access expression should take an argument.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                              

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:61 - error TS1005: ';' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:70 - error TS1011: An element access expression should take an argument.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                                         

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:72 - error TS1005: ';' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:3 - error TS1128: Declaration or statement expected.

366   private async collectTestData(orgId: string): Promise < any > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:11 - error TS1434: Unexpected keyword or identifier.

366   private async collectTestData(orgId: string): Promise < any > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:38 - error TS1005: ',' expected.

366   private async collectTestData(orgId: string): Promise < any > {
                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:47 - error TS1005: ';' expected.

366   private async collectTestData(orgId: string): Promise < any > {
                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:368:12 - error TS1005: ':' expected.

368     return [];
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:368:14 - error TS1005: ',' expected.

368     return [];
                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:3 - error TS1128: Declaration or statement expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:11 - error TS1434: Unexpected keyword or identifier.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:44 - error TS1005: ',' expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:60 - error TS1005: ',' expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
                                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:69 - error TS1005: ';' expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
                                                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:373:12 - error TS1005: ':' expected.

373     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:379:6 - error TS1005: ',' expected.

379     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:3 - error TS1128: Declaration or statement expected.

382   private getParameterGrid(modelType: string): any[] {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:37 - error TS1005: ',' expected.

382   private getParameterGrid(modelType: string): any[] {
                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:46 - error TS1005: ';' expected.

382   private getParameterGrid(modelType: string): any[] {
                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:52 - error TS1011: An element access expression should take an argument.

382   private getParameterGrid(modelType: string): any[] {
                                                       

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:54 - error TS1005: ';' expected.

382   private getParameterGrid(modelType: string): any[] {
                                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:3 - error TS1128: Declaration or statement expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:11 - error TS1434: Unexpected keyword or identifier.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:43 - error TS1005: ',' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:59 - error TS1005: ',' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:71 - error TS1005: ',' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:80 - error TS1005: ';' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                                                                   ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:393:12 - error TS1005: ':' expected.

393     return 0.85 + Math.random() * 0.1;
               ~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:393:38 - error TS1005: ',' expected.

393     return 0.85 + Math.random() * 0.1;
                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:395:1 - error TS1128: Declaration or statement expected.

395 }
    ~


Found 164 errors in the same file, starting at: apps/api/src/modules/permissions/services/ml-ensemble.service.ts:100

❌ TypeScript
🔍 Lint...
/bin/sh: line 1: eslint: command not found
❌ Lint
🔍 Tests...
The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 RUN  v2.1.9 /home/fabricio/projects/morinalight

stderr | tests/clientes/clientes.route.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stderr | tests/organizations/invites.route.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stderr | tests/auth/auth.routes.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stderr | tests/preficha/preficha-isolation.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

 ❯ |@morina/api| tests/tenant/tenant-isolation.test.ts (0)
 ❯ |@morina/api| tests/catalogo/catalog-advanced.route.test.ts (0)
 ❯ |@morina/api| tests/catalogo/create-product.route.test.ts (0)
 ✓ |@morina/api| tests/permissions/permissions.use-case.test.ts (8)
 ❯ |@morina/api| tests/clientes/criar-representante.use-case.test.ts (3)
   ❯ CriarRepresentanteUseCase (3)
     × deve criar um representante vinculado a um cliente
     × não deve criar representante para cliente inexistente
     × não deve permitir criar dois representantes para o mesmo cliente
 ❯ |@morina/catalogo-application| tests/reject-product.use-case.test.ts (0)
stderr | tests/organizations/members.route.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stdout | src/lib/governance/tests/engine.spec.ts > Governance Engine - Stress & Logic Tests > should FLAG outside hours access (TBAC)
[BACKLOG][INFO] Acesso fora do horário de trabalho { user: '247adeab-3a69-4e98-b2b6-7e2cd9a98979', area: 'HR' }
[BACKLOG][CRITICAL] Tentativa de acesso de IP estrangeiro { user: '247adeab-3a69-4e98-b2b6-7e2cd9a98979', area: 'SECURITY' }

stderr | src/lib/governance/tests/engine.spec.ts > Governance Engine - Stress & Logic Tests > should DETECT BROKEN CHAIN (Integrity)
Broken Chain at index 1

stderr | src/lib/siem/tests/siem-exporter.spec.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stdout | src/lib/siem/tests/siem-exporter.spec.ts > SiemExporter > should batch logs and send them when batch size is reached
[SIEM] Exporter inicializado para http://siem.test/logs

stdout | src/lib/siem/tests/siem-exporter.spec.ts > SiemExporter > should retry on failure and re-queue logs if still failing
[SIEM] Exporter inicializado para http://siem.test/logs

stdout | src/lib/siem/tests/siem-exporter.spec.ts > SiemExporter > should flush logs on interval
[SIEM] Exporter inicializado para http://siem.test/logs

stderr | src/__tests__/recovery-flow.test.ts > Password Recovery Flow > requestReset > should rate limit frequent requests
[Security] Rate limit exceeded for test@example.com

stderr | tests/permissions/permissions.route.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stderr | tests/contracts/company-settings.contract.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stderr | tests/company/company-settings.route.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stderr | tests/organizations/list-organizations.route.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stderr | tests/realtime/token.route.test.ts
[SIEM] Endpoint não configurado. Logs serão descartados ou apenas logados localmente.

stdout | src/lib/patterns/__tests__/patterns.test.ts > Memento Pattern > should save and restore state correctly
[Originator] State updated to: { value: 'changed' }
[Caretaker] Saving state...
[Originator] State updated to: { value: 'changed again' }
[Caretaker] Restoring state to: 2026-01-06T21:53:33.116Z
[Originator] State restored to: { value: 'changed' }

stdout | src/lib/patterns/__tests__/patterns.test.ts > Memento Pattern > should handle document editor history
[Originator] State updated to: { content: 'Hello', cursorPosition: 5, selection: null }
[Caretaker] Saving state...
[Originator] State updated to: { content: 'Hello World', cursorPosition: 11, selection: null }
[Caretaker] Restoring state to: 2026-01-06T21:53:33.118Z
[Originator] State restored to: { content: 'Hello', cursorPosition: 5, selection: null }

stdout | src/lib/patterns/__tests__/patterns.test.ts > Caching Decorator > should cache results
[Cache] Miss for TestService:getData:["1"], executing...
[Cache] Hit for TestService:getData:["1"]
[Cache] Miss for TestService:getData:["2"], executing...

stdout | src/lib/patterns/__tests__/patterns.test.ts > Caching Decorator > should invalidate cache on update
[Cache] Miss for TestService:getData:["A"], executing...
[Cache] Invalidating prefixes: TestService
[Cache] Miss for TestService:getData:["A"], executing...

stdout | src/lib/patterns/__tests__/patterns.test.ts > Adapter Pattern > should adapt legacy system to new interface
[Legacy System] Processing payment: 100 USD for user user-123

stderr | src/__tests__/integration/users.test.ts > Users Integration > Fluxo completo: Criar usuário > deve criar um novo usuário com sucesso
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/users.test.ts > Users Integration > Fluxo completo: Criar usuário > deve validar CPF inválido ao criar usuário
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/users.test.ts > Users Integration > Fluxo completo: Criar usuário > deve validar CPF inválido ao criar usuário
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/users.test.ts > Users Integration > Fluxo: Importação em massa > deve validar formato de arquivo CSV
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/users.test.ts > Users Integration > Fluxo: Importação em massa > deve validar formato de arquivo CSV
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/users.test.ts > Users Integration > Fluxo: Exportação > deve exportar lista de usuários
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/users.test.ts > Users Integration > Fluxo: Exportação > deve exportar lista de usuários
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/security.test.ts > Security Tests > Data Encryption > deve falhar ao descriptografar dados inválidos
Decryption error: Error: Invalid ciphertext format
    at Module.decrypt (/home/fabricio/projects/morinalight/apps/web/src/lib/crypto/encryption.ts:71:19)
    at /home/fabricio/projects/morinalight/apps/web/src/__tests__/security.test.ts:39:26
    at Proxy.assertThrows (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/chai@5.3.3/node_modules/chai/index.js:2767:5)
    at Proxy.methodWrapper (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/chai@5.3.3/node_modules/chai/index.js:1686:25)
    at Proxy.<anonymous> (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+expect@2.1.9/node_modules/@vitest/expect/dist/index.js:1029:16)
    at Proxy.overwritingMethodWrapper (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/chai@5.3.3/node_modules/chai/index.js:1735:33)
    at Proxy.<anonymous> (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+expect@2.1.9/node_modules/@vitest/expect/dist/index.js:1509:21)
    at Proxy.<anonymous> (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+expect@2.1.9/node_modules/@vitest/expect/dist/index.js:972:17)
    at Proxy.methodWrapper (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/chai@5.3.3/node_modules/chai/index.js:1686:25)
    at /home/fabricio/projects/morinalight/apps/web/src/__tests__/security.test.ts:39:51
Decryption error: TypeError: Invalid initialization vector
    at Decipheriv.createCipherBase (node:internal/crypto/cipher:121:19)
    at Decipheriv.createCipherWithIV (node:internal/crypto/cipher:133:3)
    at new Decipheriv (node:internal/crypto/cipher:278:3)
    at Object.createDecipheriv (node:crypto:150:10)
    at Module.decrypt (/home/fabricio/projects/morinalight/apps/web/src/lib/crypto/encryption.ts:77:33)
    at /home/fabricio/projects/morinalight/apps/web/src/__tests__/security.test.ts:40:26
    at Proxy.assertThrows (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/chai@5.3.3/node_modules/chai/index.js:2767:5)
    at Proxy.methodWrapper (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/chai@5.3.3/node_modules/chai/index.js:1686:25)
    at Proxy.<anonymous> (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+expect@2.1.9/node_modules/@vitest/expect/dist/index.js:1029:16)
    at Proxy.overwritingMethodWrapper (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/chai@5.3.3/node_modules/chai/index.js:1735:33) {
  code: 'ERR_CRYPTO_INVALID_IV'
}

stderr | src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo completo: Criar e gerenciar notificação > deve criar uma nova notificação
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo completo: Criar e gerenciar notificação > deve obter estatísticas de notificações
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo completo: Criar e gerenciar notificação > deve obter estatísticas de notificações
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo completo: Criar e gerenciar notificação > deve marcar todas as notificações como lidas
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo: Preferências de notificação > deve obter preferências de notificação
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo: Preferências de notificação > deve atualizar preferências de notificação
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/notifications.test.ts
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

       × deve criar um novo usuário com sucesso
       × deve validar CPF inválido ao criar usuário
     ✓ Fluxo completo: Editar usuário (1)
     ✓ Fluxo completo: Excluir usuário (1)
     ❯ Fluxo: Importação em massa (1)
       × deve validar formato de arquivo CSV
     ❯ Fluxo: Exportação (1)
       × deve exportar lista de usuários
 ❯ |web| src/hooks/queries/use-users.test.tsx (0)
 ❯ |web| src/__tests__/integration/notifications.test.ts (6)
   ❯ Notifications Integration (6)
     ❯ Fluxo completo: Criar e gerenciar notificação (4)
       × deve criar uma nova notificação
       ✓ deve marcar notificação como lida
       × deve obter estatísticas de notificações
       × deve marcar todas as notificações como lidas
     ❯ Fluxo: Preferências de notificação (2)
       × deve obter preferências de notificação
       × deve atualizar preferências de notificação
 ❯ |web| src/lib/validators/brazilian.test.ts (20)
   ❯ Brazilian Validators (20)
     ✓ CPF (3)
     ✓ CNPJ (3)
     ✓ CEP (3)
     ❯ Phone (3)
       ✓ should validate correct phone numbers
       × should reject invalid phone numbers
       ✓ should format phone correctly
     ✓ Email (2)
     ❯ Date (3)
       ✓ should validate correct dates
       ✓ should reject invalid dates
       × should format date correctly
     ✓ Password Strength (3)
node:events:497
      throw er; // Unhandled 'error' event
      ^

stdout | src/__tests__/security.test.ts > Security Tests > Security Monitor > deve exportar função de monitoramento
{"level":"info","message":"Redis rate limiter initialized","timestamp":"2026-01-06T21:53:34.588Z","context":{}}

     ✓ Fluxo completo: Editar usuário (1)
     ✓ Fluxo completo: Excluir usuário (1)
     ❯ Fluxo: Importação em massa (1)
       × deve validar formato de arquivo CSV
     ❯ Fluxo: Exportação (1)
       × deve exportar lista de usuários
 ❯ |web| src/hooks/queries/use-users.test.tsx (0)
 ❯ |web| src/__tests__/integration/notifications.test.ts (6)
   ❯ Notifications Integration (6)
     ❯ Fluxo completo: Criar e gerenciar notificação (4)
       × deve criar uma nova notificação
       ✓ deve marcar notificação como lida
       × deve obter estatísticas de notificações
       × deve marcar todas as notificações como lidas
     ❯ Fluxo: Preferências de notificação (2)
       × deve obter preferências de notificação
       × deve atualizar preferências de notificação
 ❯ |web| src/lib/validators/brazilian.test.ts (20)
   ❯ Brazilian Validators (20)
     ✓ CPF (3)
     ✓ CNPJ (3)
     ✓ CEP (3)
     ❯ Phone (3)
       ✓ should validate correct phone numbers
       × should reject invalid phone numbers
       ✓ should format phone correctly
     ✓ Email (2)
     ❯ Date (3)
       ✓ should validate correct dates
       ✓ should reject invalid dates
       × should format date correctly
     ✓ Password Strength (3)
 ✓ |web| src/lib/patterns/__tests__/command-pattern.test.ts (9)
 ✓ |web| src/lib/patterns/__tests__/payment-strategy.test.ts (8)
node:events:497
      throw er; // Unhandled 'error' event
      ^

stderr | src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Obter perfil do usuário > deve obter perfil do usuário autenticado
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Atualizar perfil > deve atualizar dados do perfil
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Alterar senha > deve validar senha atual ao alterar senha
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Alterar senha > deve validar senha atual ao alterar senha
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Sessões ativas > deve listar sessões ativas
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Sessões ativas > deve listar sessões ativas
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Estatísticas pessoais > deve obter estatísticas do perfil
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/intrusion-detection.test.ts > Intrusion Detection System > detectImpossibleTravel > should detect impossible travel
[IDS] Impossible travel detection error: TypeError: geolocationService.getLocationSummary is not a function
    at IntrusionDetector.detectImpossibleTravel (/home/fabricio/projects/morinalight/apps/web/src/lib/security/intrusion-detection.ts:120:67)
    at /home/fabricio/projects/morinalight/apps/web/src/__tests__/intrusion-detection.test.ts:50:13
    at file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+runner@2.1.9/node_modules/@vitest/runner/dist/index.js:533:5
    at runTest (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+runner@2.1.9/node_modules/@vitest/runner/dist/index.js:1056:11)
    at runSuite (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+runner@2.1.9/node_modules/@vitest/runner/dist/index.js:1205:15)
    at runSuite (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+runner@2.1.9/node_modules/@vitest/runner/dist/index.js:1205:15)
    at runSuite (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+runner@2.1.9/node_modules/@vitest/runner/dist/index.js:1205:15)
    at runFiles (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+runner@2.1.9/node_modules/@vitest/runner/dist/index.js:1262:5)
    at startTests (file:///home/fabricio/projects/morinalight/node_modules/.pnpm/@vitest+runner@2.1.9/node_modules/@vitest/runner/dist/index.js:1271:3)
    at file:///home/fabricio/projects/morinalight/node_modules/.pnpm/vitest@2.1.9_@types+node@20.19.27_happy-dom@16.8.1_lightningcss@1.30.2_terser@5.44.1/node_modules/vitest/dist/chunks/runBaseTests.3qpJUEJM.js:126:11

stdout | src/__tests__/middleware.test.ts > Security Middleware > authMiddleware > should allow requests with valid JWT
{"level":"warn","message":"Missing auth token","timestamp":"2026-01-06T21:53:37.748Z","context":{},"metadata":{"path":"/api/test"}}

stdout | src/__tests__/middleware.test.ts > Security Middleware > authMiddleware > should reject requests without token
{"level":"warn","message":"Missing auth token","timestamp":"2026-01-06T21:53:37.781Z","context":{},"metadata":{"path":"/api/test"}}

stdout | ../../Logger.log (/home/fabricio/projects/morinalight/apps/web/src/lib/observability/logger.tsx:157:21)
{"level":"info","message":"Redis rate limiter initialized","timestamp":"2026-01-06T21:53:37.821Z","context":{}}

stderr | src/__tests__/integration/permissions.test.ts > Permissions Integration > GET /api/users/:userId/permissions > deve retornar permissões do usuário
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/permissions.test.ts > Permissions Integration > GET /api/users/:userId/permissions/check > deve verificar permissão específica
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stdout | src/lib/patterns/__tests__/integration.test.ts > PaymentService Legacy Integration > should process payment using legacy adapter strategy
[Legacy System] Processing payment: 500 BRL for user system-user

stderr | src/__tests__/integration/logout.test.ts > Logout Integration > Fluxo: Logout simples > deve fazer logout do usuário atual
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/logout.test.ts > Logout Integration > Fluxo: Logout de todos os dispositivos > deve fazer logout de todos os dispositivos
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stderr | src/__tests__/integration/logout.test.ts > Logout Integration > Fluxo: Logout de sessão específica > deve fazer logout de uma sessão específica
AggregateError: 
    at internalConnectMultiple (node:net:1134:18)
    at afterConnectMultiple (node:net:1715:7) {
  code: 'ECONNREFUSED',
  [errors]: [
    Error: connect ECONNREFUSED ::1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '::1',
      port: 3333
    },
    Error: connect ECONNREFUSED 127.0.0.1:3333
        at createConnectionError (node:net:1678:14)
        at afterConnectMultiple (node:net:1708:16) {
      errno: -111,
      code: 'ECONNREFUSED',
      syscall: 'connect',
      address: '127.0.0.1',
      port: 3333
    }
  ]
}

stdout | src/components/login-form.spec.tsx
[Event Handlers] All domain event handlers registered

   ❯ Logout Integration (3)
     ❯ Fluxo: Logout simples (1)
       × deve fazer logout do usuário atual
     ❯ Fluxo: Logout de todos os dispositivos (1)
       × deve fazer logout de todos os dispositivos
     ❯ Fluxo: Logout de sessão específica (1)
       × deve fazer logout de uma sessão específica
 ❯ |web| src/hooks/use-throttle.test.ts (4)
   ❯ useThrottle (4)
     × should call function immediately on first call
     × should throttle function calls
     × should pass arguments correctly
     × should handle multiple rapid calls
 ❯ |web| src/components/login-form.spec.tsx (2)
   ❯ LoginForm (2)
     × exibe mensagens de erro para credenciais inválidas
     × chama onAuthenticate quando dados são válidos
 ✓ |web| src/components/ui/ErrorState.test.tsx (5)
 ✓ |@morina/ui| src/components/templates/list-page-layout.test.tsx (3)
 ✓ |@morina/ui| src/components/bulk-actions-bar/bulk-actions-bar.test.tsx (4)
 ❯ |web| src/components/ui/EmptyState.test.tsx (4)
   ❯ EmptyState (4)
 ❯ |@morina/catalogo-application| tests/approve-product.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/atualizar-produto.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/create-product.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/criar-categoria.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/criar-variante.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/get-product.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/list-audit-feed.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/list-products.use-case.test.ts (0)
 ❯ |@morina/catalogo-application| tests/reject-product.use-case.test.ts (0)
 ❯ |@morina/shared-kernel| src/authorization/advanced/__tests__/abac-integration.test.ts (0)
 ✓ |@morina/ui| src/components/button.test.tsx (4)
 ✓ |@morina/ui| src/components/glass-card.test.tsx (2)
 ✓ |@morina/ui| src/components/input.test.tsx (2)
 ✓ |@morina/ui| src/components/bulk-actions-bar/bulk-actions-bar.test.tsx (4)
 ✓ |@morina/ui| src/components/templates/list-page-layout.test.tsx (3)
 ✓ |@morina/api| tests/env.test.ts (1)
 ❯ |@morina/api| tests/auth/auth.routes.test.ts (0)
 ❯ |@morina/api| tests/catalogo/catalog-advanced.route.test.ts (0)
 ❯ |@morina/api| tests/catalogo/create-product.route.test.ts (0)
 ❯ |@morina/api| tests/clientes/clientes.route.test.ts (0)
 ✓ |@morina/api| tests/clientes/criar-cliente.use-case.test.ts (3)
 ❯ |@morina/api| tests/clientes/criar-representante.use-case.test.ts (3)
   ❯ CriarRepresentanteUseCase (3)
     × deve criar um representante vinculado a um cliente
     × não deve criar representante para cliente inexistente
     × não deve permitir criar dois representantes para o mesmo cliente
 ❯ |@morina/api| tests/company/company-settings.route.test.ts (0)
 ❯ |@morina/api| tests/contracts/company-settings.contract.test.ts (0)
 ❯ |@morina/api| tests/organizations/invites.route.test.ts (0)
 ❯ |@morina/api| tests/organizations/list-organizations.route.test.ts (0)
 ❯ |@morina/api| tests/organizations/members.route.test.ts (0)
 ❯ |@morina/api| tests/permissions/permissions.route.test.ts (0)
 ✓ |@morina/api| tests/permissions/permissions.use-case.test.ts (8)
 ❯ |@morina/api| tests/preficha/preficha-isolation.test.ts (0)
 ❯ |@morina/api| tests/realtime/token.route.test.ts (0)
 ❯ |@morina/api| tests/tenant/tenant-isolation.test.ts (0)
 ✓ |@morina/api| src/lib/governance/tests/engine.spec.ts (4)
 ✓ |@morina/api| src/lib/siem/tests/siem-exporter.spec.ts (3)
 ✓ |@morina/api| src/modules/security/tests/blocked-ip.integration.spec.ts (3)
 ❯ |web| src/__tests__/accessibility.test.ts (0)
 ❯ |web| src/__tests__/encryption.test.ts (9)
   ❯ Encryption Service (9)
     ❯ encrypt/decrypt (6)
       × should encrypt and decrypt data correctly
       × should produce different ciphertexts for same plaintext
       × should handle empty strings
       × should handle special characters
       × should handle unicode characters
       ✓ should throw on invalid encrypted data
     ❯ hash (3)
       × should create consistent hashes
       × should create different hashes for different data
       × should create fixed-length hashes
 ✓ |web| src/__tests__/intrusion-detection.test.ts (4)
 ✓ |web| src/__tests__/mfa.test.ts (11)
 ❯ |web| src/__tests__/middleware.test.ts (4)
   ❯ Security Middleware (4)
     ❯ authMiddleware (2)
       × should allow requests with valid JWT
       ✓ should reject requests without token
     ❯ rateLimitMiddleware (2)
       ✓ should allow requests within rate limit
       × should block requests exceeding rate limit
 ✓ |web| src/__tests__/recovery-flow.test.ts (4)
 ✓ |web| src/__tests__/security.test.ts (24) 1856ms
 ❯ |web| src/components/login-form.spec.tsx (2)
   ❯ LoginForm (2)
     × exibe mensagens de erro para credenciais inválidas
     × chama onAuthenticate quando dados são válidos
 ✓ |web| src/components/project-overview.spec.tsx (1)
 ✓ |web| src/hooks/use-debounce.test.ts (4)
 ✓ |web| src/hooks/use-theme-engine.spec.ts (6)
 ❯ |web| src/hooks/use-throttle.test.ts (4)
   ❯ useThrottle (4)
     × should call function immediately on first call
     × should throttle function calls
     × should pass arguments correctly
     × should handle multiple rapid calls
 ✓ |web| src/schemas/company-settings.spec.ts (4)
 ❯ |web| src/__tests__/integration/logout.test.ts (3)
   ❯ Logout Integration (3)
     ❯ Fluxo: Logout simples (1)
       × deve fazer logout do usuário atual
     ❯ Fluxo: Logout de todos os dispositivos (1)
       × deve fazer logout de todos os dispositivos
     ❯ Fluxo: Logout de sessão específica (1)
       × deve fazer logout de uma sessão específica
 ❯ |web| src/__tests__/integration/notifications.test.ts (6)
   ❯ Notifications Integration (6)
     ❯ Fluxo completo: Criar e gerenciar notificação (4)
       × deve criar uma nova notificação
       ✓ deve marcar notificação como lida
       × deve obter estatísticas de notificações
       × deve marcar todas as notificações como lidas
     ❯ Fluxo: Preferências de notificação (2)
       × deve obter preferências de notificação
       × deve atualizar preferências de notificação
 ❯ |web| src/__tests__/integration/permissions.test.ts (2)
   ❯ Permissions Integration (2)
     ❯ GET /api/users/:userId/permissions (1)
       × deve retornar permissões do usuário
     ❯ GET /api/users/:userId/permissions/check (1)
       × deve verificar permissão específica
 ❯ |web| src/__tests__/integration/profile.test.ts (5)
   ❯ Profile Integration (5)
     ❯ Fluxo: Obter perfil do usuário (1)
       × deve obter perfil do usuário autenticado
     ❯ Fluxo: Atualizar perfil (1)
       × deve atualizar dados do perfil
     ❯ Fluxo: Alterar senha (1)
       × deve validar senha atual ao alterar senha
     ❯ Fluxo: Sessões ativas (1)
       × deve listar sessões ativas
     ❯ Fluxo: Estatísticas pessoais (1)
       × deve obter estatísticas do perfil
 ❯ |web| src/__tests__/integration/users.test.ts (6)
   ❯ Users Integration (6)
     ❯ Fluxo completo: Criar usuário (2)
       × deve criar um novo usuário com sucesso
       × deve validar CPF inválido ao criar usuário
     ✓ Fluxo completo: Editar usuário (1)
     ✓ Fluxo completo: Excluir usuário (1)
     ❯ Fluxo: Importação em massa (1)
       × deve validar formato de arquivo CSV
     ❯ Fluxo: Exportação (1)
       × deve exportar lista de usuários
 ✓ |web| src/components/catalogo/audit-timeline.test.ts (1)
 · |web| src/components/settings/PersonalizationPanel.spec.tsx (8)
 ❯ |web| src/components/ui/EmptyState.test.tsx (4)
   ❯ EmptyState (4)
     ✓ should render with title and description
     × should render with icon
     ✓ should render action button when provided
     ✓ should apply custom className
 ✓ |web| src/components/ui/ErrorState.test.tsx (5)
 ✓ |web| src/components/ui/LoadingState.test.tsx (5)
 ❯ |web| src/components/ui/accessible-button.test.tsx (0)
 ❯ |web| src/hooks/queries/use-users.test.tsx (0)
 ✓ |web| src/lib/api/factory.test.ts (8)
 ❯ |web| src/lib/auth/ability.test.ts (0)
 ❯ |web| src/lib/errors/error-handling.test.ts (10)
   ❯ parseError (4)
     ✓ should parse AppError correctly
     ✓ should parse generic Error
     ✓ should parse unknown error
     × should parse network error
   ✓ getUserFriendlyMessage (3)
   ✓ AppError (3)
 ❯ |web| src/lib/validators/brazilian.test.ts (20)
   ❯ Brazilian Validators (20)
     ✓ CPF (3)
     ✓ CNPJ (3)
     ✓ CEP (3)
     ❯ Phone (3)
       ✓ should validate correct phone numbers
       × should reject invalid phone numbers
       ✓ should format phone correctly
     ✓ Email (2)
     ❯ Date (3)
       ✓ should validate correct dates
       ✓ should reject invalid dates
       × should format date correctly
     ✓ Password Strength (3)
 ✓ |web| src/lib/ai/__tests__/organizational-suggestions.test.ts (11)
 ✓ |web| src/lib/patterns/__tests__/command-pattern.test.ts (9)
 ✓ |web| src/lib/patterns/__tests__/integration.test.ts (4)
 ✓ |web| src/lib/patterns/__tests__/patterns.test.ts (8)
 ✓ |web| src/lib/patterns/__tests__/payment-strategy.test.ts (8)
 ✓ |web| src/lib/patterns/__tests__/query-builder.test.ts (20)
 ✓ |web| src/lib/permissions/__tests__/conditional-permissions.test.ts (20)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 27 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL |@morina/catalogo-application|  tests/approve-product.use-case.test.ts [ packages/catalogo-application/tests/approve-product.use-case.test.ts ]
 FAIL |@morina/catalogo-application|  tests/atualizar-produto.use-case.test.ts [ packages/catalogo-application/tests/atualizar-produto.use-case.test.ts ]
 FAIL |@morina/catalogo-application|  tests/criar-variante.use-case.test.ts [ packages/catalogo-application/tests/criar-variante.use-case.test.ts ]
 FAIL |@morina/catalogo-application|  tests/get-product.use-case.test.ts [ packages/catalogo-application/tests/get-product.use-case.test.ts ]
 FAIL |@morina/catalogo-application|  tests/list-audit-feed.use-case.test.ts [ packages/catalogo-application/tests/list-audit-feed.use-case.test.ts ]
 FAIL |@morina/catalogo-application|  tests/list-products.use-case.test.ts [ packages/catalogo-application/tests/list-products.use-case.test.ts ]
 FAIL |@morina/catalogo-application|  tests/reject-product.use-case.test.ts [ packages/catalogo-application/tests/reject-product.use-case.test.ts ]
ReferenceError: exports is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and '/home/fabricio/projects/morinalight/packages/catalogo-domain/package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
 ❯ ../catalogo-domain/src/value-objects/category-id.js:2:23
      1| "use strict";
      2| Object.defineProperty(exports, "__esModule", { value: true });
       |                       ^
      3| exports.CategoryId = void 0;
      4| class CategoryId {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/69]⎯

 FAIL |@morina/catalogo-application|  tests/create-product.use-case.test.ts [ packages/catalogo-application/tests/create-product.use-case.test.ts ]
 FAIL |@morina/catalogo-application|  tests/criar-categoria.use-case.test.ts [ packages/catalogo-application/tests/criar-categoria.use-case.test.ts ]
ReferenceError: exports is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and '/home/fabricio/projects/morinalight/packages/catalogo-domain/package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
 ❯ ../catalogo-domain/dist/index.js:16:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/69]⎯

 FAIL |@morina/shared-kernel|  src/authorization/advanced/__tests__/abac-integration.test.ts [ packages/shared-kernel/src/authorization/advanced/__tests__/abac-integration.test.ts ]
ReferenceError: exports is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and '/home/fabricio/projects/morinalight/packages/shared-kernel/package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
 ❯ src/authorization/advanced/policy-compiler.js:2:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/69]⎯

 FAIL |@morina/api|  tests/auth/auth.routes.test.ts [ apps/api/tests/auth/auth.routes.test.ts ]
 FAIL |@morina/api|  tests/clientes/clientes.route.test.ts [ apps/api/tests/clientes/clientes.route.test.ts ]
 FAIL |@morina/api|  tests/company/company-settings.route.test.ts [ apps/api/tests/company/company-settings.route.test.ts ]
 FAIL |@morina/api|  tests/contracts/company-settings.contract.test.ts [ apps/api/tests/contracts/company-settings.contract.test.ts ]
 FAIL |@morina/api|  tests/organizations/invites.route.test.ts [ apps/api/tests/organizations/invites.route.test.ts ]
 FAIL |@morina/api|  tests/organizations/list-organizations.route.test.ts [ apps/api/tests/organizations/list-organizations.route.test.ts ]
 FAIL |@morina/api|  tests/organizations/members.route.test.ts [ apps/api/tests/organizations/members.route.test.ts ]
 FAIL |@morina/api|  tests/permissions/permissions.route.test.ts [ apps/api/tests/permissions/permissions.route.test.ts ]
 FAIL |@morina/api|  tests/preficha/preficha-isolation.test.ts [ apps/api/tests/preficha/preficha-isolation.test.ts ]
 FAIL |@morina/api|  tests/realtime/token.route.test.ts [ apps/api/tests/realtime/token.route.test.ts ]
ReferenceError: exports is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and '/home/fabricio/projects/morinalight/packages/catalogo-application/package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
 ❯ ../../packages/catalogo-application/src/schemas/product.js:2:23


⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/69]⎯

 FAIL |@morina/api|  tests/catalogo/catalog-advanced.route.test.ts [ apps/api/tests/catalogo/catalog-advanced.route.test.ts ]
 FAIL |@morina/api|  tests/catalogo/create-product.route.test.ts [ apps/api/tests/catalogo/create-product.route.test.ts ]
 FAIL |@morina/api|  tests/tenant/tenant-isolation.test.ts [ apps/api/tests/tenant/tenant-isolation.test.ts ]
ReferenceError: exports is not defined in ES module scope
This file is being treated as an ES module because it has a '.js' file extension and '/home/fabricio/projects/morinalight/packages/catalogo-domain/package.json' contains "type": "module". To treat it as a CommonJS script, rename it to use the '.cjs' file extension.
 ❯ ../../packages/catalogo-domain/src/value-objects/category-id.js:2:23
      1| "use strict";
      2| Object.defineProperty(exports, "__esModule", { value: true });
       |                       ^
      3| exports.CategoryId = void 0;
      4| class CategoryId {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/69]⎯

 FAIL |web|  src/__tests__/accessibility.test.ts [ apps/web/src/__tests__/accessibility.test.ts ]
Error: Playwright Test did not expect test.describe() to be called here.
Most common reasons include:
- You are calling test.describe() in a configuration file.
- You are calling test.describe() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test. This usually happens
  when one of the dependencies in your package.json depends on @playwright/test.
 ❯ TestTypeImpl._currentSuite ../../node_modules/.pnpm/playwright@1.57.0/node_modules/playwright/lib/common/testType.js:75:13
 ❯ TestTypeImpl._describe ../../node_modules/.pnpm/playwright@1.57.0/node_modules/playwright/lib/common/testType.js:115:24
 ❯ Function.describe ../../node_modules/.pnpm/playwright@1.57.0/node_modules/playwright/lib/transform/transform.js:275:12
 ❯ src/__tests__/accessibility.test.ts:13:6
     11|  * Teste de acessibilidade para página de login
     12|  */
     13| test.describe("Accessibility - Login Page", () => {
       |      ^
     14|     test("should not have any automatically detectable accessibility issues", async ({
     15|         page,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/69]⎯

 FAIL |web|  src/components/ui/accessible-button.test.tsx [ apps/web/src/components/ui/accessible-button.test.tsx ]
Error: Failed to resolve import "vitest-axe" from "apps/web/src/components/ui/accessible-button.test.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: /home/fabricio/projects/morinalight/apps/web/src/components/ui/accessible-button.test.tsx:4:40
  2  |  import { render } from "@testing-library/react";
  3  |  import { describe, it, expect } from "vitest";
  4  |  import { axe, toHaveNoViolations } from "vitest-axe";
     |                                           ^
  5  |  import { AccessibleButton } from "./accessible-button";
  6  |  expect.extend(toHaveNoViolations);
 ❯ TransformPluginContext._formatError ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41
 ❯ TransformPluginContext.error ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16
 ❯ normalizeUrl ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23
 ❯ ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39
 ❯ TransformPluginContext.transform ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7
 ❯ PluginContainer.transform ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18
 ❯ loadAndTransform ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/69]⎯

 FAIL |web|  src/hooks/queries/use-users.test.tsx [ apps/web/src/hooks/queries/use-users.test.tsx ]
Error: Failed to resolve import "../utils" from "apps/web/src/hooks/queries/use-users.test.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: /home/fabricio/projects/morinalight/apps/web/src/hooks/queries/use-users.test.tsx:14:38
  12 |  const __vi_import_3__ = await import('@/hooks/queries/use-users')
  13 |  const __vi_import_4__ = await import('@/lib/api/base')
  14 |  const __vi_import_5__ = await import('../utils')
     |                                       ^
  15 |  
  16 |  import { describe, it, expect, beforeEach, vi } from "vitest";
 ❯ TransformPluginContext._formatError ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49258:41
 ❯ TransformPluginContext.error ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49253:16
 ❯ normalizeUrl ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64307:23
 ❯ ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64439:39
 ❯ TransformPluginContext.transform ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:64366:7
 ❯ PluginContainer.transform ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:49099:18
 ❯ loadAndTransform ../../node_modules/.pnpm/vite@5.4.21_@types+node@20.19.27_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51978:27

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/69]⎯

 FAIL |web|  src/lib/auth/ability.test.ts [ apps/web/src/lib/auth/ability.test.ts ]
Error: Cannot find module './events/domain-event'
Require stack:
- /home/fabricio/projects/morinalight/packages/shared-kernel/dist/index.js
 ❯ ../../packages/shared-kernel/dist/index.js:17:14
     15| };
     16| Object.defineProperty(exports, "__esModule", { value: true });
     17| __exportStar(require("./events/domain-event"), exports);
       |              ^
     18| __exportStar(require("./authorization/types"), exports);
     19| __exportStar(require("./authorization/advanced/types"), exports);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/69]⎯

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 42 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL |@morina/api|  tests/clientes/criar-representante.use-case.test.ts > CriarRepresentanteUseCase > deve criar um representante vinculado a um cliente
Error: ClienteId inválido
 ❯ new ClienteId src/modules/clientes/domain/value-objects/cliente-id.ts:4:13
      2|   private constructor(private readonly value: string) {
      3|     if (!value || !this.isValid(value)) {
      4|       throw new Error("ClienteId inválido");
       |             ^
      5|     }
      6|   }
 ❯ Function.from src/modules/clientes/domain/value-objects/cliente-id.ts:15:14
 ❯ Function.restaurar src/modules/clientes/domain/entities/cliente.ts:62:48
 ❯ tests/clientes/criar-representante.use-case.test.ts:80:29

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/69]⎯

 FAIL |@morina/api|  tests/clientes/criar-representante.use-case.test.ts > CriarRepresentanteUseCase > não deve criar representante para cliente inexistente
AssertionError: expected [Function] to throw error including 'não encontrado' but got '[\n  {\n    "validation": "uuid",\n  …'

- Expected
+ Received

- não encontrado
+ [
+   {
+     "validation": "uuid",
+     "code": "invalid_string",
+     "message": "Invalid uuid",
+     "path": [
+       "clienteId"
+     ]
+   }
+ ]

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/69]⎯

 FAIL |@morina/api|  tests/clientes/criar-representante.use-case.test.ts > CriarRepresentanteUseCase > não deve permitir criar dois representantes para o mesmo cliente
Error: ClienteId inválido
 ❯ new ClienteId src/modules/clientes/domain/value-objects/cliente-id.ts:4:13
      2|   private constructor(private readonly value: string) {
      3|     if (!value || !this.isValid(value)) {
      4|       throw new Error("ClienteId inválido");
       |             ^
      5|     }
      6|   }
 ❯ Function.from src/modules/clientes/domain/value-objects/cliente-id.ts:15:14
 ❯ Function.restaurar src/modules/clientes/domain/entities/cliente.ts:62:48
 ❯ tests/clientes/criar-representante.use-case.test.ts:131:29

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > encrypt/decrypt > should encrypt and decrypt data correctly
TypeError: Cannot read properties of undefined (reading 'encrypt')
 ❯ src/__tests__/encryption.test.ts:9:49
      7|     describe('encrypt/decrypt', () => {
      8|         it('should encrypt and decrypt data correctly', () => {
      9|             const encrypted = encryptionService.encrypt(testData);
       |                                                 ^
     10|             expect(encrypted).not.toBe(testData);
     11|             expect(encrypted).toContain(':'); // Format: iv:authTag:encrypted

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > encrypt/decrypt > should produce different ciphertexts for same plaintext
TypeError: Cannot read properties of undefined (reading 'encrypt')
 ❯ src/__tests__/encryption.test.ts:18:50
     16| 
     17|         it('should produce different ciphertexts for same plaintext', () => {
     18|             const encrypted1 = encryptionService.encrypt(testData);
       |                                                  ^
     19|             const encrypted2 = encryptionService.encrypt(testData);
     20| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > encrypt/decrypt > should handle empty strings
TypeError: Cannot read properties of undefined (reading 'encrypt')
 ❯ src/__tests__/encryption.test.ts:29:49
     27| 
     28|         it('should handle empty strings', () => {
     29|             const encrypted = encryptionService.encrypt('');
       |                                                 ^
     30|             const decrypted = encryptionService.decrypt(encrypted);
     31|             expect(decrypted).toBe('');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > encrypt/decrypt > should handle special characters
TypeError: Cannot read properties of undefined (reading 'encrypt')
 ❯ src/__tests__/encryption.test.ts:36:49
     34|         it('should handle special characters', () => {
     35|             const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
     36|             const encrypted = encryptionService.encrypt(specialData);
       |                                                 ^
     37|             const decrypted = encryptionService.decrypt(encrypted);
     38|             expect(decrypted).toBe(specialData);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > encrypt/decrypt > should handle unicode characters
TypeError: Cannot read properties of undefined (reading 'encrypt')
 ❯ src/__tests__/encryption.test.ts:43:49
     41|         it('should handle unicode characters', () => {
     42|             const unicodeData = '你好世界 🌍 مرحبا';
     43|             const encrypted = encryptionService.encrypt(unicodeData);
       |                                                 ^
     44|             const decrypted = encryptionService.decrypt(encrypted);
     45|             expect(decrypted).toBe(unicodeData);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > hash > should create consistent hashes
TypeError: Cannot read properties of undefined (reading 'hash')
 ❯ src/__tests__/encryption.test.ts:56:45
     54|     describe('hash', () => {
     55|         it('should create consistent hashes', () => {
     56|             const hash1 = encryptionService.hash(testData);
       |                                             ^
     57|             const hash2 = encryptionService.hash(testData);
     58|             expect(hash1).toBe(hash2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > hash > should create different hashes for different data
TypeError: Cannot read properties of undefined (reading 'hash')
 ❯ src/__tests__/encryption.test.ts:62:45
     60| 
     61|         it('should create different hashes for different data', () => {
     62|             const hash1 = encryptionService.hash('data1');
       |                                             ^
     63|             const hash2 = encryptionService.hash('data2');
     64|             expect(hash1).not.toBe(hash2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/69]⎯

 FAIL |web|  src/__tests__/encryption.test.ts > Encryption Service > hash > should create fixed-length hashes
TypeError: Cannot read properties of undefined (reading 'hash')
 ❯ src/__tests__/encryption.test.ts:68:44
     66| 
     67|         it('should create fixed-length hashes', () => {
     68|             const hash = encryptionService.hash(testData);
       |                                            ^
     69|             expect(hash.length).toBe(64); // SHA-256 hex = 64 chars
     70|         });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/69]⎯

 FAIL |web|  src/__tests__/middleware.test.ts > Security Middleware > authMiddleware > should allow requests with valid JWT
AssertionError: expected Response{ …(9), …(3) } to be null

- Expected: 
null

+ Received: 
NextResponse {
  "body": ReadableStream {
    Symbol(kType): "ReadableStream",
    Symbol(kState): Object {
      "controller": ReadableStreamDefaultController {
        Symbol(kType): "ReadableStreamDefaultController",
        Symbol(kState): Object {
          "cancelAlgorithm": [Function nonOpCancel],
          "closeRequested": true,
          "highWaterMark": 1,
          "pullAgain": false,
          "pullAlgorithm": [Function nonOpPull],
          "pulling": false,
          "queue": Array [
            Object {
              "size": 1,
              "value": Buffer [
                123,
                34,
                101,
                114,
                114,
                111,
                114,
                34,
                58,
                34,
                85,
                110,
                97,
                117,
                116,
                104,
                111,
                114,
                105,
                122,
                101,
                100,
                32,
                45,
                32,
                77,
                105,
                115,
                115,
                105,
                110,
                103,
                32,
                116,
                111,
                107,
                101,
                110,
                34,
                125,
              ],
            },
          ],
          "queueTotalSize": 1,
          "sizeAlgorithm": [Function anonymous],
          "started": true,
          "stream": [Circular],
        },
      },
      "disturbed": false,
      "reader": undefined,
      "state": "readable",
      "storedError": undefined,
      "transfer": Object {
        "port1": undefined,
        "port2": undefined,
        "promise": undefined,
        "writable": undefined,
      },
    },
    Symbol(nodejs.webstream.isClosedPromise): Object {
      "promise": Promise {},
      "reject": [Function anonymous],
      "resolve": [Function anonymous],
    },
    Symbol(nodejs.webstream.controllerErrorFunction): [Function bound error],
  },
  "bodyUsed": false,
  "headers": Headers {
    Symbol(entries): Object {
      "content-type": Object {
        "name": "Content-Type",
        "value": Array [
          "application/json",
        ],
      },
    },
  },
  "ok": false,
  "redirected": false,
  "status": 401,
  "statusText": "",
  "type": "basic",
  "url": "",
  Symbol(cachedResponse): null,
  Symbol(buffer): null,
  Symbol(internal response): Object {
    "cookies": bound ResponseCookies {
      "_headers": Headers {
        Symbol(entries): Object {
          "content-type": Object {
            "name": "Content-Type",
            "value": Array [
              "application/json",
            ],
          },
        },
      },
      "_parsed": Map {},
    },
    "url": undefined,
  },
}

 ❯ src/__tests__/middleware.test.ts:21:28
     19|             const middleware = authMiddleware();
     20|             const result = await middleware(mockRequest, {});
     21|             expect(result).toBeNull(); // No response = middleware passed
       |                            ^
     22|         });
     23| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/69]⎯

 FAIL |web|  src/__tests__/middleware.test.ts > Security Middleware > rateLimitMiddleware > should block requests exceeding rate limit
AssertionError: expected null to be truthy

- Expected: 
true

+ Received: 
null

 ❯ src/__tests__/middleware.test.ts:65:28
     63| 
     64|             const result = await middleware(mockRequest, {});
     65|             expect(result).toBeTruthy();
       |                            ^
     66|             expect(result?.status).toBe(429);
     67|         });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/69]⎯

 FAIL |web|  src/components/login-form.spec.tsx > LoginForm > exibe mensagens de erro para credenciais inválidas
 FAIL |web|  src/components/login-form.spec.tsx > LoginForm > chama onAuthenticate quando dados são válidos
Error: invariant expected app router to be mounted
 ❯ Proxy.useRouter ../../node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_@opentelemetry+api@1.9.0_@playwright+test@1.57.0_react-d_4704967f54d8f24c6c842d3850fb4620/node_modules/next/src/client/components/navigation.ts:149:11
 ❯ LoginForm src/components/login-form.tsx:45:18
     43| 
     44| export function LoginForm({ onAuthenticate, onNotice, onDismissNotice }: LoginFormProps) {
     45|   const router = useRouter();
       |                  ^
     46|   const { emit } = useEventBus();
     47|   const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
 ❯ Object.react_stack_bottom_frame ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:25904:20
 ❯ renderWithHooks ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:7662:22
 ❯ updateFunctionComponent ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:10166:19
 ❯ beginWork ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:11778:18
 ❯ runWithFiberInDEV ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:874:13
 ❯ performUnitOfWork ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:17641:22
 ❯ workLoopSync ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:17469:41
 ❯ renderRootSync ../../node_modules/.pnpm/react-dom@19.2.0_react@19.2.0/node_modules/react-dom/cjs/react-dom-client.development.js:17450:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[23/69]⎯

 FAIL |web|  src/hooks/use-throttle.test.ts > useThrottle > should call function immediately on first call
AssertionError: expected "spy" to be called 1 times, but got 0 times
 ❯ src/hooks/use-throttle.test.ts:22:20
     20|     });
     21| 
     22|     expect(mockFn).toHaveBeenCalledTimes(1);
       |                    ^
     23|   });
     24| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[24/69]⎯

 FAIL |web|  src/hooks/use-throttle.test.ts > useThrottle > should throttle function calls
AssertionError: expected "spy" to be called 1 times, but got 0 times
 ❯ src/hooks/use-throttle.test.ts:33:20
     31|       result.current();
     32|     });
     33|     expect(mockFn).toHaveBeenCalledTimes(1);
       |                    ^
     34| 
     35|     // Second call immediately (should be throttled)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[25/69]⎯

 FAIL |web|  src/hooks/use-throttle.test.ts > useThrottle > should pass arguments correctly
AssertionError: expected "spy" to be called with arguments: [ 'arg1', 'arg2' ]

Received: 



Number of calls: 0

 ❯ src/hooks/use-throttle.test.ts:58:20
     56|     });
     57| 
     58|     expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");
       |                    ^
     59|   });
     60| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[26/69]⎯

 FAIL |web|  src/hooks/use-throttle.test.ts > useThrottle > should handle multiple rapid calls
AssertionError: expected "spy" to be called 1 times, but got 0 times
 ❯ src/hooks/use-throttle.test.ts:72:20
     70|     });
     71| 
     72|     expect(mockFn).toHaveBeenCalledTimes(1);
       |                    ^
     73| 
     74|     act(() => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[27/69]⎯

 FAIL |web|  src/__tests__/integration/logout.test.ts > Logout Integration > Fluxo: Logout simples > deve fazer logout do usuário atual
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/auth/logout": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[28/69]⎯

 FAIL |web|  src/__tests__/integration/logout.test.ts > Logout Integration > Fluxo: Logout de todos os dispositivos > deve fazer logout de todos os dispositivos
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/auth/logout-all": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[29/69]⎯

 FAIL |web|  src/__tests__/integration/logout.test.ts > Logout Integration > Fluxo: Logout de sessão específica > deve fazer logout de uma sessão específica
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/auth/logout/test-session-id": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[30/69]⎯

 FAIL |web|  src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo completo: Criar e gerenciar notificação > deve criar uma nova notificação
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/notifications": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[31/69]⎯

 FAIL |web|  src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo completo: Criar e gerenciar notificação > deve obter estatísticas de notificações
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/notifications/stats": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[32/69]⎯

 FAIL |web|  src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo completo: Criar e gerenciar notificação > deve marcar todas as notificações como lidas
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/notifications/mark-all-read": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[33/69]⎯

 FAIL |web|  src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo: Preferências de notificação > deve obter preferências de notificação
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/notifications/preferences": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[34/69]⎯

 FAIL |web|  src/__tests__/integration/notifications.test.ts > Notifications Integration > Fluxo: Preferências de notificação > deve atualizar preferências de notificação
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/notifications/preferences": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[35/69]⎯

 FAIL |web|  src/__tests__/integration/permissions.test.ts > Permissions Integration > GET /api/users/:userId/permissions > deve retornar permissões do usuário
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/users/test-user-id/permissions": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[36/69]⎯

 FAIL |web|  src/__tests__/integration/permissions.test.ts > Permissions Integration > GET /api/users/:userId/permissions/check > deve verificar permissão específica
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/users/test-user-id/permissions/check?permission=products:view": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[37/69]⎯

 FAIL |web|  src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Obter perfil do usuário > deve obter perfil do usuário autenticado
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/profile": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[38/69]⎯

 FAIL |web|  src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Atualizar perfil > deve atualizar dados do perfil
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/profile": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39/69]⎯

 FAIL |web|  src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Alterar senha > deve validar senha atual ao alterar senha
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/profile/change-password": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[40/69]⎯

 FAIL |web|  src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Sessões ativas > deve listar sessões ativas
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/profile/sessions": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[41/69]⎯

 FAIL |web|  src/__tests__/integration/profile.test.ts > Profile Integration > Fluxo: Estatísticas pessoais > deve obter estatísticas do perfil
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/profile/stats": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[42/69]⎯

 FAIL |web|  src/__tests__/integration/users.test.ts > Users Integration > Fluxo completo: Criar usuário > deve criar um novo usuário com sucesso
 FAIL |web|  src/__tests__/integration/users.test.ts > Users Integration > Fluxo completo: Criar usuário > deve validar CPF inválido ao criar usuário
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/users": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[43/69]⎯

 FAIL |web|  src/__tests__/integration/users.test.ts > Users Integration > Fluxo: Importação em massa > deve validar formato de arquivo CSV
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/users/import": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[44/69]⎯

 FAIL |web|  src/__tests__/integration/users.test.ts > Users Integration > Fluxo: Exportação > deve exportar lista de usuários
NetworkError: Failed to execute "fetch()" on "Window" with URL "http://localhost:3333/users/export?format=csv": 
 ❯ Fetch.onError ../../node_modules/.pnpm/happy-dom@16.8.1/node_modules/happy-dom/src/fetch/Fetch.ts:601:4

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[45/69]⎯

 FAIL |web|  src/components/ui/EmptyState.test.tsx > EmptyState > should render with icon
TestingLibraryElementError: Unable to find an element with the role "img"

Here are the available roles:

  heading:

  Name "No users":
  <h3
    class="mb-2 text-lg font-semibold text-white"
  />

  --------------------------------------------------
  paragraph:

  Name "":
  <p
    class="mb-6 text-sm text-white/60"
  />

  --------------------------------------------------

Ignored nodes: comments, script, style
<body>
  <div>
    <div
      class="relative overflow-hidden bg-[color-mix(in_oklab,hsl(var(--surface))_82%,transparent_18%)] border border-[color-mix(in_oklab,hsl(var(--border))_60%,transparent_40%)] rounded-none transition-all duration-300 hover:shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.15)] before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent p-12 text-center"
    >
      <div
        class="pointer-events-none absolute inset-0"
      >
        <div
          class="absolute left-0 top-0 h-3 w-3 border-l border-t border-[hsl(var(--primary)/0.55)]"
        />
        <div
          class="absolute right-0 top-0 h-3 w-3 border-r border-t border-[hsl(var(--primary)/0.55)]"
        />
        <div
          class="absolute left-0 bottom-0 h-3 w-3 border-l border-b border-[hsl(var(--primary)/0.55)]"
        />
        <div
          class="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-[hsl(var(--primary)/0.55)]"
        />
        <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary))/0.06,transparent_45%),radial-gradient(circle_at_80%_60%,hsl(var(--accent))/0.06,transparent_50%)] opacity-80"
        />
      </div>
      <div
        class="mb-4 flex justify-center"
      >
        <div
          class="flex h-16 w-16 items-center justify-center rounded border border-white/10 bg-white/5"
        >
          <svg
            aria-hidden="true"
            class="lucide lucide-user h-8 w-8 text-white/40"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
            />
          </svg>
        </div>
      </div>
      <h3
        class="mb-2 text-lg font-semibold text-white"
      >
        No users
      </h3>
      <p
        class="mb-6 text-sm text-white/60"
      >
        No users found
      </p>
    </div>
  </div>
</body>
 ❯ Object.getElementError ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/config.js:37:19
 ❯ ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:76:38
 ❯ ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:52:17
 ❯ ../../node_modules/.pnpm/@testing-library+dom@10.4.1/node_modules/@testing-library/dom/dist/query-helpers.js:95:19
 ❯ src/components/ui/EmptyState.test.tsx:17:25
     15|     render(<EmptyState icon={User} title="No users" description="No users found" />);
     16| 
     17|     const icon = screen.getByRole("img", { hidden: true });
       |                         ^
     18|     expect(icon).toBeInTheDocument();
     19|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[46/69]⎯

 FAIL |web|  src/lib/errors/error-handling.test.ts > parseError > should parse network error
AssertionError: expected 'INTERNAL_ERROR' to be 'NETWORK_ERROR' // Object.is equality

Expected: "NETWORK_ERROR"
Received: "INTERNAL_ERROR"

 ❯ src/lib/errors/error-handling.test.ts:42:29
     40|         const parsed = parseError(error);
     41| 
     42|         expect(parsed.code).toBe(ErrorCode.NETWORK_ERROR);
       |                             ^
     43|     });
     44| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[47/69]⎯

 FAIL |web|  src/lib/validators/brazilian.test.ts > Brazilian Validators > Phone > should reject invalid phone numbers
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ src/lib/validators/brazilian.test.ts:80:43
     78|     it("should reject invalid phone numbers", () => {
     79|       expect(validatePhone("123")).toBe(false);
     80|       expect(validatePhone("1198765432")).toBe(false);
       |                                           ^
     81|     });
     82| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[48/69]⎯

 FAIL |web|  src/lib/validators/brazilian.test.ts > Brazilian Validators > Date > should format date correctly
AssertionError: expected '14/01/2024' to match /15\/01\/2024/01\

- Expected: 
/15\/01\/2024/

+ Received: 
"14/01/2024"

 ❯ src/lib/validators/brazilian.test.ts:116:32
    114|     it("should format date correctly", () => {
    115|       const date = new Date("2024-01-15");
    116|       expect(formatDate(date)).toMatch(/15\/01\/2024/);
       |                                ^
    117|     });
    118|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[49/69]⎯

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: Worker exited unexpectedly
 ❯ ChildProcess.onUnexpectedExit node_modules/.pnpm/tinypool@1.1.1/node_modules/tinypool/dist/index.js:118:30
 ❯ ChildProcess.emit node:events:531:35
 ❯ ChildProcess._handle.onexit node:internal/child_process:293:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 Test Files  40 failed | 30 passed (71)
      Tests  42 failed | 230 passed (280)
     Errors  1 error
   Start at  18:53:24
   Duration  544.27s (transform 4.86s, setup 6.03s, collect 65.79s, tests 4.96s, environment 19.76s, prepare 12.62s)

❌ Tests
🔍 FSD...
🔍 Validando FSD...

(node:134214) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/fabricio/projects/morinalight/scripts/validate-fsd.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/fabricio/projects/morinalight/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
✅ FSD válido!
✅ FSD

❌ FALHA CRÍTICA

 ELIFECYCLE  Command failed with exit code 1.
[fabricio@fedora]~/projects/morinalight% pnpm guard


> morinalight@ guard /home/fabricio/projects/morinalight
> tsx scripts/enterprise_guard.ts


🛡️  ENTERPRISE GUARD — INICIANDO AUDITORIA

✅ Root must be a pnpm + turborepo project
✅ Required governance files
❌ No framework leakage in shared packages
   ↳ packages/ui depende de frameworks (next). UI compartilhada NÃO pode conhecer framework.
❌ Zod version consistency
   ↳ Versões divergentes de zod detectadas: ^3.25.76, ^3.23.8, ^4.3.5. Padronização obrigatória.
✅ React version safety check
❌ Scripts must exist
   ↳ Scripts obrigatórios ausentes: type-check

⛔ Falhas críticas detectadas. Execução bloqueada.

 ELIFECYCLE  Command failed with exit code 1.
[fabricio@fedora]~/projects/morinalight% pnpm --filter @morina/ui why next

Legend: production dependency, optional only, dev only

@morina/ui@0.1.0 /home/fabricio/projects/morinalight/packages/ui (PRIVATE)

devDependencies:
next 16.0.1
[fabricio@fedora]~/projects/morinalight% pnpm remove next --filter @morina/ui

apps/web                                 |  WARN  deprecated @types/ioredis@5.0.0
apps/web                                 |  WARN  deprecated @types/qrcode.react@3.0.0
apps/web                                 |  WARN  deprecated next@16.0.1
apps/web                                 |  WARN  deprecated @types/node-cache@4.2.5
apps/api                                 |  WARN  deprecated @types/cookie@1.0.0
 WARN  9 deprecated subdependencies found: are-we-there-yet@2.0.0, fstream@1.0.12, gauge@3.0.2, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, npmlog@5.0.1, rimraf@2.7.1, rimraf@3.0.2
Progress: resolved 2164, reused 0, downloaded 0, added 0, done
 WARN  Issues with peer dependencies found
apps/api
└─┬ fastify-type-provider-zod 6.1.0
  └── ✕ unmet peer zod@>=4.1.5: found 3.25.76

apps/web
├─┬ react-diff-viewer-continued 3.4.0
│ ├── ✕ unmet peer react@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
│ └── ✕ unmet peer react-dom@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
└─┬ react-spring 10.0.3
  └─┬ @react-spring/zdog 10.0.3
    ├── ✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0
    └── ✕ unmet peer react-dom@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0

packages/ui
└─┬ @tanstack/zod-form-adapter 0.42.1
  └── ✕ unmet peer zod@^3.x: found 4.3.5
. prepare$ husky
└─ Done in 168ms
Done in 16.2s using pnpm v10.18.2
[fabricio@fedora]~/projects/morinalight% pnpm add zod@^4 -w

apps/web                                 |  WARN  deprecated @types/node-cache@4.2.5
apps/web                                 |  WARN  deprecated @types/qrcode.react@3.0.0
apps/web                                 |  WARN  deprecated @types/ioredis@5.0.0
apps/web                                 |  WARN  deprecated next@16.0.1
apps/api                                 |  WARN  deprecated @types/cookie@1.0.0
 WARN  9 deprecated subdependencies found: are-we-there-yet@2.0.0, fstream@1.0.12, gauge@3.0.2, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, npmlog@5.0.1, rimraf@2.7.1, rimraf@3.0.2
Progress: resolved 2164, reused 0, downloaded 0, added 0, done
 WARN  Issues with peer dependencies found
apps/api
└─┬ fastify-type-provider-zod 6.1.0
  └── ✕ unmet peer zod@>=4.1.5: found 3.25.76

apps/web
├─┬ react-diff-viewer-continued 3.4.0
│ ├── ✕ unmet peer react@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
│ └── ✕ unmet peer react-dom@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
└─┬ react-spring 10.0.3
  └─┬ @react-spring/zdog 10.0.3
    ├── ✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0
    └── ✕ unmet peer react-dom@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0

packages/ui
└─┬ @tanstack/zod-form-adapter 0.42.1
  └── ✕ unmet peer zod@^3.x: found 4.3.5

dependencies:
+ zod ^4.3.5

Already up to date
. prepare$ husky
└─ Done in 178ms
Done in 14.9s using pnpm v10.18.2
[fabricio@fedora]~/projects/morinalight% pnpm install

Scope: all 14 workspace projects
apps/api                                 |  WARN  deprecated @types/cookie@1.0.0
apps/web                                 |  WARN  deprecated @types/ioredis@5.0.0
apps/web                                 |  WARN  deprecated @types/node-cache@4.2.5
apps/web                                 |  WARN  deprecated @types/qrcode.react@3.0.0
apps/web                                 |  WARN  deprecated next@16.0.1
 WARN  9 deprecated subdependencies found: are-we-there-yet@2.0.0, fstream@1.0.12, gauge@3.0.2, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, npmlog@5.0.1, rimraf@2.7.1, rimraf@3.0.2
Packages: +75 -10
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++----------
Progress: resolved 2163, reused 1973, downloaded 0, added 6, done
. prepare$ husky
└─ Done in 176ms
 WARN  Issues with peer dependencies found
apps/web
├─┬ react-diff-viewer-continued 3.4.0
│ ├── ✕ unmet peer react@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
│ └── ✕ unmet peer react-dom@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
└─┬ react-spring 10.0.3
  └─┬ @react-spring/zdog 10.0.3
    ├── ✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0
    └── ✕ unmet peer react-dom@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: @sentry/cli.                                                      │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯

Done in 9.7s using pnpm v10.18.2
[fabricio@fedora]~/projects/morinalight% pnpm install

Scope: all 14 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: @sentry/cli.                                                      │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯

. prepare$ husky
└─ Done in 192ms
Done in 2s using pnpm v10.18.2
[fabricio@fedora]~/projects/morinalight% pnpm approve-builds

✔ Choose which packages to build (Press <space> to select, <a> to toggle all, <i> to invert selection) · @sentry/cli
✔ The next packages will now be built: @sentry/cli.
Do you approve? (y/N) · true
node_modules/.pnpm/@sentry+cli@2.58.4/node_modules/@sentry/cli: Running postinstall script, done in 244ms
[fabricio@fedora]~/projects/morinalight% pnpm guard


> morinalight@ guard /home/fabricio/projects/morinalight
> tsx scripts/enterprise_guard.ts


🛡️  ENTERPRISE GUARD — INICIANDO AUDITORIA

✅ Root must be a pnpm + turborepo project
✅ Required governance files
✅ No framework leakage in shared packages
❌ Zod version consistency
   ↳ Versões divergentes de zod detectadas: ^4.3.5, ^3.25.76, ^3.23.8. Padronização obrigatória.
✅ React version safety check
✅ Scripts must exist

⛔ Falhas críticas detectadas. Execução bloqueada.

 ELIFECYCLE  Command failed with exit code 1.
[fabricio@fedora]~/projects/morinalight% pnpm why zod

Legend: production dependency, optional only, dev only

morinalight /home/fabricio/projects/morinalight (PRIVATE)

dependencies:
zod 4.3.5

devDependencies:
morinalight link:
└── zod 4.3.5
[fabricio@fedora]~/projects/morinalight% 
[fabricio@fedora]~/projects/morinalight% pnpm install

Scope: all 14 workspace projects
apps/api                                 |  WARN  deprecated @types/cookie@1.0.0
apps/web                                 |  WARN  deprecated @types/ioredis@5.0.0
apps/web                                 |  WARN  deprecated @types/node-cache@4.2.5
apps/web                                 |  WARN  deprecated @types/qrcode.react@3.0.0
apps/web                                 |  WARN  deprecated next@16.0.1
 WARN  9 deprecated subdependencies found: are-we-there-yet@2.0.0, fstream@1.0.12, gauge@3.0.2, glob@7.2.3, inflight@1.0.6, lodash.isequal@4.5.0, npmlog@5.0.1, rimraf@2.7.1, rimraf@3.0.2
Already up to date
Progress: resolved 2163, reused 1973, downloaded 0, added 0, done
. prepare$ husky
└─ Done in 177ms
 WARN  Issues with peer dependencies found
apps/web
├─┬ react-diff-viewer-continued 3.4.0
│ ├── ✕ unmet peer react@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
│ └── ✕ unmet peer react-dom@"^15.3.0 || ^16.0.0 || ^17.0.0 || ^18.0.0": found 19.2.0
└─┬ react-spring 10.0.3
  └─┬ @react-spring/zdog 10.0.3
    ├── ✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0
    └── ✕ unmet peer react-dom@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.2.0
Done in 7.9s using pnpm v10.18.2
[fabricio@fedora]~/projects/morinalight% pnpm guard  


> morinalight@ guard /home/fabricio/projects/morinalight
> tsx scripts/enterprise_guard.ts


🛡️  ENTERPRISE GUARD — INICIANDO AUDITORIA

✅ Root must be a pnpm + turborepo project
✅ Required governance files
✅ No framework leakage in shared packages
✅ Zod version consistency
✅ React version safety check
✅ Scripts must exist

🎉 Auditoria concluída. Projeto em conformidade.

[fabricio@fedora]~/projects/morinalight% 
[fabricio@fedora]~/projects/morinalight% git add .github/workflows/enforcement.yml
git commit -m "ci: add enterprise guard as architectural gate"
git push
fatal: pathspec '.github/workflows/enforcement.yml' did not match any files
husky - DEPRECATED

Please remove the following two lines from .husky/pre-commit:

#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

They WILL FAIL in v10.0.0

🔍 Validando FSD...
🔍 Validando FSD...

(node:151539) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/fabricio/projects/morinalight/scripts/validate-fsd.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/fabricio/projects/morinalight/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
✅ FSD válido!
🔍 Type checking...

> morinalight@ type-check /home/fabricio/projects/morinalight
> tsc --noEmit

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:100:5 - error TS1131: Property or signature expected.

100     modelsT rained: number;
        ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:103:2 - error TS1109: Expression expected.

103 }> {
     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:104:12 - error TS1005: ',' expected.

104     console.log('🔄 Training ensemble models...');
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:104:50 - error TS1005: ',' expected.

104     console.log('🔄 Training ensemble models...');
                                                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:106:11 - error TS1005: ':' expected.

106     const trainingData = await this.collectTrainingData(orgId);
              ~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:106:63 - error TS1005: ',' expected.

106     const trainingData = await this.collectTrainingData(orgId);
                                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:11 - error TS1005: ':' expected.

107     const metrics: Record<string, ModelMetrics> = { };
              ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:18 - error TS1005: ',' expected.

107     const metrics: Record<string, ModelMetrics> = { };
                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:49 - error TS1005: '(' expected.

107     const metrics: Record<string, ModelMetrics> = { };
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:107:51 - error TS1136: Property assignment expected.

107     const metrics: Record<string, ModelMetrics> = { };
                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:143:3 - error TS1128: Declaration or statement expected.

143   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:3 - error TS1434: Unexpected keyword or identifier.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:35 - error TS1005: ',' expected.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:50 - error TS1005: ',' expected.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
                                                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:148:59 - error TS1005: ';' expected.

148   async predictWithEnsemble(userId: string, orgId: string): Promise < EnsemblePrediction > {
                                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:149:11 - error TS1005: ':' expected.

149     const features = await this.extractFeatures(userId, orgId);
              ~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:149:63 - error TS1005: ',' expected.

149     const features = await this.extractFeatures(userId, orgId);
                                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:150:11 - error TS1005: ':' expected.

150     const modelPredictions = [];
              ~~~~~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:150:32 - error TS1005: ',' expected.

150     const modelPredictions = [];
                                   ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:9 - error TS1359: Identifier expected. 'const' is a reserved word that cannot be used here.

153     for(const [modelName, model] of this.models.entries()) {
            ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:15 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:34 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                     ~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:37 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                        ~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:41 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                            ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:58 - error TS1005: ',' expected.

153     for(const [modelName, model] of this.models.entries()) {
                                                             ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:153:60 - error TS1136: Property assignment expected.

153     for(const [modelName, model] of this.models.entries()) {
                                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:187:3 - error TS1128: Declaration or statement expected.

187   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:192:3 - error TS1434: Unexpected keyword or identifier.

192   async evaluateEnsemble(orgId: string): Promise < {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:192:31 - error TS1005: ',' expected.

192   async evaluateEnsemble(orgId: string): Promise < {
                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:192:40 - error TS1005: ';' expected.

192   async evaluateEnsemble(orgId: string): Promise < {
                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:193:34 - error TS1005: ',' expected.

193     ensembleMetrics: ModelMetrics;
                                     ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:194:52 - error TS1005: ',' expected.

194     individualMetrics: Record<string, ModelMetrics>;
                                                       ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:195:24 - error TS1005: ',' expected.

195     improvement: number; // % de melhoria sobre melhor modelo individual
                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:197:11 - error TS1005: ':' expected.

197     const testData = await this.collectTestData(orgId);
              ~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:197:55 - error TS1005: ',' expected.

197     const testData = await this.collectTestData(orgId);
                                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:200:11 - error TS1005: ':' expected.

200     const ensembleMetrics = await this.evaluateOnTestData(testData, 'ensemble');
              ~~~~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:200:80 - error TS1005: ',' expected.

200     const ensembleMetrics = await this.evaluateOnTestData(testData, 'ensemble');
                                                                                   ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:11 - error TS1005: ':' expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
              ~~~~~~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:28 - error TS1005: ',' expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:59 - error TS1005: '(' expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
                                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:203:61 - error TS1136: Property assignment expected.

203     const individualMetrics: Record<string, ModelMetrics> = { };
                                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:217:3 - error TS1128: Declaration or statement expected.

217   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:222:3 - error TS1434: Unexpected keyword or identifier.

222   async autoFeatureEngineering(rawFeatures: any): Promise < {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:222:43 - error TS1005: ',' expected.

222   async autoFeatureEngineering(rawFeatures: any): Promise < {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:222:49 - error TS1005: ';' expected.

222   async autoFeatureEngineering(rawFeatures: any): Promise < {
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:223:29 - error TS1005: ',' expected.

223     originalFeatures: number;
                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:224:31 - error TS1005: ',' expected.

224     engineeredFeatures: number;
                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:225:25 - error TS1011: An element access expression should take an argument.

225     newFeatures: string[];
                            

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:225:26 - error TS1005: ',' expected.

225     newFeatures: string[];
                             ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:11 - error TS1005: ':' expected.

227     const newFeatures: string[] = [];
              ~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:22 - error TS1005: ',' expected.

227     const newFeatures: string[] = [];
                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:30 - error TS1005: ',' expected.

227     const newFeatures: string[] = [];
                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:31 - error TS1109: Expression expected.

227     const newFeatures: string[] = [];
                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:33 - error TS1005: ':' expected.

227     const newFeatures: string[] = [];
                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:227:37 - error TS1005: ',' expected.

227     const newFeatures: string[] = [];
                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:230:19 - error TS1005: ',' expected.

230     if(rawFeatures.permissionCount && rawFeatures.roleCount) {
                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:230:60 - error TS1005: ',' expected.

230     if(rawFeatures.permissionCount && rawFeatures.roleCount) {
                                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:230:62 - error TS1136: Property assignment expected.

230     if(rawFeatures.permissionCount && rawFeatures.roleCount) {
                                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:256:3 - error TS1128: Declaration or statement expected.

256   }
      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:3 - error TS1434: Unexpected keyword or identifier.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
      ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:38 - error TS1005: ',' expected.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:53 - error TS1005: ',' expected.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
                                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:261:62 - error TS1005: ';' expected.

261   async tuneHyperparameters(modelType: string, orgId: string): Promise < {
                                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:262:36 - error TS1005: ',' expected.

262     bestParams: Record<string, any>;
                                       ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:263:25 - error TS1005: ',' expected.

263     bestAccuracy: number;
                            ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:264:22 - error TS1005: ',' expected.

264     trialsRun: number;
                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:266:12 - error TS1005: ',' expected.

266     console.log(`🔧 Tuning hyperparameters for ${modelType}...`);
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:266:65 - error TS1005: ',' expected.

266     console.log(`🔧 Tuning hyperparameters for ${modelType}...`);
                                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:268:11 - error TS1005: ':' expected.

268     const paramGrid = this.getParameterGrid(modelType);
              ~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:268:55 - error TS1005: ',' expected.

268     const paramGrid = this.getParameterGrid(modelType);
                                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:269:9 - error TS1005: ',' expected.

269     let bestAccuracy = 0;
            ~~~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:269:25 - error TS1005: ',' expected.

269     let bestAccuracy = 0;
                            ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:270:9 - error TS1005: ',' expected.

270     let bestParams = {};
            ~~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:270:24 - error TS1005: ',' expected.

270     let bestParams = {};
                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:271:9 - error TS1005: ',' expected.

271     let trialsRun = 0;
            ~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:271:22 - error TS1005: ',' expected.

271     let trialsRun = 0;
                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:9 - error TS1359: Identifier expected. 'const' is a reserved word that cannot be used here.

274     for(const params of paramGrid) {
            ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:15 - error TS1005: ',' expected.

274     for(const params of paramGrid) {
                  ~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:22 - error TS1005: ',' expected.

274     for(const params of paramGrid) {
                         ~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:274:25 - error TS1005: ',' expected.

274     for(const params of paramGrid) {
                            ~~~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:286:5 - error TS1005: ',' expected.

286     console.log(`✅ Best params found: ${JSON.stringify(bestParams)} with ${(bestAccuracy * 100).toFixed(2)}% accuracy`);
        ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:286:12 - error TS1005: ',' expected.

286     console.log(`✅ Best params found: ${JSON.stringify(bestParams)} with ${(bestAccuracy * 100).toFixed(2)}% accuracy`);
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:286:120 - error TS1005: ',' expected.

286     console.log(`✅ Best params found: ${JSON.stringify(bestParams)} with ${(bestAccuracy * 100).toFixed(2)}% accuracy`);
                                                                                                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:288:12 - error TS1005: ':' expected.

288     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:292:6 - error TS1005: ',' expected.

292     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:3 - error TS1128: Declaration or statement expected.

296   private async collectTrainingData(orgId: string): Promise < any > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:11 - error TS1434: Unexpected keyword or identifier.

296   private async collectTrainingData(orgId: string): Promise < any > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:42 - error TS1005: ',' expected.

296   private async collectTrainingData(orgId: string): Promise < any > {
                                             ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:296:51 - error TS1005: ';' expected.

296   private async collectTrainingData(orgId: string): Promise < any > {
                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:298:12 - error TS1005: ':' expected.

298     return { features: [], labels: [] };
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:298:40 - error TS1005: ',' expected.

298     return { features: [], labels: [] };
                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:3 - error TS1128: Declaration or statement expected.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:11 - error TS1434: Unexpected keyword or identifier.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:40 - error TS1005: ',' expected.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:301:46 - error TS1005: ';' expected.

301   private async trainNeuralNetwork(data: any): Promise < ModelMetrics > {
                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:303:12 - error TS1005: ':' expected.

303     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:309:6 - error TS1005: ',' expected.

309     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:3 - error TS1128: Declaration or statement expected.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:11 - error TS1434: Unexpected keyword or identifier.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:39 - error TS1005: ',' expected.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:312:45 - error TS1005: ';' expected.

312   private async trainRandomForest(data: any): Promise < ModelMetrics > {
                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:314:12 - error TS1005: ':' expected.

314     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:320:6 - error TS1005: ',' expected.

320     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:3 - error TS1128: Declaration or statement expected.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:11 - error TS1434: Unexpected keyword or identifier.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:43 - error TS1005: ',' expected.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:323:49 - error TS1005: ';' expected.

323   private async trainGradientBoosting(data: any): Promise < ModelMetrics > {
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:325:12 - error TS1005: ':' expected.

325     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:331:6 - error TS1005: ',' expected.

331     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:3 - error TS1128: Declaration or statement expected.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:11 - error TS1434: Unexpected keyword or identifier.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:30 - error TS1005: ',' expected.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:334:36 - error TS1005: ';' expected.

334   private async trainSVM(data: any): Promise < ModelMetrics > {
                                       ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:336:12 - error TS1005: ':' expected.

336     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:342:6 - error TS1005: ',' expected.

342     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:3 - error TS1128: Declaration or statement expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:11 - error TS1434: Unexpected keyword or identifier.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:39 - error TS1005: ',' expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:54 - error TS1005: ',' expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
                                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:345:63 - error TS1005: ';' expected.

345   private async extractFeatures(userId: string, orgId: string): Promise < any > {
                                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:347:12 - error TS1005: ':' expected.

347     return {};
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:347:14 - error TS1005: ',' expected.

347     return {};
                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:3 - error TS1128: Declaration or statement expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:11 - error TS1434: Unexpected keyword or identifier.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:43 - error TS1005: ',' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:61 - error TS1005: ',' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:67 - error TS1005: ';' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:350:99 - error TS1005: ',' expected.

350   private async predictWithModel(modelName: string, features: any): Promise < { isAnomaly: boolean; confidence: number } > {
                                                                                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:352:12 - error TS1005: ':' expected.

352     return { isAnomaly: false, confidence: 0.7 };
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:352:49 - error TS1005: ',' expected.

352     return { isAnomaly: false, confidence: 0.7 };
                                                    ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:3 - error TS1128: Declaration or statement expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:35 - error TS1005: ',' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                      ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:53 - error TS1005: ',' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:59 - error TS1011: An element access expression should take an argument.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                              

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:61 - error TS1005: ';' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                                ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:70 - error TS1011: An element access expression should take an argument.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                                         

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:355:72 - error TS1005: ';' expected.

355   private identifyReasons(features: any, predictions: any[]): string[] {
                                                                           ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:3 - error TS1128: Declaration or statement expected.

366   private async collectTestData(orgId: string): Promise < any > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:11 - error TS1434: Unexpected keyword or identifier.

366   private async collectTestData(orgId: string): Promise < any > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:38 - error TS1005: ',' expected.

366   private async collectTestData(orgId: string): Promise < any > {
                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:366:47 - error TS1005: ';' expected.

366   private async collectTestData(orgId: string): Promise < any > {
                                                  ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:368:12 - error TS1005: ':' expected.

368     return [];
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:368:14 - error TS1005: ',' expected.

368     return [];
                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:3 - error TS1128: Declaration or statement expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:11 - error TS1434: Unexpected keyword or identifier.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:44 - error TS1005: ',' expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:60 - error TS1005: ',' expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
                                                               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:371:69 - error TS1005: ';' expected.

371   private async evaluateOnTestData(testData: any, modelType: string): Promise < ModelMetrics > {
                                                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:373:12 - error TS1005: ':' expected.

373     return {
               ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:379:6 - error TS1005: ',' expected.

379     };
         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:3 - error TS1128: Declaration or statement expected.

382   private getParameterGrid(modelType: string): any[] {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:37 - error TS1005: ',' expected.

382   private getParameterGrid(modelType: string): any[] {
                                        ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:46 - error TS1005: ';' expected.

382   private getParameterGrid(modelType: string): any[] {
                                                 ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:52 - error TS1011: An element access expression should take an argument.

382   private getParameterGrid(modelType: string): any[] {
                                                       

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:382:54 - error TS1005: ';' expected.

382   private getParameterGrid(modelType: string): any[] {
                                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:3 - error TS1128: Declaration or statement expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
      ~~~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:11 - error TS1434: Unexpected keyword or identifier.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
              ~~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:43 - error TS1005: ',' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:59 - error TS1005: ',' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                                              ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:71 - error TS1005: ',' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                                                          ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:391:80 - error TS1005: ';' expected.

391   private async trainAndEvaluate(modelType: string, params: any, orgId: string): Promise < number > {
                                                                                   ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:393:12 - error TS1005: ':' expected.

393     return 0.85 + Math.random() * 0.1;
               ~~~~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:393:38 - error TS1005: ',' expected.

393     return 0.85 + Math.random() * 0.1;
                                         ~

apps/api/src/modules/permissions/services/ml-ensemble.service.ts:395:1 - error TS1128: Declaration or statement expected.

395 }
    ~
