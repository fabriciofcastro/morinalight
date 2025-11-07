# @morina/ui

Pacote de Design System compartilhável com tokens, helpers e componentes glassmorphism do Morina Light.

## Conteúdo

- `lib/cn`: helper para composição de classes (clsx + tailwind-merge).
- `theme/tokens`: tokens oficiais (cores, espaçamentos, tipografia, elevações).
- `theme/theme-provider`: injeta variáveis CSS através do wrapper de layout.
- `components/glass-card`: cartão translúcido com glow configurável.

## Uso básico

```tsx
import { GlassCard, ThemeProvider } from "@morina/ui";

export function HeroShell() {
  return (
    <ThemeProvider className="min-h-screen bg-[var(--bg)]">
      <GlassCard>
        <p>Conteúdo operando em modo Morina.</p>
      </GlassCard>
    </ThemeProvider>
  );
}
```

## Scripts

- `pnpm --filter @morina/ui lint`
- `pnpm --filter @morina/ui typecheck`
