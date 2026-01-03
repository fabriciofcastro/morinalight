# Otimizações e Performance - Documentação

## 📋 Visão Geral

Este documento descreve as otimizações de performance implementadas no projeto MORINA.

## ⚡ Hooks de Performance

### useDebounce

Localização: `apps/web/src/hooks/use-debounce.ts`

**Uso**: Debounce de valores (útil para buscas)

```typescript
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  // Buscar apenas após 300ms sem digitação
  void performSearch(debouncedSearch);
}, [debouncedSearch]);
```

### useThrottle

Localização: `apps/web/src/hooks/use-throttle.ts`

**Uso**: Throttle de funções (limita frequência de execução)

```typescript
const handleScroll = useThrottle((event) => {
  // Executa no máximo a cada 300ms
  updateScrollPosition(event);
}, 300);
```

## 🎨 Componentes de Estado

### EmptyState

Localização: `apps/web/src/components/ui/EmptyState.tsx`

**Uso**: Estado vazio informativo

```typescript
<EmptyState
  icon={Users}
  title="Nenhum usuário encontrado"
  description="Crie seu primeiro usuário para começar"
  action={{
    label: "Criar Usuário",
    onClick: handleCreate,
  }}
/>
```

### LoadingState

Localização: `apps/web/src/components/ui/LoadingState.tsx`

**Uso**: Estado de carregamento

```typescript
<LoadingState message="Carregando usuários..." size="lg" />
```

### ErrorState

Localização: `apps/web/src/components/ui/ErrorState.tsx`

**Uso**: Estado de erro com retry

```typescript
<ErrorState
  title="Erro ao carregar"
  message="Não foi possível carregar os dados"
  onRetry={handleRetry}
/>
```

## 🔧 Utilitários de Performance

Localização: `apps/web/src/lib/utils/performance.ts`

### memoize

Memoização de resultados de funções pesadas

```typescript
const expensiveCalculation = memoize((input: number) => {
  // Cálculo pesado
  return result;
});
```

### debounce

Debounce de funções

```typescript
const debouncedSearch = debounce((query: string) => {
  performSearch(query);
}, 300);
```

### throttle

Throttle de funções

```typescript
const throttledScroll = throttle((event: Event) => {
  handleScroll(event);
}, 100);
```

### getVisibleRange

Helper para virtualização de listas

```typescript
const { start, end } = getVisibleRange(
  scrollTop,
  itemHeight,
  containerHeight,
  totalItems,
);
```

## 📊 Boas Práticas Implementadas

### 1. Lazy Loading

- Componentes pesados devem usar `React.lazy()`
- Suspense boundaries para loading states

### 2. Memoização

- `useMemo` para cálculos pesados
- `useCallback` para funções passadas como props
- `React.memo` para componentes que re-renderizam frequentemente

### 3. Debounce em Buscas

- Todas as buscas devem usar `useDebounce`
- Delay padrão: 300ms

### 4. Virtualização

- Listas com mais de 100 itens devem usar virtualização
- Helper `getVisibleRange` disponível

### 5. Code Splitting

- Rotas devem usar lazy loading
- Componentes pesados devem ser code-split

## 🎯 Métricas de Performance

### Objetivos

- Carregamento inicial: < 3s
- Interações: < 1s
- Time to Interactive (TTI): < 3.5s
- First Contentful Paint (FCP): < 1.8s

### Monitoramento

- Usar React DevTools Profiler
- Lighthouse para métricas gerais
- Web Vitals para métricas reais

## 🔄 Próximas Otimizações

1. Implementar virtualização em listas longas
2. Adicionar service worker para cache
3. Otimizar imagens (WebP, lazy loading)
4. Implementar prefetching de rotas
5. Adicionar bundle analysis
