import type { FastifyInstance } from "fastify";
import { Counter, collectDefaultMetrics, Gauge, Registry } from "prom-client";

const registry = new Registry();

collectDefaultMetrics({
  register: registry,
  prefix: "morina_realtime_",
});

const connectionsGauge = new Gauge({
  name: "morina_realtime_connections_total",
  help: "Total de conexões WebSocket ativas",
  registers: [registry],
});

const connectionsPerOrgGauge = new Gauge({
  name: "morina_realtime_connections_by_org",
  help: "Conexões WebSocket ativas por organização",
  labelNames: ["org_id"],
  registers: [registry],
});

const broadcastCounter = new Counter({
  name: "morina_realtime_broadcast_events_total",
  help: "Total de eventos enviados aos clientes WebSocket",
  labelNames: ["event_name"],
  registers: [registry],
});

const pendingMessagesGauge = new Gauge({
  name: "morina_realtime_pending_messages",
  help: "Mensagens pendentes no stream do Redis para o consumer group configurado",
  labelNames: ["stream", "consumer_group"],
  registers: [registry],
});

export function setupMetricsRoute(app: FastifyInstance) {
  app.get("/metrics", async (_request, reply) => {
    reply.header("Content-Type", registry.contentType);
    return reply.send(await registry.metrics());
  });
}

export {
  broadcastCounter,
  connectionsGauge,
  connectionsPerOrgGauge,
  pendingMessagesGauge,
  registry as realtimeMetricsRegistry,
};
