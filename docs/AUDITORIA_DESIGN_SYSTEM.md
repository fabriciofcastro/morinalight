# 🎨 AUDITORIA DESIGN SYSTEM - Morina

**Data:** 2 de dezembro de 2025  
**Status:** 🟡 Parcialmente Definido | Precisa Melhorias  
**Score:** 6.5/10

---

## 📊 RESUMO EXECUTIVO

### O Que Tem ✅

- ✅ Paleta de cores básica definida (Dark/Light)
- ✅ Tipografia sistema (Inter)
- ✅ Espaçamento scale (8-80px)
- ✅ Temas (data-theme)
- ✅ Componentes base (FormField, Badge, etc)
- ✅ Tailwind CSS integrado

### O Que Falta ❌

- ❌ Sem documentação oficial (Storybook)
- ❌ Componentes fragmentados (sem biblioteca unificada)
- ❌ Sem especificação visual (width, height patterns)
- ❌ Sem patterns de layout reutilizáveis
- ❌ Sem guia de uso (guidelines)
- ❌ Sem testes de acessibilidade formalizados
- ❌ Sem animação system
- ❌ Sem elevation system formal
- ❌ Sem breakpoints bem documentados
- ❌ Sem tokens para admin vs. web app

---

## 🔍 ANÁLISE DETALHADA

### 1️⃣ PALETA DE CORES

#### O Que Existe

```css
/* Tema Escuro */
--primary: 227 100% 58%; /* Azul (Sky 500) */
--secondary: 270 95% 65%; /* Roxo (Indigo) */
--accent: 160 90% 55%; /* Ciano (Electric) */
--success: 158 72% 55%; /* Verde */
--warning: 45 100% 60%; /* Amarelo */
--danger: 0 82% 60%; /* Vermelho */

/* Background Layers */
--bg: 222 28% 10%; /* Fundo base */
--surface: 222 22% 14%; /* Cards/Surfaces */
--elevated: 222 20% 18%; /* Popovers */
```

#### Problemas Identificados

🔴 **Sem escala de cinzas completa**

```
Faltam:
- Neutral 50, 100, 200, 300, etc (apenas 95%, 75%, 55%)
- Affecting: grays, muted states, disabled states
```

🔴 **Sem estados de componentes**

```
Faltam:
- Hover states (colors)
- Disabled states (colors)
- Focus states (colors)
- Loading states (colors)
- Error states (colors)
```

🔴 **Sem escala de tons**

```
Faltam:
- Primary: 50, 100, 200, ... 900
- Secondary: completa
- Accent: completa
```

### 2️⃣ TIPOGRAFIA

#### O Que Existe

```css
--font-sans: Inter --font-mono: Monospace Sizes: --text-xs: 12px /
  --leading-xs: 18px --text-sm: 14px / --leading-sm: 20px --text-md: 15px /
  --leading-md: 22px --text-lg: 18px / --leading-lg: 26px --text-xl: 20px /
  --leading-xl: 28px --text-2xl: 24px / --leading-2xl: 32px --text-3xl: 30px /
  --leading-3xl: 38px Weights: --weight-regular: 400 --weight-medium: 500
  --weight-semibold: 600 --weight-bold: 700;
```

#### Problemas Identificados

🔴 **Sem definição de letter-spacing**

```
Faltam:
- letter-spacing scale (tight, normal, loose)
- Para headlines, body, captions
```

🔴 **Sem definição de line-height ratio**

```
Problema:
- Line heights fixos (18px, 20px)
- Melhor seria: 1.25, 1.5, 1.75 (ratios)
- Mais flexível e escalável
```

🔴 **Sem text styles compostos**

```
Faltam:
- h1: 30px, 600 weight, -0.02em letter-spacing
- h2: 24px, 600 weight, -0.01em letter-spacing
- body: 15px, 400 weight, 0em letter-spacing
- caption: 12px, 500 weight, 0.01em letter-spacing
```

### 3️⃣ ESPAÇAMENTO

#### O Que Existe

```css
--space-0: 0px --space-1: 4px --space-2: 8px --space-3: 12px --space-4: 16px
  --space-5: 20px --space-6: 24px --space-7: 28px --space-8: 32px
  --space-9: 36px --space-10: 40px --space-12: 48px --space-16: 64px
  --space-20: 80px;
```

#### Status ✅

**BOM!** Escala 8px bem definida (0-80px)

#### Sugestão de Melhoria

```css
/* Adicionar gaps para layouts específicos */
--gap-xs: 8px /* Cards compactos */ --gap-sm: 12px /* Conteúdo normal */
  --gap-md: 16px /* Seções */ --gap-lg: 24px /* Grupos */ --gap-xl: 32px
  /* Major sections */ /* Padding presets */ --p-button: 12px 16px /* Buttons */
  --p-card: 24px /* Cards */ --p-section: 32px /* Sections */;
```

### 4️⃣ RADIOS & BORDAS

#### O Que Existe

```css
--radius-sm: 0px /* Completely sharp */ --radius-md: 2px /* Barely visible */
  --radius-lg: 3px /* Minimal */ --radius-xl: 4px /* Subtle */;
```

#### Problemas Identificados

🔴 **Radios MUITO pequenos**

```
0px, 2px, 3px, 4px é muito minimal

Para um design moderno:
--radius-sm: 4px        /* Buttons */
--radius-md: 6px        /* Cards */
--radius-lg: 8px        /* Containers */
--radius-xl: 12px       /* Large elements */
--radius-2xl: 16px      /* Modals */
```

🔴 **Sem border width scale**

```
Faltam:
--border-0: 0px
--border-1: 1px
--border-2: 2px
--border-3: 3px (para gapas importantes)
```

### 5️⃣ SOMBRAS

#### O Que Existe

```css
--shadow-sm: 0 2px 8px hsl(240 10% 10% / 0.25) --shadow-md: 0 8px 24px
  hsl(240 10% 10% / 0.35) --shadow-lg: 0 18px 42px hsl(240 10% 10% / 0.45);
```

#### Status ✅

**BOM!** 3 níveis cobrindo casos comuns

#### Sugestões

```css
/* Adicionar mais níveis */
--shadow-xs: 0 1px 2px hsl(240 10% 10% / 0.05) --shadow-sm: 0 2px 8px
  hsl(240 10% 10% / 0.15) --shadow-md: 0 8px 24px hsl(240 10% 10% / 0.25)
  --shadow-lg: 0 18px 42px hsl(240 10% 10% / 0.35) --shadow-xl: 0 30px 60px
  hsl(240 10% 10% / 0.45) --shadow-2xl: 0 50px 100px hsl(240 10% 10% / 0.55);
```

### 6️⃣ BREAKPOINTS

#### O Que Existe

```css
--bp-xs: 375px /* Small phones */ --bp-sm: 640px /* Large phones */
  --bp-md: 768px /* Tablets */ --bp-lg: 1024px /* Small laptops */
  --bp-xl: 1280px /* Desktops */ --bp-2xl: 1536px /* Large screens */;
```

#### Status ✅

**BOM!** Cobertura completa

#### Sugestão

```
Documentar em guideline:
- xs: 375-639px
- sm: 640-767px
- md: 768-1023px
- lg: 1024-1279px
- xl: 1280-1535px
- 2xl: 1536px+

Usar em:
- Mobile first approach
- Indicar major breakpoints
```

### 7️⃣ COMPONENTES

#### O Que Existe

```typescript
export { Tooltip } from "./tooltip";
export { FormField } from "./form-field";
export { KPICard } from "./kpi-card";
export { StatusBadge } from "./status-badge";
```

#### Problemas Identificados

🔴 **Muito poucos componentes**

```
Faltam:
- Button (vários variants)
- Card (layouts padrão)
- Input, Select, TextArea
- Alert/Toast
- Modal/Dialog
- Tabs, Accordion
- Pagination
- Dropdown
- Breadcrumb
- Navigation
- Footer
- Form layout helpers
```

🔴 **Sem especificação de variants**

```
Exemplo FormField:
- Sem documentation clara
- Sem tipo de campo bem definido
- Sem estados (loading, error, success, disabled)
- Sem tamanhos (sm, md, lg)
```

### 8️⃣ ANIMAÇÕES

#### O Que Existe

```css
/* Apenas em globals.css */
html {
  @apply transition-colors duration-500;
}
```

#### Problemas Identificados

🔴 **Sem animation system formal**

```
Faltam:
--duration-fast: 150ms
--duration-base: 300ms
--duration-slow: 500ms

--easing-in: cubic-bezier(0.4, 0, 1, 1)
--easing-out: cubic-bezier(0, 0, 0.2, 1)
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1)

@keyframes fade-in, fade-out, slide-in, slide-out, etc
```

🔴 **Framer Motion sem padrões**

```
Atual:
- Cada componente usa Framer Motion diferente
- Sem spring config compartilhado
- Sem naming conventions

Precisa:
- Shared animation presets
- Named transitions
- Documented motion language
```

### 9️⃣ ACESSIBILIDADE

#### Problemas Identificados

🔴 **Sem formal WCAG guidelines**

```
Faltam:
- Color contrast checklist
  (4.5:1 para texto normal)
  (3:1 para texto grande)
- Focus indicators
- ARIA labels patterns
- Keyboard navigation
- Screen reader testing
```

🔴 **Sem dark mode contrast definido**

```
Exemplo:
- Text on surface: Current não documentado
- Falta verificação de contrast ratios
- Não há fallback colors
```

---

## 📋 MATRIX DE MATURIDADE

| Aspecto            | Status        | Score | Prioridade |
| ------------------ | ------------- | ----- | ---------- |
| **Cores**          | Básico        | 5/10  | 🔴 ALTA    |
| **Tipografia**     | Bom           | 7/10  | 🟡 MÉDIA   |
| **Espaçamento**    | Bom           | 8/10  | 🟢 BAIXA   |
| **Radios**         | Muito Pequeno | 3/10  | 🔴 ALTA    |
| **Sombras**        | Bom           | 7/10  | 🟢 BAIXA   |
| **Breakpoints**    | Bom           | 8/10  | 🟢 BAIXA   |
| **Componentes**    | Fragmentado   | 4/10  | 🔴 ALTA    |
| **Animações**      | Inexistente   | 2/10  | 🔴 ALTA    |
| **Acessibilidade** | Nenhuma       | 0/10  | 🔴 CRÍTICA |
| **Documentação**   | Nenhuma       | 0/10  | 🔴 CRÍTICA |

**Score Geral: 4.4/10** 🔴

---

## 🚀 PLANO DE MELHORIA

### FASE 1: Foundation (Priority 🔴)

#### 1.1 Expandir Paleta de Cores

```css
@theme {
  /* Complete color scales */
  --gray-50: hsl(0 0% 98%) --gray-100: hsl(0 0% 94%)
    --gray-200: hsl(0 0% 89%)... até --gray-950: hsl(0 0% 3%)
    --primary-50: hsl(227 100% 94%) --primary-100: hsl(227 100% 87%)... até
    --primary-950: hsl(227 100% 13%) /* State colors */
    --danger-light: hsl(0 82% 80%) --danger-lighter: hsl(0 82% 90%)
    --success-light: hsl(158 72% 80%) --warning-light: hsl(45 100% 80%);
}
```

#### 1.2 Criar Text Styles

```css
/* Compostos typography */
h1: 30px 600 weight -0.02em
h2: 24px 600 weight -0.01em
h3: 20px 600 weight 0em
body: 15px 400 weight 0em
caption: 12px 500 weight 0.01em
button: 15px 600 weight 0em
```

#### 1.3 Aumentar Border Radius

```css
--radius-sm: 4px --radius-md: 6px --radius-lg: 8px --radius-xl: 12px
  --radius-2xl: 16px;
```

#### 1.4 Criar Animation System

```css
--duration-instant: 0ms --duration-fast: 100ms --duration-base: 200ms
  --duration-slow: 300ms --duration-slower: 500ms
  --ease-out: cubic-bezier(0, 0, 0.2, 1) --ease-in: cubic-bezier(0.4, 0, 1, 1)
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### FASE 2: Components Library (Priority 🔴)

#### 2.1 Criar Component Kit Completo

```
src/components/ui/
├── Button.tsx         (primary, secondary, ghost, outline)
├── Card.tsx          (default, interactive, elevated)
├── Input.tsx         (text, email, number, search)
├── Select.tsx        (single, multi)
├── TextArea.tsx
├── Checkbox.tsx
├── Radio.tsx
├── Switch.tsx
├── Alert.tsx         (success, warning, danger, info)
├── Badge.tsx         (filled, outline, ghost)
├── Tag.tsx
├── Modal.tsx
├── Dialog.tsx
├── Toast.tsx
├── Tooltip.tsx       (melhorar)
├── Dropdown.tsx
├── Menu.tsx
├── Tabs.tsx
├── Accordion.tsx
├── Pagination.tsx
├── Breadcrumb.tsx
├── Stepper.tsx
├── Progress.tsx      (melhorar)
├── Spinner.tsx
├── Skeleton.tsx
├── Avatar.tsx
├── Icon.tsx          (wrapper Lucide)
└── index.ts          (exports)
```

#### 2.2 Component Specifications

```
Para cada componente:
- Sizes: sm, md, lg
- Variants: primary, secondary, ghost, outline, danger
- States: normal, hover, focus, active, disabled, loading
- Props documentation
- Usage examples
- Accessibility checklist
```

### FASE 3: Documentation (Priority 🔴)

#### 3.1 Criar Storybook

```bash
npm install -D @storybook/react @storybook/addon-links

# Estrutura
stories/
├── Button.stories.tsx
├── Card.stories.tsx
├── FormField.stories.tsx
└── ... (um por componente)
```

#### 3.2 Criar Guidelines Document

```markdown
docs/
├── DESIGN_SYSTEM.md
├── COLOR_GUIDE.md
├── TYPOGRAPHY_GUIDE.md
├── SPACING_GUIDE.md
├── ANIMATION_GUIDE.md
├── ACCESSIBILITY_CHECKLIST.md
└── COMPONENT_LIBRARY.md
```

### FASE 4: Accessibility (Priority 🔴)

#### 4.1 WCAG AA Audit

```
- Contrast ratios: 4.5:1 (text), 3:1 (large)
- Focus indicators: Visible on all interactive
- ARIA labels: Complete
- Keyboard navigation: Tab, Enter, Escape
- Screen reader: Testing with NVDA/JAWS
```

#### 4.2 Criar Accessibility Tests

```tsx
// accessibility.test.ts
describe("Accessibility", () => {
  test("contrast ratio meets WCAG AA", () => {});
  test("focus indicator visible", () => {});
  test("keyboard navigation works", () => {});
  test("screen reader announces correctly", () => {});
});
```

---

## 💻 CÓDIGO A IMPLEMENTAR

### 1. Expandir tokens CSS

```css
/* src/styles/tokens/colors.css */
@theme {
  --gray-50: hsl(0 0% 98%) --gray-100: hsl(0 0% 94%) --gray-200: hsl(0 0% 89%)
    --gray-300: hsl(0 0% 83%) --gray-400: hsl(0 0% 64%)
    --gray-500: hsl(0 0% 45%) --gray-600: hsl(0 0% 32%)
    --gray-700: hsl(0 0% 25%) --gray-800: hsl(0 0% 15%)
    --gray-900: hsl(0 0% 11%) --gray-950: hsl(0 0% 3%) /* State colors */
    --danger-light: hsl(0 82% 85%) --danger-lighter: hsl(0 82% 95%)
    --success-light: hsl(158 72% 85%) --success-lighter: hsl(158 72% 95%);
}
```

### 2. Criar Button Component Completo

```tsx
// src/components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
        ghost: "hover:bg-gray-100 text-gray-900",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
```

### 3. Criar Animation Presets

```tsx
// src/lib/animations.ts
export const animationPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 },
  },
  slideInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.2 },
  },
};
```

---

## 📊 ROADMAP IMPLEMENTAÇÃO

### Semana 1: Foundation Colors & Typography

- [ ] Expandir paleta de cores (gray scale)
- [ ] Definir text styles
- [ ] Atualizar globals.css

### Semana 2: Components Base

- [ ] Button, Card, Input
- [ ] Select, TextArea, Checkbox
- [ ] Badge, Alert, Toast

### Semana 3: Advanced Components

- [ ] Modal, Dialog, Dropdown
- [ ] Tabs, Accordion, Pagination
- [ ] Stepper, Avatar

### Semana 4: Animations & Documentation

- [ ] Animation system
- [ ] Storybook setup
- [ ] Guidelines documentation

### Semana 5: Testing & Accessibility

- [ ] Accessibility audit
- [ ] WCAG AA compliance
- [ ] Unit & A11y tests

---

## 📞 PRÓXIMOS PASSOS

1. **Aprovar** este plano com design/PM
2. **Priorizar** qual fase começar (recomendo: FASE 1)
3. **Alocar** recursos (1-2 devs)
4. **Executar** semana por semana

---

**Score Geral: 4.4/10** 🔴  
**Urgência: ALTA**  
**Timeline Melhoria: 5-6 semanas**
