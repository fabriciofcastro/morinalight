# Notificações em Tempo Real — Plano de Implementação

## Objetivo

Emitir atualizações instantâneas (aprovação/reprovação/edições de produto) para os clientes web sem pooling, reutilizando a infraestrutura Redis já empregada como event bus de domínio.

## Arquitetura Proposta

- **Produtores**: casos de uso do Catálogo já publicam eventos (`Catalogo.ProdutoAprovado.v1`, `Catalogo.ProdutoReprovado.v1`). Ampliaremos o `RedisEventBus` para opcionalmente encaminhar mensagens para um canal pub/sub dedicado (`realtime.catalogo`).
- **Dispatcher**: novo serviço `RealtimeGateway` (Node.js) dentro do monorepo responsável por:
  - Assinar o stream Redis (`XREADGROUP`) com consumidor resiliente.
  - Traduzir eventos em payloads web-socket (`ws`) ou `Server-Sent Events` (fallback) com granularidade por `orgId`.
- **Clientes Web**: hooks React (Zustand) conectados ao gateway via `ws://` com autenticação por token (mesmo JWT do backend). Cada aba se inscreve em `room:orgId` e atualiza listas / timeline instantaneamente.

## Passos Técnicos

1. **Backend API**
   - Permitir `RedisEventBus.publish` enviar mensagem adicional para stream `realtime.catalogo` (`XADD`), com payload `{ orgId, actorId, event, data }`.
   - Expor endpoint `POST /realtime/subscribe` (opcional) para negociar tokens de conexão curta (validados via JWT + assinatura HMAC).
2. **Gateway Realtime (novo app)**
   - Localização sugerida: `apps/realtime` (Fastify + `@fastify/websocket`).
   - Responsabilidades: handshake (token curto), multiplexação por sala `org:<orgId>`, heartbeats, backoff com `bullmq` para reprocessar eventos não entregues.
   - Observabilidade: métrica `pending_messages`, `delivery_latency_ms`, logs estruturados.
3. **Frontend**
   - Hook `useRealtimeProductEvents(orgId)` que atualiza Zustand store `auditoria` usando `immer`.
   - Timeline component consome a store e destaca eventos recebidos (badge “novo” até confirmação de leitura).

## Segurança

- Conexão WebSocket protegida por `Sec-WebSocket-Protocol` com token assinado (expiração 5 min).
- Rate limit / handshake via `@fastify/rate-limit`.
- No Redis, grupos de consumidores separados por ambiente (`dev`, `prod`).

## Observabilidade & Resiliência

- Retry com `xpending` monitorado; dashboards em Grafana (`delivery_latency`, `pending`).
- Alertas quando `pending_messages > 100` por > 1 min.
- Testes E2E simulando queda do gateway (verificar reprocessamento `XCLAIM`).

## Próximos Passos

1. Criar app `apps/realtime` com health-check e handshake básico (sem entrega ainda).
2. Estender `RedisEventBus` com publicação opcional no stream realtime.
3. Prover SDK frontend (`packages/realtime-client`) com reconexão exponencial e hooks React.
