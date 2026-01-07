# GitHub Copilot - Instruções Globais

## Stack
Next.js 16 (App Router) + React 19 + TypeScript strict

## Estrutura FSD
features/nome-feature/
├── ui/ (componentes)
├── model/ (hooks, validação)
├── api/ (queries, mutations)
└── index.ts

## Padrões

### Custom Hooks
```typescript
export function useFeature() {
  const mutation = useMutation({ mutationFn: action });
  return { handleAction: mutation.mutate, isLoading: mutation.isPending };
}
```

### TanStack Query
```typescript
export const keys = {
  all: ['resource'] as const,
  detail: (id: string) => [...keys.all, id] as const,
};
```

### Error Handling
```typescript
try {
  const result = await action();
  return { success: true, data: result };
} catch (error) {
  log.error('Action failed', error);
  return { success: false, error: 'Mensagem' };
}
```

### Logging
```typescript
import { log } from '@/shared/lib/logger';
log.info('Event', { meta });
```