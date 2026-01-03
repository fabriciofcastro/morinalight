---
title: Personalização Visual Avançada
summary: Configuração da identidade AlphaSysCore por empresa
updated: 2025-11-07
---

# 🎨 Personalização Visual · AlphaSysCore

> **Objetivo:** permitir que cada empresa ajuste identidade visual, modo padrão e vídeo institucional do AlphaSysCore by Morina com persistência no banco (Prisma) e aplicação imediata no front-end.

---

## 📍 Escopo

- Página `settings/company`
- Painel `PersonalizationPanel`
- API `GET/PUT /api/company-settings`
- Hook `useThemeEngine` (sincroniza tema, vídeo e cores)
- Persistência em `CompanySettings` (Prisma) com fallback em memória para ambientes sem banco

---

## 🧱 Domínio

| Campo            | Tipo                          | Observação                                            |
| ---------------- | ----------------------------- | ----------------------------------------------------- |
| `logoUrl`        | string \| null                | PNG/SVG (Data URL temporária admitida)                |
| `primaryColor`   | string \| null                | Hexadecimal `#RRGGBB`                                 |
| `secondaryColor` | string \| null                | Hexadecimal `#RRGGBB`                                 |
| `themeMode`      | `"light" \| "dark" \| "auto"` | Imediatamente aplicado                                |
| `videoLink`      | string \| null                | Vimeo/YouTube; convertido para embed autoplay sem som |

---

## 🔄 Fluxo

1. Usuário abre `/settings/company`.
2. `useThemeEngine` carrega preferências com `GET /api/company-settings`.
3. Formulário `react-hook-form + zod` atualiza preview via `updateCompanyTheme`.
4. Ao salvar, `persistCompanyTheme` envia `PUT` → Prisma `upsert`.
5. Tema é aplicado via CSS custom properties e animação translúcida global.

---

## ⚙️ API (Next.js Route Handler)

`apps/web/src/app/api/company-settings/route.ts`

- **GET**: retorna configurações normalizadas (defaults + dados salvos).
- **PUT**: valida payload (`companySettingsSchema`), persiste via Prisma e retorna o estado aplicado.
- **Fallback**: se o banco não estiver acessível (ex.: pipelines locais), usa store em memória para evitar falhas.

> **Obs.:** modelo Prisma `CompanySettings` está definido em `apps/api/prisma/schema.prisma`. Rodar `pnpm --filter @morina/api prisma migrate dev --name add_company_settings`.

---

## 🧩 Hook `useThemeEngine`

- Lê preferências do storage + servidor.
- Injeta tokens (`--primary`, `--surface`, `--motion-duration-base` etc.).
- Disponibiliza `persistCompanyTheme`, `updateCompanyTheme`, `refreshCompanyTheme`, estados `loading`/`saving` e embed de vídeo com autoplay.

---

## 🧪 Testes

- **Unitários:** `use-theme-engine.spec.ts`, `company-settings.spec.ts`.
- **E2E:** `tests/e2e/home.spec.ts` e `tests/e2e/login.spec.ts` garantem consistência visual; adicionar cenários específicos se o cliente demandar.

---

## ✅ DoD

- [x] Tema aplica logo, cores, modo, vídeo em tempo real.
- [x] API valida e persiste via Prisma (com fallback controlado).
- [x] Front cobre validações, feedbacks e responsividade.
- [x] Documentação atualizada (`design.md`, `usage/personalization.md`).
- [x] Testes unitários verdes; Playwright rodando.

---

**Mantra Morina:** _“Customize como uma runway, opere como um cockpit.”_
