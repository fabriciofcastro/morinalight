# 🎯 DESIGN SYSTEM ENHANCEMENT - Admin Company Page

**Objetivo:** Definir tokens e padrões necessários ANTES de implementar componentes elite

**Data:** 2 de dezembro de 2025  
**Status:** 🚀 Pronto para Sprint 1

---

## 📌 CONTEXTO

Para transformar `/admin/company` de **6.5/10 → 9.2/10**, precisamos resolver:

1. **Validação visual** (real-time feedback)
2. **Auto-fill inteligente** (CNPJ → CEP, etc)
3. **Autosave** (salva silenciosamente)
4. **Documentação inline** (tooltips, help text)
5. **Feedback visual** (loading, success, errors)

Tudo isso requer **novos tokens de design**.

---

## 🎨 NOVOS TOKENS NECESSÁRIOS

### 1. COLORS - Estados de Validação

```css
/* Tokens para FormField states */
@theme {
  /* Valid state - Success */
  --valid-color: hsl(158 72% 55%) /* Verde */ --valid-light: hsl(158 72% 85%)
    /* Verde light */ --valid-lighter: hsl(158 72% 95%) /* Verde lighter */
    --valid-bg: hsl(158 72% 95% / 0.5) /* Para background */
    /* Invalid state - Danger */ --invalid-color: hsl(0 82% 60%) /* Vermelho */
    --invalid-light: hsl(0 82% 85%) /* Vermelho light */
    --invalid-lighter: hsl(0 82% 95%) /* Vermelho lighter */
    --invalid-bg: hsl(0 82% 95% / 0.5) /* Para background */
    /* Pending state - Warning */ --pending-color: hsl(45 100% 60%)
    /* Amarelo */ --pending-light: hsl(45 100% 80%) /* Amarelo light */
    --pending-lighter: hsl(45 100% 95%) /* Amarelo lighter */
    --pending-bg: hsl(45 100% 95% / 0.5) /* Para background */
    /* Disabled state */ --disabled-color: hsl(0 0% 64%) /* Cinza médio */
    --disabled-bg: hsl(0 0% 94% / 0.5) /* Cinza light */
    --disabled-text: hsl(0 0% 45%) /* Texto dimmer */;
}
```

### 2. SPACING - Componentes Compactos

```css
@theme {
  /* Input padding presets */
  --input-py: 10px /* Vertical */ --input-px: 12px /* Horizontal */
    --input-height: 40px /* Total height */ /* Compact form layouts */
    --form-gap-compact: 12px /* Entre inputs */ --form-gap-normal: 16px
    /* Normal spacing */ --form-gap-loose: 24px /* Section spacing */
    /* Field group spacing */ --field-group-gap: 8px /* Dentro do group */
    --field-label-gap: 4px /* Label → Input */;
}
```

### 3. SHADOWS - Elevação & Focus

```css
@theme {
  /* Focus ring shadow */
  --focus-ring:
    0 0 0 3px hsl(227 100% 58% / 0.1),
    0 0 0 6px hsl(227 100% 58% / 0.05) /* Error focus ring */
      --focus-ring-error: 0 0 0 3px hsl(0 82% 60% / 0.1),
    0 0 0 6px hsl(0 82% 60% / 0.05) /* Input focus shadow */
      --input-focus-shadow: inset 0 0 0 1px hsl(227 100% 58%),
    0 0 0 3px hsl(227 100% 58% / 0.1);
}
```

### 4. BORDERS - Input States

```css
@theme {
  /* Border colors by state */
  --border-default: hsl(0 0% 83%) /* Padrão */ --border-hover: hsl(0 0% 64%)
    /* Hover */ --border-focus: hsl(227 100% 58%) /* Focus */
    --border-valid: hsl(158 72% 55%) /* Válido */
    --border-invalid: hsl(0 82% 60%) /* Inválido */
    --border-disabled: hsl(0 0% 89%) /* Desabilitado */;
}
```

### 5. ANIMATIONS - Timing & Easing

```css
@theme {
  /* Duration scale */
  --duration-instant: 0ms --duration-fastest: 75ms --duration-faster: 100ms
    --duration-fast: 150ms --duration-normal: 200ms --duration-slow: 300ms
    --duration-slower: 500ms --duration-slowest: 700ms /* Easing functions */
    --ease-in: cubic-bezier(0.4, 0, 1, 1) --ease-out: cubic-bezier(0, 0, 0.2, 1)
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
    --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### 6. OPACITY - Estados

```css
@theme {
  /* Opacity scale */
  --opacity-disabled: 0.5 --opacity-hover: 0.8 --opacity-active: 0.9
    --opacity-placeholder: 0.6;
}
```

---

## 🧩 COMPONENTES A ATUALIZAR/CRIAR

### 1. FormField - Melhorado

```typescript
// src/components/ui/FormFieldV2.tsx
interface FormFieldV2Props {
  // Estado de validação
  state?: 'idle' | 'valid' | 'invalid' | 'pending' | 'disabled'

  // Mensagens
  error?: string
  hint?: string
  helperText?: string
  successMessage?: string
  pendingMessage?: string

  // Ícones
  icon?: ReactNode
  showValidationIcon?: boolean

  // Loading state
  isLoading?: boolean

  // Tamanhos
  size?: 'sm' | 'md' | 'lg'

  // Acessibilidade
  aria-invalid?: boolean
  aria-describedby?: string
}

export function FormFieldV2({
  state = 'idle',
  error,
  hint,
  isLoading,
  ...props
}: FormFieldV2Props) {
  return (
    <div className={`
      transition-all duration-200
      ${state === 'valid' ? 'border-[var(--valid-color)]' : ''}
      ${state === 'invalid' ? 'border-[var(--invalid-color)] bg-[var(--invalid-bg)]' : ''}
      ${state === 'pending' ? 'border-[var(--pending-color)] bg-[var(--pending-bg)]' : ''}
      ${state === 'disabled' ? 'opacity-[var(--opacity-disabled)]' : ''}
    `}>
      {/* Input aqui */}
      {isLoading && <Spinner />}
      {state === 'valid' && <CheckIcon />}
      {state === 'invalid' && <AlertIcon />}
      {hint && <p className="text-sm text-hint">{hint}</p>}
      {error && <p className="text-sm text-[var(--invalid-color)]">{error}</p>}
    </div>
  )
}
```

### 2. FieldGroup - Novo

```typescript
// src/components/ui/FieldGroup.tsx
interface FieldGroupProps {
  label: string
  status?: 'idle' | 'valid' | 'invalid' | 'pending'
  description?: string
  children: ReactNode
}

export function FieldGroup({
  label,
  status = 'idle',
  description,
  children,
}: FieldGroupProps) {
  return (
    <fieldset className={`
      border border-[var(--border-default)] rounded-[var(--radius-md)]
      p-[var(--space-4)] gap-[var(--form-gap-normal)]
      transition-all duration-200
      ${status === 'valid' ? 'border-[var(--valid-color)]' : ''}
      ${status === 'invalid' ? 'border-[var(--invalid-color)]' : ''}
    `}>
      <legend className="text-sm font-600">
        {label}
        {status === 'valid' && <CheckIcon className="ml-2 text-[var(--valid-color)]" />}
        {status === 'invalid' && <AlertIcon className="ml-2 text-[var(--invalid-color)]" />}
      </legend>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      <div className="flex flex-col gap-[var(--form-gap-compact)]">
        {children}
      </div>
    </fieldset>
  )
}
```

### 3. Button - Novo com Variants

```typescript
// src/components/ui/Button.tsx (updated)
const buttonVariants = cva(
  `
    inline-flex items-center justify-center
    rounded-[var(--radius-md)]
    font-600 text-[var(--text-sm)]
    transition-all duration-[var(--duration-fast)]
    focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]
    disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-[hsl(var(--primary))]
          text-white
          hover:bg-[hsl(var(--primary))/0.9]
          active:bg-[hsl(var(--primary))/0.8]
        `,
        secondary: `
          bg-gray-200
          text-gray-900
          hover:bg-gray-300
          active:bg-gray-400
        `,
        ghost: `
          bg-transparent
          text-[hsl(var(--primary))]
          hover:bg-gray-100
          active:bg-gray-200
        `,
        danger: `
          bg-[var(--invalid-color)]
          text-white
          hover:bg-[var(--invalid-light)]
          active:bg-[var(--invalid-color)]/80
        `,
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
      isLoading: {
        true: "relative text-transparent",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
```

### 4. Alert/Toast - Novo para Feedback

```typescript
// src/components/ui/Alert.tsx
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  dismissible?: boolean
}

export function Alert({
  type,
  title,
  message,
  dismissible = true,
}: AlertProps) {
  const colorMap = {
    success: 'var(--valid-color)',
    error: 'var(--invalid-color)',
    warning: 'var(--pending-color)',
    info: 'hsl(var(--primary))',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 'var(--duration-fast)' }}
      className={`
        border-l-4 rounded-[var(--radius-md)]
        p-4 bg-${type}-lighter
        border-[${colorMap[type]}]
      `}
    >
      <div className="flex items-start gap-3">
        {type === 'success' && <CheckIcon />}
        {type === 'error' && <AlertIcon />}
        {type === 'warning' && <AlertCircleIcon />}
        {type === 'info' && <InfoIcon />}

        <div className="flex-1">
          {title && <h3 className="font-600">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>

        {dismissible && <CloseButton />}
      </div>
    </motion.div>
  )
}
```

---

## 🔄 ANIMAÇÕES NECESSÁRIAS

### 1. Validação Visual

```typescript
// src/lib/animations/validation.ts
export const validationAnimations = {
  // Quando campo fica válido
  validateSuccess: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.3,
    },
  },

  // Quando field fica inválido (shake)
  validateError: {
    animate: {
      x: [-4, 4, -4, 4, 0],
    },
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },

  // Quando está validando (pending)
  validatePending: {
    animate: {
      opacity: [1, 0.6, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
```

### 2. Transições de Feedback

```typescript
export const feedbackAnimations = {
  // Success message
  showSuccess: {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: "auto" },
    exit: { opacity: 0, y: -10, height: 0 },
    transition: { duration: 0.2 },
  },

  // Error message
  showError: {
    initial: { opacity: 0, y: 10, height: 0 },
    animate: { opacity: 1, y: 0, height: "auto" },
    exit: { opacity: 0, y: 10, height: 0 },
    transition: { duration: 0.2 },
  },

  // Loading spinner
  loadingSpinner: {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};
```

---

## 📋 CHECKLIST IMPLEMENTAÇÃO

### Antes de Sprint 1:

- [ ] Adicionar tokens CSS novos (`colors`, `spacing`, `animations`)
- [ ] Criar `src/lib/animations/` com presets
- [ ] Implementar `FormFieldV2` com estados
- [ ] Implementar `FieldGroup` component
- [ ] Implementar `Alert` component
- [ ] Atualizar `Button` com variants
- [ ] Criar `src/styles/themes/validation.css`
- [ ] Testar foco (focus rings)
- [ ] Testar contraste (accessibility)
- [ ] Documentar em Storybook

### Durante Sprint 1:

- [ ] Integrar `CnpjLookup` com `FormFieldV2`
- [ ] Integrar `useFormWithAutosave` com feedback visual
- [ ] Atualizar admin company page
- [ ] Testes end-to-end
- [ ] Performance testing

---

## 🎬 PRÓXIMAS AÇÕES

### Ação 1: Atualizar globals.css

```bash
# Adicionar novos tokens
# Fazer merge com existing tokens
```

### Ação 2: Criar arquivos de componentes

```bash
mkdir -p src/components/ui
touch src/components/ui/FormFieldV2.tsx
touch src/components/ui/FieldGroup.tsx
touch src/components/ui/Alert.tsx
touch src/lib/animations/validation.ts
```

### Ação 3: Setup Storybook

```bash
npx storybook@latest init
# Criar stories para novos componentes
```

### Ação 4: Executar Sprint 1

```
Semana de: 2-8 de dezembro
- Componentes base
- Tokens design system
- Integração admin/company
```

---

**Status:** ✅ Pronto para Implementação  
**Urgência:** 🔴 Alta  
**Estimativa:** 3-5 dias para foundation, 2 semanas para full integration
