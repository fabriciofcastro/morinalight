# Arquitetura de Eventos - Backend e Frontend

## Visão Geral

O sistema Morina utiliza uma arquitetura baseada em eventos para comunicação em tempo real entre backend e frontend, garantindo sincronização imediata e suporte a operações offline.

## Backend - Sistema de Eventos

### 1. Redis Event Bus (`apps/api/src/infra/events/redis-event-bus.ts`)

- **Responsabilidade**: Publicar eventos de domínio no Redis Streams
- **Streams**:
  - `domain.events`: Stream principal de eventos de domínio
  - `realtime.notifications`: Stream para eventos em tempo real (opcional)
- **Características**:
  - Reconexão automática desabilitada (evita loops de erro)
  - Fallback silencioso quando Redis não está disponível
  - Métricas de observabilidade (Prometheus)

### 2. Realtime Hub (`apps/realtime/src/hub/realtime-hub.ts`)

- **Responsabilidade**: Consumir eventos do Redis e distribuir via WebSocket
- **Funcionamento**:
  - Usa `XREADGROUP` para consumir do stream `realtime.notifications`
  - Agrupa conexões por `orgId`
  - Broadcast de eventos para todas as conexões de uma organização
  - ACK automático após processamento

### 3. Eventos de Domínio

Os módulos publicam eventos quando ações importantes ocorrem:

- **Catálogo**: `Catalogo.ProdutoAprovado.v1`, `Catalogo.ProdutoReprovado.v1`
- **Organizações**: `organizacao.criada`, `organizacao.atualizada`, `organizacao.deletada`
- **Usuários**: Eventos de criação, atualização e exclusão
- **Auditoria**: Todos os eventos são registrados no audit log

## Frontend - Sistema de Eventos

### 1. Realtime Client (`packages/realtime-client/src/index.ts`)

- **Responsabilidade**: Conectar ao WebSocket e receber eventos
- **Características**:
  - Reconexão automática com backoff exponencial
  - Autenticação via token JWT
  - Callbacks para `onEvent`, `onOpen`, `onClose`, `onError`

### 2. Hooks de Eventos

- **`useAuditTimeline`**: Consome eventos de auditoria em tempo real
- **`useRealtimeProductEvents`**: (Planejado) Consome eventos de produtos

### 3. Integração com Zustand

Os eventos são processados e atualizam stores Zustand para reatividade imediata na UI.

## Status de Conexão

### 1. Hook `useConnectionStatus`

Monitora:
- Status da conexão de rede (`navigator.onLine`)
- Status do backend (health check em `/health`)
- Status do WebSocket realtime

### 2. Componente `ConnectionStatusIndicator`

Exibe visualmente o status de conexão:
- 🟢 **Conectado**: Backend e realtime online
- 🟡 **Parcialmente conectado**: Backend online, realtime offline
- 🟠 **Servidor offline**: Backend não responde
- 🔴 **Sem conexão**: Sem conexão de rede

## Sistema Offline

### 1. Fila Offline (`apps/web/src/lib/offline-queue.ts`)

- **Armazenamento**: IndexedDB
- **Operações suportadas**: `create`, `update`, `delete`
- **Características**:
  - Persistência local
  - Ordenação por timestamp
  - Limpeza automática de operações antigas (7 dias)

### 2. Sincronização Automática (`apps/web/src/lib/offline-sync.ts`)

- **Trigger**: Quando conexão é restabelecida
- **Processo**:
  1. Busca operações pendentes
  2. Executa cada operação no backend
  3. Remove da fila após sucesso
  4. Incrementa tentativas em caso de falha
  5. Marca como falha após 3 tentativas

### 3. Wrapper de API (`apps/web/src/lib/offline-api.ts`)

- **Função**: Intercepta chamadas de API
- **Comportamento**:
  - Se online: Executa requisição normalmente
  - Se offline: Enfileira operação para sincronização posterior
  - Retorna resposta simulada (202 Accepted) quando enfileirado

### 4. Notificação de Sincronização

- **Componente**: `OfflineSyncNotification`
- **Exibe**: Progresso da sincronização e operações pendentes

## Fluxo Completo

### Cenário 1: Operação Online

```
1. Usuário cria organização
2. Frontend → API (POST /organizations)
3. Backend processa e publica evento
4. Redis Event Bus → Realtime Stream
5. Realtime Hub → WebSocket → Frontend
6. Frontend atualiza UI via Zustand
```

### Cenário 2: Operação Offline

```
1. Usuário cria organização (offline)
2. Frontend detecta offline
3. Operação enfileirada no IndexedDB
4. Retorna 202 Accepted (simulado)
5. UI mostra "Operação pendente"
6. Quando online:
   a. Sincronização automática detecta fila
   b. Executa operação no backend
   c. Remove da fila
   d. Atualiza UI
```

## Verificação de Integridade

### Backend ✅

- [x] Redis Event Bus implementado
- [x] Realtime Hub consumindo eventos
- [x] Eventos de domínio publicados
- [x] WebSocket server funcionando
- [x] Autenticação via JWT

### Frontend ✅

- [x] Realtime Client conectando
- [x] Hooks consumindo eventos
- [x] Status de conexão monitorado
- [x] Fila offline implementada
- [x] Sincronização automática
- [x] UI de feedback (indicadores)

## Melhorias Futuras

1. **Conflicts Resolution**: Resolver conflitos quando múltiplas edições offline
2. **Optimistic Updates**: Atualizar UI imediatamente, reverter se falhar
3. **Event Sourcing**: Armazenar histórico completo de eventos
4. **CQRS**: Separar comandos (write) de queries (read)
5. **Service Worker**: Sincronização em background mesmo com aba fechada

