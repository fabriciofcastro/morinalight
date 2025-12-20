# Storybook - Design System MORINA

Este diretório contém a configuração do Storybook para documentar e testar os componentes do Design System MORINA.

## 🚀 Como Usar

### Desenvolvimento

```bash
cd packages/ui
pnpm storybook
```

O Storybook será aberto em `http://localhost:6006`

### Build Estático

```bash
cd packages/ui
pnpm build-storybook
```

O build será gerado em `storybook-static/`

## 📚 Estrutura

- `main.ts` - Configuração principal do Storybook
- `preview.tsx` - Configurações globais de preview (backgrounds, acessibilidade, etc.)

## 🎨 Stories

As stories estão localizadas junto com os componentes em `src/components/*.stories.tsx`

### Componentes Documentados

- ✅ ButtonEnhanced - Botões com múltiplas variantes
- ✅ Input - Campos de entrada com estados de validação
- ✅ FormField - Wrapper para campos de formulário

### Próximos Componentes

- [ ] Textarea
- [ ] Select
- [ ] Checkbox
- [ ] Alert
- [ ] GlassCard
- [ ] Tooltip
- [ ] Popover
- [ ] DropdownMenu

## 🔧 Addons Configurados

- **@storybook/addon-essentials** - Addons essenciais (controls, actions, docs, etc.)
- **@storybook/addon-interactions** - Testes de interação
- **@storybook/addon-links** - Links entre stories
- **@storybook/addon-a11y** - Auditoria de acessibilidade

## ♿ Acessibilidade

O Storybook está configurado para validar acessibilidade automaticamente usando o addon `@storybook/addon-a11y`, que verifica:

- Contraste de cores (WCAG AA)
- ARIA labels
- Navegação por teclado
- Screen readers

## 📝 Criando Novas Stories

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MeuComponente } from "./meu-componente";

const meta: Meta<typeof MeuComponente> = {
  title: "Components/MeuComponente",
  component: MeuComponente,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MeuComponente>;

export const Default: Story = {
  args: {
    // props do componente
  },
};
```

## 🎯 Próximos Passos

1. Adicionar stories para todos os componentes
2. Criar documentação de design tokens
3. Adicionar exemplos de uso avançados
4. Configurar deploy automático do Storybook

