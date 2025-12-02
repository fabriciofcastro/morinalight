# 🚀 DESIGN SYSTEM - CÓDIGO PRONTO PARA IMPLEMENTAR

**Status:** ✅ Pronto para copiar/colar  
**Data:** 2 de dezembro de 2025  
**Tempo Estimado de Implementação:** 3-5 horas

---

## 📋 RESUMO DO QUE FAZER

1. **Atualizar** `src/app/globals.css` (adicionar tokens)
2. **Criar** `src/lib/animations/validation.ts` (presets Framer Motion)
3. **Criar** `src/components/ui/FormFieldV2.tsx` (novo componente)
4. **Testar** no browser (foco, validação, animações)

**Total:** ~300 linhas de novo código

---

## 1️⃣ PASSO 1 - Atualizar globals.css

### Onde Editar

`/apps/web/src/app/globals.css`

### O Que Adicionar

Adicione ao **final do arquivo**, antes do `}` final:

```css
/* ============================================
   VALIDATION COLORS & STATES
   ============================================ */

/* Valid state - Verde */
:root {
  --valid-color: hsl(158 72% 55%);
  --valid-light: hsl(158 72% 85%);
  --valid-lighter: hsl(158 72% 95%);
  --valid-bg: hsl(158 72% 95% / 0.5);
  --valid-border: hsl(158 72% 55%);
}

[data-theme="dark"] {
  --valid-color: hsl(158 72% 55%);
  --valid-light: hsl(158 72% 35%);
  --valid-lighter: hsl(158 72% 25%);
  --valid-bg: hsl(158 72% 30% / 0.3);
}

/* Invalid state - Vermelho */
:root {
  --invalid-color: hsl(0 82% 60%);
  --invalid-light: hsl(0 82% 85%);
  --invalid-lighter: hsl(0 82% 95%);
  --invalid-bg: hsl(0 82% 95% / 0.5);
  --invalid-border: hsl(0 82% 60%);
}

[data-theme="dark"] {
  --invalid-color: hsl(0 82% 60%);
  --invalid-light: hsl(0 82% 35%);
  --invalid-lighter: hsl(0 82% 25%);
  --invalid-bg: hsl(0 82% 30% / 0.3);
}

/* Pending state - Amarelo */
:root {
  --pending-color: hsl(45 100% 60%);
  --pending-light: hsl(45 100% 80%);
  --pending-lighter: hsl(45 100% 95%);
  --pending-bg: hsl(45 100% 95% / 0.5);
}

[data-theme="dark"] {
  --pending-color: hsl(45 100% 60%);
  --pending-light: hsl(45 100% 35%);
  --pending-lighter: hsl(45 100% 25%);
  --pending-bg: hsl(45 100% 30% / 0.3);
}

/* Disabled state */
:root {
  --disabled-color: hsl(0 0% 64%);
  --disabled-bg: hsl(0 0% 94%);
  --disabled-text: hsl(0 0% 45%);
  --disabled-opacity: 0.5;
}

[data-theme="dark"] {
  --disabled-color: hsl(0 0% 45%);
  --disabled-bg: hsl(0 0% 20%);
  --disabled-text: hsl(0 0% 50%);
}

/* ============================================
   ANIMATION TIMING SCALE
   ============================================ */

:root {
  --duration-instant: 0ms;
  --duration-fastest: 75ms;
  --duration-faster: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --duration-slowest: 700ms;
}

/* ============================================
   EASING FUNCTIONS
   ============================================ */

:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* ============================================
   FOCUS RING STYLES
   ============================================ */

:root {
  --focus-ring-offset: 2px;
  --focus-ring-width: 2px;
  --focus-ring-color: hsl(227 100% 58%);
}

@layer base {
  *:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
}

/* ============================================
   BORDER WIDTH SCALE
   ============================================ */

:root {
  --border-0: 0px;
  --border-1: 1px;
  --border-2: 2px;
  --border-3: 3px;
}

/* ============================================
   RADIUS SCALE (MELHORADO)
   ============================================ */

:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
}

/* ============================================
   OPACITY SCALE
   ============================================ */

:root {
  --opacity-disabled: 0.5;
  --opacity-hover: 0.8;
  --opacity-active: 0.9;
  --opacity-placeholder: 0.6;
}

/* ============================================
   SPACING PRESETS FOR FORMS
   ============================================ */

:root {
  --form-gap-compact: 8px;
  --form-gap-normal: 16px;
  --form-gap-loose: 24px;
  --field-label-gap: 4px;
  --input-py: 10px;
  --input-px: 12px;
  --input-height: 40px;
}
```

---

## 2️⃣ PASSO 2 - Criar Animation Presets

### Criar Arquivo

`/apps/web/src/lib/animations/validation.ts`

### Conteúdo

```typescript
import { Variants } from "framer-motion";

/**
 * Animation presets for form validation feedback
 * Use em componentes com <motion.div {...validationAnimations.validateSuccess}>
 */

export const validationAnimations = {
  /**
   * Quando field passa em validação
   * - Icon aparece com scale-in + rotate
   */
  validateSuccess: {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 0, rotate: 180, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      duration: 0.3,
    },
  } as Variants,

  /**
   * Quando field falha validação
   * - Shake animation
   */
  validateError: {
    animate: {
      x: [-4, 4, -4, 4, 0],
    },
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  } as Variants,

  /**
   * Quando está validando (pending)
   * - Pulse opacity
   */
  validatePending: {
    animate: {
      opacity: [1, 0.6, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  } as Variants,

  /**
   * Mensagem de sucesso aparece
   */
  showSuccess: {
    initial: { opacity: 0, y: -10, height: 0 },
    animate: { opacity: 1, y: 0, height: "auto" },
    exit: { opacity: 0, y: -10, height: 0 },
    transition: { duration: 0.2 },
  } as Variants,

  /**
   * Mensagem de erro aparece
   */
  showError: {
    initial: { opacity: 0, y: 10, height: 0 },
    animate: { opacity: 1, y: 0, height: "auto" },
    exit: { opacity: 0, y: 10, height: 0 },
    transition: { duration: 0.2 },
  } as Variants,

  /**
   * Loading spinner
   */
  loadingSpinner: {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  } as Variants,

  /**
   * Field group border highlight
   */
  highlightBorder: {
    animate: {
      boxShadow: [
        "0 0 0 0px hsl(227 100% 58% / 0)",
        "0 0 0 3px hsl(227 100% 58% / 0.1)",
        "0 0 0 0px hsl(227 100% 58% / 0)",
      ],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  } as Variants,
};

/**
 * Presets para diferentes estados
 */
export const stateAnimations = {
  idle: {},
  valid: validationAnimations.validateSuccess,
  invalid: validationAnimations.validateError,
  pending: validationAnimations.validatePending,
  disabled: { opacity: 0.5 },
};
```

---

## 3️⃣ PASSO 3 - Criar FormFieldV2

### Criar Arquivo

`/apps/web/src/components/ui/FormFieldV2.tsx`

### Conteúdo

```typescript
import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validationAnimations } from '@/lib/animations/validation';

export type FormFieldV2State = 'idle' | 'valid' | 'invalid' | 'pending' | 'disabled';

interface FormFieldV2Props extends React.InputHTMLAttributes<HTMLInputElement> {
  // Label e descrição
  label?: string;
  hint?: string;
  helperText?: string;

  // Estado de validação
  state?: FormFieldV2State;
  error?: string;
  successMessage?: string;
  pendingMessage?: string;

  // Ícones
  icon?: ReactNode;
  showValidationIcon?: boolean;

  // Loading
  isLoading?: boolean;

  // Tamanho
  size?: 'sm' | 'md' | 'lg';

  // Container className
  containerClassName?: string;
}

export const FormFieldV2 = React.forwardRef<
  HTMLInputElement,
  FormFieldV2Props
>(
  (
    {
      label,
      hint,
      helperText,
      state = 'idle',
      error,
      successMessage,
      pendingMessage,
      icon,
      showValidationIcon = true,
      isLoading = false,
      size = 'md',
      containerClassName,
      className,
      disabled,
      ...inputProps
    },
    ref
  ) => {
    // Determinar estado visual
    const visualState = disabled ? 'disabled' : state;
    const isInvalid = visualState === 'invalid';
    const isValid = visualState === 'valid';
    const isPending = visualState === 'pending' || isLoading;

    // Mapa de tamanhos
    const sizeClasses = {
      sm: 'h-8 px-2 text-xs',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    };

    // Cores por estado
    const borderColorClass = {
      idle: 'border-gray-300',
      valid: 'border-[var(--valid-color)]',
      invalid: 'border-[var(--invalid-color)]',
      pending: 'border-[var(--pending-color)]',
      disabled: 'border-gray-200',
    }[visualState];

    const bgColorClass = {
      idle: 'bg-white',
      valid: 'bg-white',
      invalid: 'bg-[var(--invalid-lighter)]',
      pending: 'bg-[var(--pending-lighter)]',
      disabled: 'bg-gray-50',
    }[visualState];

    return (
      <div className={cn('w-full flex flex-col gap-[var(--field-label-gap)]', containerClassName)}>
        {/* Label */}
        {label && (
          <label className="text-sm font-500 text-gray-900">
            {label}
            {inputProps.required && <span className="text-[var(--invalid-color)] ml-1">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <motion.div
          className={cn(
            'relative inline-flex items-center',
            'border rounded-[var(--radius-md)]',
            'transition-colors duration-[var(--duration-fast)]',
            borderColorClass,
            bgColorClass
          )}
          animate={
            isInvalid
              ? 'shake'
              : isPending
              ? 'pending'
              : isValid
              ? 'valid'
              : 'idle'
          }
          variants={{
            idle: {},
            valid: {},
            pending: {
              opacity: [1, 0.8, 1],
            },
            shake: {
              x: [-4, 4, -4, 4, 0],
            },
          }}
          transition={{ duration: 0.4 }}
        >
          {/* Left Icon */}
          {icon && !showValidationIcon && (
            <div className="pl-3 text-gray-400 flex-shrink-0">{icon}</div>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex-1 bg-transparent border-0 outline-none',
              'placeholder:text-gray-400',
              'disabled:opacity-[var(--opacity-disabled)] disabled:cursor-not-allowed',
              sizeClasses[size],
              'px-3',
              className
            )}
            {...inputProps}
          />

          {/* Right Icon - Validation Status */}
          {showValidationIcon && (
            <AnimatePresence mode="wait">
              {isValid && (
                <motion.div
                  key="valid"
                  {...validationAnimations.validateSuccess}
                  className="pr-3 text-[var(--valid-color)] flex-shrink-0"
                >
                  <Check size={18} />
                </motion.div>
              )}
              {isInvalid && !isLoading && (
                <motion.div
                  key="invalid"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="pr-3 text-[var(--invalid-color)] flex-shrink-0"
                >
                  <AlertCircle size={18} />
                </motion.div>
              )}
              {isPending && (
                <motion.div
                  key="loading"
                  {...validationAnimations.loadingSpinner}
                  className="pr-3 text-[var(--pending-color)] flex-shrink-0"
                >
                  <Loader2 size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Helper Text or Hint */}
        <AnimatePresence>
          {hint && !error && !successMessage && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-gray-500"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              {...validationAnimations.showError}
              className="text-xs text-[var(--invalid-color)] font-500"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.p
              {...validationAnimations.showSuccess}
              className="text-xs text-[var(--valid-color)] font-500"
            >
              {successMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Pending Message */}
        <AnimatePresence>
          {pendingMessage && isPending && (
            <motion.p
              {...validationAnimations.showSuccess}
              className="text-xs text-[var(--pending-color)] font-500"
            >
              {pendingMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        {helperText && !error && !isInvalid && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormFieldV2.displayName = 'FormFieldV2';
```

---

## 4️⃣ PASSO 4 - Testar no Navegador

### Teste 1: Validação em Tempo Real

```tsx
// Crie um arquivo de teste: src/app/test-formfield/page.tsx

import { FormFieldV2 } from "@/components/ui/FormFieldV2";
import { useState } from "react";

export default function TestFormField() {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "valid" | "invalid" | "pending">(
    "idle",
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);

    if (!val) {
      setState("idle");
      return;
    }

    if (val.length < 3) {
      setState("invalid");
      return;
    }

    setState("pending");
    setTimeout(() => setState("valid"), 500);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">FormFieldV2 Test</h1>

      <FormFieldV2
        label="Email"
        placeholder="Digite seu email"
        value={value}
        onChange={handleChange}
        state={state}
        error={state === "invalid" ? "Mínimo 3 caracteres" : undefined}
        successMessage={state === "valid" ? "Email válido!" : undefined}
        pendingMessage={state === "pending" ? "Validando..." : undefined}
        hint="Digite algo para testar"
        showValidationIcon
      />
    </div>
  );
}
```

### Teste 2: Focus Ring

Abra o navegador e pressione **Tab** - deverá ver um outline azul ao redor do input.

### Teste 3: Estados

- Vazio: Sem ícone
- 1-2 caracteres: ❌ Vermelho + shake
- 3+ caracteres: ⏳ Amarelo + loading
- Aguarde 500ms: ✅ Verde + success

---

## 📊 RESULTADO ESPERADO

```
ANTES:
┌─────────────────────┐
│ [____________]      │
│ Sem feedback        │
│ Erro após submit    │
└─────────────────────┘

DEPOIS:
┌────────────────────────────┐
│ Email                  *   │
│ [___________] ✅ Válido    │
│ Email válido!              │
│ Digite seu email aqui      │
└────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

**Antes de começar:**

- [ ] Backup dos arquivos originais
- [ ] Estar na branch correta (ex: `develop`)

**Implementar:**

- [ ] Passo 1: Adicionar tokens ao globals.css ✅
- [ ] Passo 2: Criar validation.ts ✅
- [ ] Passo 3: Criar FormFieldV2.tsx ✅
- [ ] Passo 4: Testar no navegador ✅

**Testar:**

- [ ] Focus ring visível (Tab)
- [ ] Validação funcionando (onChange)
- [ ] Animações smooth (60fps)
- [ ] Mensagens aparecem/desaparecem
- [ ] Estados (valid, invalid, pending) funcionam
- [ ] Mobile responsive

**Finalizar:**

- [ ] Commit: `feat: add design system enhancements`
- [ ] PR review
- [ ] Merge para develop
- [ ] Deploy para staging

---

## 🎯 PRÓXIMOS PASSOS

Após implementar:

1. **Integrar** em admin/company page
2. **Criar** FieldGroup e Button components
3. **Testar** acessibilidade completa (WCAG AA)
4. **Documentar** em Storybook
5. **Deploy** para produção

---

**Status:** ✅ Código Pronto para Implementar  
**Tempo:** 3-5 horas  
**Risco:** Baixo (código isolado, sem breaking changes)
