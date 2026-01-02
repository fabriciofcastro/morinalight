# Guia de Performance

## 🚀 Visão Geral

O projeto implementa múltiplas estratégias de otimização de performance para garantir uma experiência fluida e responsiva.

---

## 📦 Lazy Loading

### Lazy Load Básico

```typescript
import { lazyWithRetry, DefaultLoadingFallback } from "@/lib/performance";
import { Suspense } from "react";

// Lazy load com retry automático
const HeavyComponent = lazyWithRetry(
  () => import("@/components/heavy-component"),
  3, // 3 tentativas em caso de falha
);

function MyPage() {
  return (
    <Suspense fallback={<DefaultLoadingFallback />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Lazy Load com Prefetch

```typescript
import { lazyWithPrefetch, prefetchComponent } from "@/lib/performance";

const Dashboard = lazyWithPrefetch(() => import("@/components/dashboard"));

// Prefetch ao passar o mouse
function NavLink() {
  return (
    <a
      href="/dashboard"
      onMouseEnter={() => prefetchComponent(Dashboard)}
    >
      Dashboard
    </a>
  );
}
```

### Lazy Load On Viewport

```typescript
import { useLazyLoadOnViewport } from "@/lib/performance";

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);

  useLazyLoadOnViewport(
    () => import("@/components/heavy-chart"),
    ref,
  );

  return <div ref={ref}>Chart will load when visible</div>;
}
```

---

## 🎯 Memoization

### Memo Básico

```typescript
import { memo } from "react";

const UserCard = memo(({ user }) => {
  return <div>{user.name}</div>;
});
```

### Memo para Lista

```typescript
import { memoListItem } from "@/lib/performance";

interface ItemProps {
  id: string;
  name: string;
}

// Compara apenas o ID
const ListItem = memoListItem<ItemProps>(({ id, name }) => {
  return <div>{name}</div>;
});
```

### Memo com Comparador Customizado

```typescript
import { memoWith } from "@/lib/performance";

const ExpensiveComponent = memoWith(
  MyComponent,
  (prevProps, nextProps) => {
    // Retornar true se props são iguais (não deve re-renderizar)
    return prevProps.data.id === nextProps.data.id;
  },
);
```

### Memo Apenas Props Específicas

```typescript
import { memoOnly } from "@/lib/performance";

// Re-renderiza apenas se 'id' ou 'name' mudarem
const UserCard = memoOnly(
  MyComponent,
  ['id', 'name'], // Props para comparar
);
```

### Debug de Re-renders

```typescript
import { memoDebug, useWhyDidYouUpdate } from "@/lib/performance";

// Opção 1: Memo com debug
const DebuggedComponent = memoDebug(MyComponent, "MyComponent");

// Opção 2: Hook para debug
function MyComponent(props) {
  useWhyDidYouUpdate("MyComponent", props);
  // Console mostrará quais props mudaram
}
```

---

## 📜 Virtual Scrolling

### Virtual List Component

```typescript
import { VirtualList } from "@/lib/performance";

function MyList() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
  }));

  return (
    <VirtualList
      items={items}
      itemHeight={50}
      renderItem={(item) => (
        <div className="border-b p-4">
          {item.name}
        </div>
      )}
    />
  );
}
```

### Virtual Scroll Hook

```typescript
import { useVirtualScroll } from "@/lib/performance";

function CustomVirtualList() {
  const items = [...]; // Seus itens

  const { virtualItems, totalHeight, containerRef, scrollToIndex } = 
    useVirtualScroll(items, {
      itemHeight: 60,
      overscan: 5, // Itens extras para renderizar
    });

  return (
    <div>
      <button onClick={() => scrollToIndex(500)}>
        Scroll to item 500
      </button>

      <div ref={containerRef} className="h-[600px] overflow-auto">
        <div style={{ height: `${totalHeight}px` }}>
          {virtualItems.map(({ index, data, style }) => (
            <div key={index} style={style}>
              {data.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## ⏱️ Debounce & Throttle

### Debounce

```typescript
import { useDebounce } from "@/lib/performance";

function SearchInput() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    // Executado apenas 300ms após parar de digitar
    if (debouncedSearch) {
      fetchResults(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
}
```

### Throttle

```typescript
import { useThrottle } from "@/lib/performance";

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  const throttledScrollY = useThrottle(scrollY, 100);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Atualizado no máximo a cada 100ms
  return <div>Scroll: {throttledScrollY}</div>;
}
```

---

## 📊 Performance Monitoring

### Render Time

```typescript
import { useRenderTime } from "@/lib/performance";

function MyComponent() {
  useRenderTime("MyComponent");
  // Console mostrará tempo de cada render
  // Aviso se > 16ms (60fps)
}
```

### FPS Monitor

```typescript
import { useFPS } from "@/lib/performance";

function FPSDisplay() {
  const fps = useFPS();
  
  return (
    <div className={fps < 30 ? "text-red-500" : "text-green-500"}>
      FPS: {fps}
    </div>
  );
}
```

### Performance Marks

```typescript
import { usePerformanceMark } from "@/lib/performance";

function DataProcessor() {
  const { mark, measure } = usePerformanceMark();

  const processData = () => {
    mark('process-start');
    
    // Processamento pesado
    heavyComputation();
    
    mark('process-end');
    const duration = measure('data-processing', 'process-start', 'process-end');
    
    console.log(`Processing took ${duration}ms`);
  };
}
```

### Heavy Computation Detection

```typescript
import { useHeavyMemo } from "@/lib/performance";

function MyComponent({ data }) {
  const processedData = useHeavyMemo(
    () => {
      // Computação pesada
      return data.map(item => expensiveTransform(item));
    },
    [data],
    "data-processing", // Nome para debug
  );
  // Aviso se computação > 16ms
}
```

---

## 🎨 Best Practices

### 1. Use Lazy Loading para Rotas

```typescript
// ✅ Bom
const AdminDashboard = lazyWithRetry(() => import("@/app/admin/dashboard"));

// ❌ Ruim
import AdminDashboard from "@/app/admin/dashboard"; // Bundle grande
```

### 2. Memoize Componentes de Lista

```typescript
// ✅ Bom
const ListItem = memoListItem(({ id, name }) => <div>{name}</div>);

// ❌ Ruim
const ListItem = ({ id, name }) => <div>{name}</div>; // Re-render em toda mudança
```

### 3. Use Virtual Scrolling para Listas Grandes

```typescript
// ✅ Bom - Renderiza apenas itens visíveis
<VirtualList items={10000items} itemHeight={50} renderItem={...} />

// ❌ Ruim - Renderiza todos os 10000 itens
{items.map(item => <div>{item.name}</div>)}
```

### 4. Debounce em Inputs de Busca

```typescript
// ✅ Bom
const debouncedSearch = useDebounce(search, 300);

// ❌ Ruim
useEffect(() => {
  fetchResults(search); // Requisição a cada tecla
}, [search]);
```

### 5. Use useCallback para Funções Passadas como Props

```typescript
// ✅ Bom
const handleClick = useCallback(() => {
  doSomething();
}, []);

// ❌ Ruim
const handleClick = () => doSomething(); // Nova função a cada render
```

### 6. Memoize Valores Computados

```typescript
// ✅ Bom
const filteredItems = useMemo(
  () => items.filter(item => item.active),
  [items]
);

// ❌ Ruim
const filteredItems = items.filter(item => item.active); // Recomputa sempre
```

---

## 📈 Performance Checklist

- [ ] Lazy load de rotas implementado
- [ ] Componentes de lista memoizados
- [ ] Virtual scrolling em listas > 100 itens
- [ ] Debounce em inputs de busca
- [ ] useCallback em event handlers
- [ ] useMemo em computações pesadas
- [ ] Imagens otimizadas (next/image)
- [ ] Bundle analyzer executado
- [ ] Lighthouse score > 90

---

## 🔧 Ferramentas de Debug

### React DevTools Profiler

1. Abrir React DevTools
2. Ir para aba "Profiler"
3. Clicar em "Record"
4. Interagir com a aplicação
5. Parar gravação
6. Analisar componentes que re-renderizam

### Bundle Analyzer

```bash
ANALYZE=true pnpm build
```

### Performance Tab (Chrome)

1. Abrir DevTools
2. Ir para aba "Performance"
3. Gravar interação
4. Analisar:
   - Scripting time
   - Rendering time
   - Painting time

---

## 🎯 Metas de Performance

| Métrica | Meta | Como Medir |
|---------|------|------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| FPS | > 60 | useFPS() |
| Bundle Size | < 300KB | Bundle Analyzer |

---

## 📚 Recursos

- [React Performance](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
