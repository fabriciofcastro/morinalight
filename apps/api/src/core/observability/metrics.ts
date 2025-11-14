import type { FastifyInstance } from "fastify";
import { Counter, collectDefaultMetrics, Gauge, Histogram, Registry } from "prom-client";

const registry = new Registry();

collectDefaultMetrics({
  register: registry,
  prefix: "morina_api_",
});

const httpRequestDuration = new Histogram({
  name: "morina_api_http_request_duration_seconds",
  help: "Duração das requisições HTTP em segundos",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10],
});

const httpRequestCounter = new Counter({
  name: "morina_api_http_requests_total",
  help: "Total de requisições HTTP processadas",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

const domainEventPublishedCounter = new Counter({
  name: "morina_domain_events_published_total",
  help: "Total de eventos de domínio publicados",
  labelNames: ["stream"],
  registers: [registry],
});

const realtimeForwardCounter = new Counter({
  name: "morina_realtime_events_forwarded_total",
  help: "Total de eventos encaminhados para o stream de realtime",
  labelNames: ["stream"],
  registers: [registry],
});

const domainStreamLengthGauge = new Gauge({
  name: "morina_domain_event_stream_length",
  help: "Quantidade de mensagens armazenadas por stream de domínio",
  labelNames: ["stream"],
  registers: [registry],
});

type HttpMetricsState = {
  start?: bigint;
};

declare module "fastify" {
  interface FastifyRequest {
    metrics?: HttpMetricsState;
  }
}

export function setupHttpMetrics(app: FastifyInstance) {
  app.addHook("onRequest", async (request) => {
    request.metrics = { start: process.hrtime.bigint() };
  });

  app.addHook("onResponse", async (request, reply) => {
    const route = request.routeOptions?.url ?? request.url;
    const labels = {
      method: request.method,
      route,
      status_code: String(reply.statusCode),
    };

    httpRequestCounter.inc(labels);

    const start = request.metrics?.start;
    if (start) {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
      httpRequestDuration.observe(labels, durationSeconds);
    }
  });

  app.get("/metrics", async (_request, reply) => {
    reply.header("Content-Type", registry.contentType);
    return reply.send(await registry.metrics());
  });
}

export {
  domainEventPublishedCounter,
  domainStreamLengthGauge,
  realtimeForwardCounter,
  registry as apiMetricsRegistry,
};
