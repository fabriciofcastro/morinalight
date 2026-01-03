# WebSocket para Notificações

Sistema completo de notificações em tempo real via WebSocket implementado no Morina.

## Arquitetura

```
Backend API → Redis Stream → Realtime Hub → WebSocket → Frontend → NotificationCenter
```

### Componentes

1. **NotificationPublisherService** (Backend)
   - Serviço para publicar notificações
   - Localização: `apps/api/src/modules/notifications/infra/notification-publisher.service.ts`

2. **RealtimeHub** (Realtime Service)
   - Consome eventos do Redis Stream
   - Distribui via WebSocket para clientes conectados
   - Localização: `apps/realtime/src/hub/realtime-hub.ts`

3. **useRealtimeNotifications** (Frontend)
   - Hook React para conectar ao WebSocket
   - Recebe eventos e dispara notificações
   - Localização: `apps/web/src/hooks/use-realtime-notifications.ts`

4. **NotificationCenter** (Frontend)
   - Componente UI para exibir notificações
   - Localização: `apps/web/src/components/notifications/notification-center.tsx`

## Uso no Backend

### Publicar Notificação

```typescript
import { NotificationPublisherService } from "@/modules/notifications/infra/notification-publisher.service";

// Inicializar o serviço
const notificationService = new NotificationPublisherService(eventBus);

// Publicar notificação de sucesso
await notificationService.publishSuccess(
  orgId,
  userId,
  "Produto aprovado",
  "O produto foi aprovado com sucesso",
  {
    action: {
      label: "Ver produto",
      url: `/products/${produtoId}`,
    },
    metadata: {
      produtoId,
    },
  },
);

// Publicar notificação de erro
await notificationService.publishError(
  orgId,
  userId,
  "Erro ao processar",
  "Não foi possível processar a solicitação",
);

// Publicar notificação customizada
await notificationService.publishNotification(orgId, userId, {
  type: "info",
  title: "Nova atualização",
  message: "Uma nova versão está disponível",
  action: {
    label: "Atualizar",
    url: "/settings/updates",
  },
});
```

### Integrar em Casos de Uso

```typescript
// Exemplo: Ao aprovar um produto
export class AprovarProdutoUseCase {
  constructor(
    private produtoRepository: ProdutoRepository,
    private notificationService: NotificationPublisherService,
  ) {}

  async execute({ orgId, produtoId, actorId }: Input) {
    const produto = await this.produtoRepository.encontrarPorId(
      orgId,
      produtoId,
    );

    // ... lógica de aprovação ...

    // Notificar usuário
    await this.notificationService.publishSuccess(
      orgId,
      actorId,
      "Produto aprovado",
      `O produto "${produto.nome}" foi aprovado`,
      {
        action: {
          label: "Ver produto",
          url: `/products/${produtoId}`,
        },
      },
    );

    return resultado;
  }
}
```

## Uso no Frontend

### Provider Automático

O `RealtimeNotificationsProvider` já está integrado no layout principal. As notificações são recebidas automaticamente.

### Usar o Hook Manualmente

```typescript
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";

function MyComponent() {
  useRealtimeNotifications({
    enabled: true,
    orgId: "org-123",
    userId: "user-456",
    onNotification: (event) => {
      console.log("Notificação recebida:", event);
    },
  });

  return <div>...</div>;
}
```

### Adicionar Notificação Localmente

```typescript
import { notificationCenter } from "@/components/notifications/notification-center";

// Adicionar notificação programaticamente
notificationCenter.add({
  type: "success",
  title: "Operação concluída",
  message: "A operação foi realizada com sucesso",
});
```

## Tipos de Notificações

- **success**: Operações bem-sucedidas (verde)
- **error**: Erros e falhas (vermelho)
- **warning**: Avisos e alertas (amarelo)
- **info**: Informações gerais (azul)

## Fluxo de Eventos

1. **Backend publica evento**:

   ```typescript
   await notificationService.publishSuccess(
     orgId,
     userId,
     "Título",
     "Mensagem",
   );
   ```

2. **Evento vai para Redis Stream**:
   - Stream: `realtime.notifications` (ou configurado)
   - Formato: `Notification.Created.v1`

3. **RealtimeHub consome do Redis**:
   - Usa `XREADGROUP` para consumir eventos
   - Filtra por `orgId`

4. **WebSocket envia para clientes**:
   - Apenas clientes da mesma organização recebem
   - Formato JSON padronizado

5. **Frontend recebe e exibe**:
   - `useRealtimeNotifications` recebe o evento
   - Dispara evento customizado `realtime-notification`
   - `NotificationCenter` escuta e exibe a notificação

## Configuração

### Variáveis de Ambiente

**Backend (API)**:

```env
REDIS_URL=redis://localhost:6379
REALTIME_STREAM=realtime.notifications
```

**Realtime Service**:

```env
REDIS_URL=redis://localhost:6379
REALTIME_STREAM=realtime.notifications
REALTIME_SECRET=your-secret-key
```

**Frontend**:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_REALTIME_URL=ws://localhost:3334
```

## Exemplo Completo

### Backend: Notificar quando produto é aprovado

```typescript
// apps/api/src/modules/catalogo/application/use-cases/aprovar-produto.use-case.ts
import { NotificationPublisherService } from "@/modules/notifications/infra/notification-publisher.service";

export class AprovarProdutoUseCase {
  constructor(
    private produtoRepository: ProdutoRepository,
    private eventBus: DomainEventBus,
    private notificationService?: NotificationPublisherService,
  ) {}

  async execute({ orgId, produtoId, actorId }: Input) {
    const produto = await this.produtoRepository.encontrarPorId(
      orgId,
      produtoId,
    );

    // Aprovar produto
    produto.aprovar();
    await this.produtoRepository.salvar(produto);

    // Publicar evento de domínio
    await this.eventBus.publish({
      name: "Catalogo.ProdutoAprovado",
      version: "v1",
      metadata: { orgId, actorId, eventId: randomUUID() },
      payload: { produtoId },
    });

    // Notificar via WebSocket
    if (this.notificationService) {
      await this.notificationService.publishSuccess(
        orgId,
        actorId,
        "Produto aprovado",
        `O produto "${produto.nome}" foi aprovado com sucesso`,
        {
          action: {
            label: "Ver produto",
            url: `/products/${produtoId}`,
          },
          metadata: { produtoId },
        },
      );
    }

    return { produto };
  }
}
```

### Frontend: Receber e exibir automaticamente

O `NotificationCenter` já está no header e recebe notificações automaticamente quando o `RealtimeNotificationsProvider` está ativo.

## Troubleshooting

### Notificações não aparecem

1. Verificar se Redis está rodando
2. Verificar se Realtime Service está conectado ao Redis
3. Verificar se WebSocket está conectado (ver indicador de conexão)
4. Verificar logs do RealtimeHub
5. Verificar console do navegador para erros

### WebSocket não conecta

1. Verificar `NEXT_PUBLIC_REALTIME_URL`
2. Verificar se o token realtime está sendo gerado
3. Verificar se `REALTIME_SECRET` está configurado
4. Verificar CORS e headers de segurança

### Eventos não chegam ao Redis

1. Verificar se `REDIS_URL` está configurado
2. Verificar se Redis está acessível
3. Verificar logs do `RedisEventBus`
4. Verificar se o stream está sendo criado

## Métricas

O sistema expõe métricas Prometheus:

- `realtime_connections_total`: Total de conexões WebSocket
- `realtime_connections_per_org`: Conexões por organização
- `realtime_broadcasts_total`: Total de broadcasts
- `realtime_pending_messages`: Mensagens pendentes no stream

## Segurança

- Tokens JWT com expiração curta (5 minutos)
- Autenticação via `REALTIME_SECRET`
- Filtragem por `orgId` (isolamento de dados)
- Validação de origem no WebSocket
