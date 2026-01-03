---
status: accepted
date: 2025-11-10
---

# ADR 0002 — Feed de Notificações unificado via API

## Contexto

- A timeline de auditoria já envia eventos para Redis Streams e é consumida tanto pela API quanto pelo gateway realtime.
- O frontend precisava de uma rota única que servisse tanto para histórico paginado quanto para notificações em dashboards sem depender de WebSocket.
- O passo 5 do roadmap introduziu novos casos de uso de listagem (`ListarAuditoriaFeedUseCase`) e endpoints REST (`/catalogo/auditoria/feed` e `/notifications/feed`).

## Decisão

1. **Feed consolidado na API**  
   - `/catalogo/auditoria/feed` oferece auditoria completa com enriquecimento dos dados do produto (status atual, nome, etc.).
   - `/notifications/feed` transforma o mesmo resultado em payload compacto pronto para UI (tipo, ts, metadados).
2. **Reutilização de repositórios**  
   - Infraestrutura Prisma/InMemory agora entende paginação por cursor base64, o que permite reuso idêntico no realtime e em testes.
3. **Clientes externos**  
   - Disponibilizamos documentação OpenAPI e coleção Postman para facilitar integração de times terceiros.

## Consequências

- O frontend pode inicializar a timeline consumindo `/catalogo/auditoria/feed` e apenas “promover” eventos realtime quando disponíveis.
- CLI de demonstração (`pnpm demo:catalogo`) gera atividade suficiente para validar feeds em ambientes locais.
- O gateway realtime permanece responsável por pushes incrementais; o feed REST garante consistência eventual e fallback quando não houver WebSocket.

