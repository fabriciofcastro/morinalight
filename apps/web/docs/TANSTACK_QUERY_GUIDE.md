# TanStack Query - Guia de Uso

## 📚 Visão Geral

O projeto agora usa **TanStack Query** (React Query) para gerenciamento de estado do servidor, substituindo `useEffect` + `useState` por uma solução mais robusta e otimizada.

## 🎯 Benefícios

- ✅ **Cache automático** - Dados são cacheados e reutilizados
- ✅ **Refetch inteligente** - Atualiza dados quando necessário
- ✅ **Loading/Error states** - Estados gerenciados automaticamente
- ✅ **Optimistic updates** - UI atualiza antes da resposta
- ✅ **Retry automático** - Tenta novamente em caso de erro
- ✅ **Deduplicação** - Múltiplas requisições iguais são combinadas
- ✅ **DevTools** - Debug visual no desenvolvimento

## 🚀 Como Usar

### 1. Query (Buscar Dados)

```typescript
import { useUsers } from "@/hooks/queries";

function MyComponent() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) return <Loader />;
  if (error) return <Error />;

  return <UsersList users={data} />;
}
```

### 2. Mutation (Modificar Dados)

```typescript
import { useCreateUser } from "@/hooks/queries";

function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = async (data) => {
    try {
      await createUser.mutateAsync(data);
      toast.success("Usuário criado!");
    } catch (error) {
      toast.error("Erro ao criar usuário");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button disabled={createUser.isPending}>
        {createUser.isPending ? "Criando..." : "Criar"}
      </button>
    </form>
  );
}
```

### 3. Com Parâmetros

```typescript
const { data } = useUsers({ search: "john", page: 1, limit: 10 });
```

### 4. Infinite Scroll

```typescript
import { useInfiniteProducts } from "@/hooks/queries";

function ProductsList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProducts();

  return (
    <div>
      {data?.pages.map((page) =>
        page.map((product) => <ProductCard key={product.id} {...product} />)
      )}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
        {isFetchingNextPage ? "Carregando..." : "Carregar Mais"}
      </button>
    </div>
  );
}
```

### 5. Busca com Debounce

```typescript
import { useSearchProducts } from "@/hooks/queries";

function SearchProducts() {
  const [search, setSearch] = useState("");
  const { data } = useSearchProducts(search); // Auto-debounced!

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      {data?.map((product) => <ProductCard key={product.id} {...product} />)}
    </div>
  );
}
```

## 📦 Hooks Disponíveis

### Users
- `useUsers(params?)` - Listar usuários
- `useUser(id)` - Obter usuário
- `useCreateUser()` - Criar usuário
- `useUpdateUser()` - Atualizar usuário
- `useDeleteUser()` - Deletar usuário
- `useDeleteManyUsers()` - Deletar múltiplos

### Products
- `useProducts(params?)` - Listar produtos
- `useInfiniteProducts(params?)` - Infinite scroll
- `useProduct(id)` - Obter produto
- `useSearchProducts(search)` - Busca com debounce
- `useCreateProduct()` - Criar produto
- `useUpdateProduct()` - Atualizar produto
- `useDeleteProduct()` - Deletar produto

### Organizations
- `useOrganizations(params?)` - Listar organizações
- `useOrganization(id)` - Obter organização
- `useCurrentOrganization()` - Organização atual
- `useCreateOrganization()` - Criar organização
- `useUpdateOrganization()` - Atualizar organização

### Auth
- `useAuthUser()` - Usuário autenticado
- `useIsAuthenticated()` - Status de autenticação
- `useLogin()` - Fazer login
- `useLogout()` - Fazer logout
- `useSession()` - Verificar sessão
- `useRefreshToken()` - Refresh token

### Permissions
- `useUserPermissions(userId)` - Permissões do usuário
- `useRolePermissions(roleId)` - Permissões da role
- `useHasPermission(userId, resource, action)` - Verificar permissão

### Notifications
- `useNotifications(params?)` - Listar notificações
- `useUnreadNotifications()` - Não lidas (auto-refetch 30s)
- `useUnreadCount()` - Contador de não lidas
- `useMarkNotificationAsRead()` - Marcar como lida
- `useMarkAllNotificationsAsRead()` - Marcar todas
- `useDeleteNotification()` - Deletar notificação

## 🎨 Padrões de Uso

### Loading State

```typescript
const { data, isLoading } = useUsers();

if (isLoading) {
  return <Skeleton />;
}
```

### Error State

```typescript
const { data, error } = useUsers();

if (error) {
  return <ErrorDisplay error={error} />;
}
```

### Optimistic Update

```typescript
const updateUser = useUpdateUser();

await updateUser.mutateAsync(
  { id, data },
  {
    onMutate: async (variables) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ["users", id] });

      // Snapshot do valor anterior
      const previousUser = queryClient.getQueryData(["users", id]);

      // Atualizar otimisticamente
      queryClient.setQueryData(["users", id], variables.data);

      return { previousUser };
    },
    onError: (err, variables, context) => {
      // Reverter em caso de erro
      queryClient.setQueryData(["users", id], context.previousUser);
    },
  }
);
```

### Dependent Queries

```typescript
const { data: user } = useUser(userId);
const { data: permissions } = useUserPermissions(user?.id, !!user);
```

## 🔧 Configurações

### Por Tipo de Dado

```typescript
// Dados estáticos (mudam raramente)
...queryConfigs.static // 30min cache

// Dados em tempo real
...queryConfigs.realtime // 30s cache, refetch a cada 30s

// Dados paginados
...queryConfigs.paginated // 2min cache, keepPreviousData
```

### Custom

```typescript
useQuery({
  queryKey: ["custom"],
  queryFn: fetchData,
  staleTime: 10 * 60 * 1000, // 10 minutos
  cacheTime: 30 * 60 * 1000, // 30 minutos
  retry: 5,
  refetchInterval: 60 * 1000, // Refetch a cada 1 minuto
});
```

## 🐛 DevTools

Em desenvolvimento, pressione **Ctrl+Shift+D** para abrir o React Query Devtools e visualizar:
- Queries ativas
- Estado do cache
- Tempo de stale/fresh
- Refetch automático

## 📝 Criar Novos Hooks

```typescript
// 1. Criar API client
const myApi = createTypedApiClient<MyType>("/my-endpoint");

// 2. Criar query hook
export function useMyData(params?) {
  return useQuery({
    queryKey: ["my-data", params],
    queryFn: () => myApi.list(params),
  });
}

// 3. Criar mutation hook
export function useCreateMyData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => myApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-data"] });
    },
  });
}
```

## ⚡ Performance Tips

1. **Use enabled** para queries condicionais
2. **Use select** para transformar dados
3. **Use keepPreviousData** para paginação
4. **Use placeholderData** para UX melhor
5. **Invalide queries específicas**, não todas

## 🚫 Anti-Patterns

❌ **Não fazer fetch manual**
```typescript
// Ruim
useEffect(() => {
  fetch("/api/users").then(setUsers);
}, []);

// Bom
const { data: users } = useUsers();
```

❌ **Não duplicar estado**
```typescript
// Ruim
const { data } = useUsers();
const [users, setUsers] = useState(data);

// Bom
const { data: users } = useUsers();
```

❌ **Não invalidar tudo**
```typescript
// Ruim
queryClient.invalidateQueries();

// Bom
queryClient.invalidateQueries({ queryKey: ["users"] });
```
