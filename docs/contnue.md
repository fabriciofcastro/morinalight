ntegração Realtime + Timeline
Criei o pacote @morina/realtime-client com helper createRealtimeClient() (reconexão incremental, callback de eventos) e ajustes de aliases (tsconfig, next.config.ts, vitest.config.ts) para uso no frontend.
Hook useAuditTimeline agora aplica filtros (ação, intervalo de datas), faz paginação incremental e injeta eventos em tempo real sem refetch integral, com mapeamento Catalogo.\_ → produto\_\_.
UI do catálogo: nova página /catalogo/auditoria, componente AuditTimelineSection com formulário de filtros (ID, ação, data inicial/final) e AuditTimeline exibindo badges de socket, chips de filtros, agrupamento diário, botão “carregar mais”. Home destaca o atalho conforme plano.
Backend: rota POST /realtime/token, RedisEventBus publica no stream realtime.catalogo, repositórios/rota de auditoria com filtros e cursor compatíveis com o frontend.
Gateway realtime (apps/realtime): Fastify + WebSocket com RealtimeHub (consumer group Redis, broadcast por orgId) e .env.example. Build/typecheck configurados.
Documentação: docs/catalogo.md expandida com query params; docs/notificacoes-realtime.md descreve a arquitetura WS/Redis e próximos incrementos.
Testes
pnpm run lint
pnpm test
pnpm --filter @morina/realtime typecheck
pnpm --filter @morina/realtime build
pnpm --filter @morina/ui test
pnpm --filter web vitest run
Próximos Passos
Conectar UI ao gateway real (docker-compose ou serviço remoto) e validar socket em produção.
Hidratar timeline incrementalmente (de-dupe por eventId e reconciliar com logs persistidos).
Expandir o @morina/realtime-client com eventos tipados e utilitário de reconexão exponencial configurável (ex.: listeners por contexto).
Instrumentar métricas do gateway (pending_messages, delivery_latency_ms) e alertas mencionados em docs/notificacoes-realtime.md.
Avaliar geração de docker-compose.yml para PostgreSQL/Redis/API/Realtime/Web com healthchecks compartilhando REALTIME_SECRET
