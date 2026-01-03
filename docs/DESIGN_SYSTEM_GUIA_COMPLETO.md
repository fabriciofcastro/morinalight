# 🎨 Design System - Guia Completo de Uso

> **Sistema de design padronizado para agilizar desenvolvimento e facilitar troca de temas**

---

## 📊 Status Atual

**Score:** 7.5/10 ✅  
**Localização:** `packages/ui/`  
**Última Atualização:** 2025-01-19

### ✅ O Que Já Existe

1. **Design Tokens Completos** (`packages/ui/src/theme/`)
   - Cores semânticas (primary, success, warning, danger)
   - Tipografia (Inter, escala completa)
   - Espaçamento (escala 8px)
   - Border radius, shadows, breakpoints
   - Animation tokens
   - Validation tokens

2. **Componentes Reutilizáveis** (`packages/ui/src/components/`)
   - ✅ Button, ButtonEnhanced
   - ✅ Input, Select, Textarea
   - ✅ FormField, FormSelect
   - ✅ GlassCard, GlassCardEnhanced
   - ✅ Alert, Badge, Tooltip
   - ✅ TreeView, Popover, DropdownMenu
   - ✅ Checkbox, Label
   - ✅ DataTable (novo)
   - ✅ SkipLink (acessibilidade)

3. **Templates de Páginas** (`apps/web/src/components/templates/`)
   - ✅ StandardFormPage (padrão para formulários)
   - Auto-save integrado
   - Atalhos de teclado
   - Estados de loading

4. **Hooks Reutilizáveis** (`apps/web/src/hooks/`)
   - ✅ useAutoSave
   - ✅ useAriaLive (acessibilidade)
   - ✅ useKeyboardNavigation

5. **Sistema de Temas**
   - ✅ Dark/Light mode
   - ✅ Variáveis CSS customizadas
   - ✅ Theme Provider

---

## 🚀 Como Usar o Design System

### 1. Importar Componentes

```typescript
// Componentes do UI Package
import { Button, Input, GlassCard } from "@morina/ui";

// Componentes Futuristas (apps/web)
import {
  FuturisticInput,
  FuturisticSelect,
} from "@/components/ui/futuristic-input";

// Templates
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
```

### 2. Usar Design Tokens

```typescript
// Cores semânticas
className = "bg-[hsl(var(--primary))] text-white";
className = "text-[hsl(var(--text-1))]";
className = "border-[hsl(var(--border))]";

// Espaçamento
className = "p-4"; // 16px (escala 8px)
className = "gap-6"; // 24px

// Tipografia
className = "text-sm font-semibold";
```

### 3. Criar Formulário Padronizado

```typescript
import { StandardFormPage } from "@/components/templates";
import { useAutoSave } from "@/hooks/useAutoSave";
import { FuturisticInput } from "@/components/ui/futuristic-input";

export function MyForm() {
  const { status, hasUnsavedChanges, markDirty, markClean } = useAutoSave({
    onSave: async () => await handleSave(),
    intervalMs: 30000,
    requireValid: true,
    isValid: () => canSave,
  });

  return (
    <StandardFormPage
      title="Meu Formulário"
      subtitle="Descrição"
      onSave={handleSubmit}
      backUrl="/back"
      isValid={canSave}
      autoSaveStatus={status}
      hasUnsavedChanges={hasUnsavedChanges}
    >
      <form onSubmit={handleSubmit}>
        <FuturisticInput
          label="Campo"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            markDirty(); // ✅ Obrigatório para auto-save
          }}
        />
      </form>
    </StandardFormPage>
  );
}
```

### 4. Usar Glass Morphism

```typescript
import { GlassCard } from "@morina/ui";

<GlassCard className="p-6">
  {/* Conteúdo */}
</GlassCard>
```

---

## 📋 Checklist de Padronização

Ao criar uma nova tela, verificar:

- [ ] Usa `StandardFormPage` para formulários
- [ ] Usa `useAutoSave` para auto-save
- [ ] Usa componentes do `@morina/ui` ou `Futuristic*`
- [ ] Usa design tokens (cores, espaçamento)
- [ ] Adiciona `markDirty()` em todos os `onChange`
- [ ] Implementa validação com feedback visual
- [ ] Testa acessibilidade (keyboard navigation)
- [ ] Testa responsividade (mobile)

---

## 🎯 Componentes Disponíveis

### Formulários

- `FuturisticInput` - Input com estados de validação
- `FuturisticSelect` - Select estilizado
- `FuturisticTextarea` - Textarea estilizado
- `FormField` - Wrapper com label/error

### Layout

- `StandardFormPage` - Template completo de formulário
- `GlassCard` - Card com glass morphism
- `PageBackground` - Background padrão

### Feedback

- `Alert` - Mensagens de feedback
- `Badge` - Badges de status
- `Tooltip` - Tooltips informativos

### Navegação

- `TreeView` - Árvore de navegação
- `DropdownMenu` - Menu dropdown
- `Popover` - Popover contextual

### Dados

- `DataTable` - Tabela com paginação/ordenação

---

## 🔄 Troca de Tema

### Implementação Atual

```typescript
// Theme Provider já configurado
// Troca via data-theme no HTML
<html data-theme="dark"> // ou "light"
```

### Como Trocar Programaticamente

```typescript
// Em um componente
const toggleTheme = () => {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  html.setAttribute("data-theme", current === "dark" ? "light" : "dark");
};
```

---

## 📚 Documentação Adicional

- `docs/DESIGN_SYSTEM_QUICK_REFERENCE.md` - Referência rápida
- `docs/AUDITORIA_DESIGN_SYSTEM.md` - Auditoria completa
- `packages/ui/src/theme/design-tokens.ts` - Tokens completos
- `docs/Diretrizes/PADRAO-TEMPLATE-TELAS.md` - Padrão de telas

---

## ⚠️ Gaps Identificados

### Prioridade Alta

- [ ] Storybook para documentação visual
- [ ] Componente Calendar/DatePicker
- [ ] Componente Autocomplete
- [ ] Componente Multi-Select
- [ ] Skeleton Loaders padronizados

### Prioridade Média

- [ ] Guia de animações
- [ ] Padrões de layout (grids)
- [ ] Empty States padronizados
- [ ] Error Boundaries

---

## 🎨 Paleta de Cores

### Cores Semânticas

```css
--primary: hsl(210, 100%, 60%) /* Azul */ --success: hsl(158, 72%, 55%)
  /* Verde */ --warning: hsl(45, 100%, 60%) /* Amarelo */
  --danger: hsl(0, 82%, 60%) /* Vermelho */ --secondary: hsl(270, 95%, 65%)
  /* Roxo */ --accent: hsl(160, 90%, 55%) /* Ciano */;
```

### Superfícies

```css
--bg: hsl(222, 28%, 10%) /* Fundo */ --surface: hsl(222, 22%, 14%) /* Cards */
  --elevated: hsl(222, 20%, 18%) /* Popovers */
  --border: hsl(0, 0%, 100% / 0.06) /* Bordas */;
```

### Texto

```css
--text-1: hsl(0, 0%, 95%) /* Primário */ --text-2: hsl(0, 0%, 75%)
  /* Secundário */ --text-3: hsl(0, 0%, 55%) /* Muted */;
```

---

**Última atualização:** 2025-01-19
