# 🪝 Template de Hook Customizado Padronizado

> **Padrão obrigatório para todos os hooks customizados**

---

## 🎯 Estrutura Padrão

````typescript
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Opções do hook
 */
export interface Use[Feature]Options {
  // Parâmetros de configuração
  [param]: [Type];
  // Callbacks opcionais
  on[Action]?: ([param]: [Type]) => void;
}

/**
 * Retorno do hook
 */
export interface Use[Feature]Return {
  // Estados
  [state]: [Type];
  // Ações
  actions: {
    [action]: () => void;
  };
  // Status
  status: "idle" | "loading" | "success" | "error";
  // Erro
  error: Error | null;
}

/**
 * [Descrição do que o hook faz]
 *
 * @param options - Opções de configuração
 * @returns Objeto com estados, ações e status
 *
 * @example
 * ```typescript
 * const { data, actions: { fetch }, status } = use[Feature]({
 *   [param]: value,
 * });
 * ```
 */
export function use[Feature](options: Use[Feature]Options): Use[Feature]Return {
  // 1. Estados
  const [state, setState] = useState<[Type]>(initialValue);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  // 2. Refs (se necessário)
  const ref = useRef<[Type]>(initialValue);

  // 3. Efeitos
  useEffect(() => {
    // Lógica de efeito
  }, [deps]);

  // 4. Callbacks
  const handleAction = useCallback(async () => {
    try {
      setStatus("loading");
      // Lógica
      setStatus("success");
      options.on[Action]?.(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setStatus("error");
    }
  }, [deps, options]);

  // 5. Retorno
  return {
    [state]: state,
    actions: {
      [action]: handleAction,
    },
    status,
    error,
  };
}
````

---

## 📋 Checklist

- [ ] Interface de opções (`Use[Feature]Options`)
- [ ] Interface de retorno (`Use[Feature]Return`)
- [ ] Documentação JSDoc completa
- [ ] Exemplo de uso no JSDoc
- [ ] Estados organizados no início
- [ ] Efeitos após estados
- [ ] Callbacks com `useCallback`
- [ ] Tratamento de erros
- [ ] Status de loading/success/error
- [ ] TypeScript strict

---

## ✅ Exemplos de Hooks Padronizados

### useAutoSave

```typescript
export function useAutoSave(options: UseAutoSaveOptions): UseAutoSaveReturn {
  // ✅ Segue o padrão
}
```

### useDebounce

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  // ✅ Hook simples, mas padronizado
}
```

---

**Última atualização:** 2025-01-19

