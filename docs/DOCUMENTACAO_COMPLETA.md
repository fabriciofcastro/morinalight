# 📚 Documentação Completa - MORINA

## 📁 Estrutura de Pastas

### Frontend (`apps/web/src/`)

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Rotas autenticadas
│   │   ├── settings/             # Configurações
│   │   │   ├── users/           # Gerenciamento de usuários
│   │   │   ├── company/         # Dados da empresa
│   │   │   ├── permissions/     # Permissões e RBAC
│   │   │   └── ...
│   │   ├── profile/             # Perfil do usuário
│   │   └── ...
│   ├── (auth)/                   # Rotas de autenticação
│   │   ├── login/
│   │   └── select-organization/
│   └── api/                      # API Routes (proxy para backend)
│       ├── users/
│       ├── notifications/
│       └── ...
├── components/                   # Componentes React
│   ├── ui/                       # Componentes de UI genéricos
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── HelpText.tsx
│   │   └── ...
│   ├── layout/                   # Componentes de layout
│   ├── settings/                 # Componentes de configurações
│   ├── users/                   # Componentes de usuários
│   └── ...
├── hooks/                        # React Hooks customizados
│   ├── use-debounce.ts
│   ├── use-throttle.ts
│   └── ...
├── lib/                          # Bibliotecas e utilitários
│   ├── validators/               # Validadores brasileiros
│   │   ├── brazilian.ts
│   │   ├── upload.ts
│   │   └── zod-schemas.ts
│   ├── hooks/                    # Hooks utilitários
│   │   └── use-keyboard-shortcuts.ts
│   ├── utils/                    # Utilitários gerais
│   │   ├── performance.ts
│   │   └── code-splitting.ts
│   └── ...
└── ...
```

### Backend (`apps/api/src/`)

```
apps/api/src/
├── modules/                      # Módulos de domínio
│   ├── users/                    # Módulo de usuários
│   │   ├── application/          # Use cases
│   │   ├── domain/               # Entidades e repositórios
│   │   ├── http/                 # Rotas HTTP
│   │   └── infra/               # Implementações (Prisma)
│   ├── notifications/            # Módulo de notificações
│   ├── permissions/              # Módulo de permissões
│   └── ...
├── core/                         # Core da aplicação
│   ├── middleware/               # Middlewares
│   │   ├── rate-limit.middleware.ts
│   │   ├── sanitize.middleware.ts
│   │   ├── security-headers.middleware.ts
│   │   └── permission-check.middleware.ts
│   ├── server/                   # Configuração do servidor
│   └── ...
└── ...
```

---

## 🧩 Componentes Principais

### Componentes de UI Genéricos

#### `EmptyState`
Exibe estado vazio quando não há dados.

```tsx
import { EmptyState } from "@/components/ui";

<EmptyState
  icon={User}
  title="Nenhum usuário encontrado"
  description="Não há usuários cadastrados no sistema"
  action={{
    label: "Criar usuário",
    onClick: () => handleCreate(),
  }}
/>
```

#### `LoadingState`
Exibe estado de carregamento.

```tsx
import { LoadingState } from "@/components/ui";

<LoadingState message="Carregando dados..." size="lg" />
```

#### `ErrorState`
Exibe estado de erro com opção de retry.

```tsx
import { ErrorState } from "@/components/ui";

<ErrorState
  title="Erro ao carregar"
  message="Não foi possível carregar os dados"
  onRetry={() => refetch()}
/>
```

#### `HelpText` / `HelpTextWithTooltip`
Exibe texto de ajuda contextual.

```tsx
import { HelpText, HelpTextWithTooltip } from "@/components/ui";

<HelpText text="Este campo é obrigatório" variant="info" />

<HelpTextWithTooltip
  text="CPF válido"
  tooltip="Digite o CPF sem pontos e traços"
  variant="default"
/>
```

### Componentes de Layout

#### `SettingsLayout`
Layout base para páginas de configurações.

```tsx
import { SettingsLayout } from "@/components/settings/SettingsLayout";

<SettingsLayout
  title="Usuários"
  description="Gerencie usuários do sistema"
  showBackButton
  backHref="/settings"
>
  {/* Conteúdo */}
</SettingsLayout>
```

#### `SettingsHeader`
Header genérico para páginas de configurações.

```tsx
import { SettingsHeader } from "@/components/settings/SettingsHeader";

<SettingsHeader
  title="Configurações"
  description="Gerencie as configurações do sistema"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Configurações", href: "/settings" },
  ]}
  actions={<Button>Criar</Button>}
/>
```

#### `SettingsTabs`
Tabs genéricas para páginas de configurações.

```tsx
import { SettingsTabs } from "@/components/settings/SettingsTabs";

<SettingsTabs
  tabs={[
    { id: "general", label: "Geral", icon: Settings },
    { id: "security", label: "Segurança", icon: Lock },
  ]}
  activeTab="general"
  onTabChange={(tab) => setActiveTab(tab)}
/>
```

### Componentes de Formulário

#### `UserPicker`
Seletor genérico de usuários com busca.

```tsx
import { UserPicker } from "@/components/users/UserPicker";

<UserPicker
  value={selectedUserId}
  onChange={(userId) => setSelectedUserId(userId)}
  placeholder="Selecione um usuário..."
  filterByStatus="active"
/>
```

---

## 🔌 APIs Disponíveis

### APIs de Usuários

#### `GET /api/users`
Lista usuários com filtros e paginação.

**Query Params:**
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 50)
- `search`: busca por nome/email
- `status`: filtro por status (active/inactive/suspended)
- `departmentId`: filtro por departamento
- `sectorId`: filtro por setor
- `positionId`: filtro por cargo

**Resposta:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

#### `POST /api/users`
Cria um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "cpf": "12345678909",
  "password": "senha123",
  "positionId": "pos_123",
  "departmentId": "dept_123"
}
```

#### `GET /api/users/[userId]`
Obtém detalhes de um usuário.

#### `PUT /api/users/[userId]`
Atualiza um usuário.

#### `DELETE /api/users/[userId]`
Exclui um usuário.

#### `POST /api/users/import`
Importa usuários em massa via CSV/Excel.

#### `GET /api/users/export`
Exporta usuários filtrados em CSV/JSON.

#### `POST /api/users/bulk-action`
Executa ações em massa (ativar, desativar, etc.).

#### `GET /api/users/[userId]/permissions/effective`
Obtém permissões efetivas de um usuário.

#### `POST /api/users/[userId]/2fa/enable`
Ativa autenticação de dois fatores.

#### `GET /api/users/[userId]/2fa/qr-code`
Obtém QR code para configuração de 2FA.

#### `POST /api/users/[userId]/2fa/disable`
Desativa autenticação de dois fatores.

#### `GET /api/users/[userId]/trusted-devices`
Lista dispositivos confiáveis.

#### `POST /api/users/[userId]/trusted-devices`
Adiciona dispositivo confiável.

#### `DELETE /api/users/[userId]/trusted-devices/[deviceId]`
Remove dispositivo confiável.

#### `GET /api/users/[userId]/api-tokens`
Lista tokens de API.

#### `POST /api/users/[userId]/api-tokens`
Cria novo token de API.

#### `DELETE /api/users/[userId]/api-tokens/[tokenId]`
Revoga token de API.

#### `GET /api/users/[userId]/api-tokens/[tokenId]/history`
Obtém histórico de uso de um token.

### APIs de Notificações

#### `GET /api/notifications`
Lista notificações do usuário.

**Query Params:**
- `page`: número da página
- `limit`: itens por página
- `status`: filtro por status (read/unread/archived)
- `category`: filtro por categoria
- `search`: busca textual

#### `POST /api/notifications`
Cria uma nova notificação.

#### `PUT /api/notifications/[id]/read`
Marca notificação como lida.

#### `PUT /api/notifications/[id]/unread`
Marca notificação como não lida.

#### `DELETE /api/notifications/[id]`
Exclui uma notificação.

#### `POST /api/notifications/mark-all-read`
Marca todas as notificações como lidas.

#### `POST /api/notifications/bulk-action`
Executa ações em massa em notificações.

#### `GET /api/notifications/stats`
Obtém estatísticas de notificações.

#### `GET /api/notifications/history`
Obtém histórico completo de notificações.

#### `GET /api/notifications/preferences`
Obtém preferências de notificação.

#### `PUT /api/notifications/preferences`
Atualiza preferências de notificação.

#### `POST /api/notifications/test`
Envia notificação de teste.

---

## 🔄 Fluxos de Trabalho

### Fluxo de Criação de Usuário

1. Usuário acessa `/settings/users`
2. Clica em "Novo Usuário"
3. Preenche formulário (nome, email, CPF, etc.)
4. Sistema valida dados (CPF, email, etc.)
5. Usuário salva
6. Sistema cria usuário no backend
7. Sistema envia convite por email (opcional)
8. Usuário aparece na lista

### Fluxo de Ativação de 2FA

1. Usuário acessa `/profile` → Tab "Segurança"
2. Clica em "Ativar 2FA"
3. Sistema gera secret e backup codes
4. Sistema exibe QR code
5. Usuário escaneia QR code no app autenticador
6. Usuário confirma ativação
7. Sistema ativa 2FA no backend
8. Próximos logins requerem código TOTP

### Fluxo de Notificações

1. Sistema gera evento (ex: aprovação pendente)
2. Backend cria notificação no banco
3. Backend envia evento via WebSocket
4. Frontend recebe evento e atualiza UI
5. Usuário vê notificação no centro de notificações
6. Usuário clica na notificação
7. Sistema marca como lida e redireciona

---

## 📖 Guias de Uso

### Como Adicionar Validação em Formulário

```tsx
import { z } from "zod";
import { cpfSchema, emailSchema } from "@/lib/validators/zod-schemas";

const userSchema = z.object({
  name: z.string().min(3),
  email: emailSchema(),
  cpf: cpfSchema,
});

// Usar com React Hook Form
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(userSchema),
});
```

### Como Usar Debounce em Busca

```tsx
import { useDebounce } from "@/hooks/use-debounce";

function SearchComponent() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (debouncedSearch) {
      // Fazer busca na API
      fetchUsers(debouncedSearch);
    }
  }, [debouncedSearch]);
}
```

### Como Adicionar Atalho de Teclado

```tsx
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

function MyComponent() {
  useKeyboardShortcuts([
    {
      key: "s",
      ctrl: true,
      action: () => handleSave(),
      description: "Salvar",
    },
  ]);
}
```

### Como Usar Code Splitting

```tsx
import dynamic from "next/dynamic";
import { LoadingState } from "@/components/ui";

const HeavyComponent = dynamic(
  () => import("./HeavyComponent"),
  {
    loading: () => <LoadingState />,
    ssr: false,
  }
);
```

---

## 🔧 Troubleshooting

### Problema: Validação de CPF não funciona

**Solução:** Verifique se está usando o schema correto:
```tsx
import { cpfSchema } from "@/lib/validators/zod-schemas";
```

### Problema: Tooltip não aparece

**Solução:** Certifique-se de que o `TooltipProvider` está envolvendo o componente:
```tsx
import { TooltipProvider } from "@morina/ui";

<TooltipProvider>
  <Tooltip>...</Tooltip>
</TooltipProvider>
```

### Problema: Atalhos de teclado não funcionam

**Solução:** Verifique se o `KeyboardShortcutsProvider` está no layout:
```tsx
// apps/web/src/app/(app)/layout.tsx
<KeyboardShortcutsProvider shortcuts={shortcuts}>
  {children}
</KeyboardShortcutsProvider>
```

### Problema: Code splitting não reduz bundle size

**Solução:** Verifique se está usando `ssr: false` para componentes client-side apenas:
```tsx
const Component = dynamic(() => import("./Component"), {
  ssr: false, // Importante para componentes client-side
});
```

---

## 📚 Recursos Adicionais

- [Documentação de Validações](./VALIDACOES_E_SEGURANCA.md)
- [Documentação de Otimizações](./OTIMIZACOES_E_PERFORMANCE.md)
- [Documentação de Acessibilidade](./ACESSIBILIDADE.md)
- [Design System](./clean_vibrant_dark_design_system.md)

---

**Última atualização:** 2025-12-11
**Versão:** 1.8.0


