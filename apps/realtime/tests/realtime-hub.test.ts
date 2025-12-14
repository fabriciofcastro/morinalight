import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyBaseLogger } from "fastify";
import type { WebSocket } from "ws";

const redisInstances = vi.hoisted(() => [] as Array<Record<string, any>>);

vi.mock("ioredis", () => {
  class RedisMock {
    static instances = redisInstances;

    status = "ready";
    on = vi.fn().mockReturnThis();
    connect = vi.fn().mockResolvedValue(null);
    quit = vi.fn().mockResolvedValue(null);
    xgroup = vi.fn().mockResolvedValue("OK");
    xreadgroup = vi.fn().mockResolvedValue(null);
    xack = vi.fn().mockResolvedValue(1);
    xpending = vi.fn().mockResolvedValue(["0", null, null, []] as const);

    constructor() {
      RedisMock.instances.push(this);
    }
  }

  return {
    Redis: Object.assign(RedisMock, { instances: redisInstances }),
  };
});

import { Redis } from "ioredis";
import { RealtimeHub } from "../src/hub/realtime-hub";
import {
  broadcastCounter,
  connectionsGauge,
  connectionsPerOrgGauge,
  pendingMessagesGauge,
} from "../src/observability/metrics";

const logger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  fatal: vi.fn(),
  child: vi.fn().mockReturnThis(),
} as unknown as FastifyBaseLogger;

type MockSocket = {
  readyState: number;
  OPEN: number;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  on: (event: string, listener: () => void) => void;
  emit: (event: string) => void;
};

function createSocket(): MockSocket {
  const listeners = new Map<string, Array<() => void>>();
  return {
    readyState: 1,
    OPEN: 1,
    send: vi.fn(),
    close: vi.fn(),
    on(event: string, listener: () => void) {
      const current = listeners.get(event) ?? [];
      current.push(listener);
      listeners.set(event, current);
    },
    emit(event: string) {
      listeners.get(event)?.forEach((listener) => listener());
    },
  };
}

function resetMetrics() {
  broadcastCounter.reset();
  connectionsGauge.reset();
  connectionsPerOrgGauge.reset();
  pendingMessagesGauge.reset();
}

function getRedisInstances() {
  return (Redis as unknown as { instances: Array<Record<string, any>> }).instances ?? [];
}

describe("RealtimeHub", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMetrics();
    getRedisInstances().splice(0, getRedisInstances().length);
  });

  it("atualiza métricas ao adicionar e remover conexões", async () => {
    const hub = new RealtimeHub("redis://test", "realtime.catalogo", logger);
    const socket = createSocket();
    hub.addConnection("org-1", "actor-1", socket as unknown as WebSocket);

    const connectionsMetric = await connectionsGauge.get();
    const connectionsValue = connectionsMetric.values?.[0]?.value ?? 0;
    expect(connectionsValue).toBe(1);

    socket.emit("close");
    await hub.stop();

    const afterStopMetric = await connectionsGauge.get();
    const afterStop = afterStopMetric.values?.[0]?.value ?? 0;
    expect(afterStop).toBe(0);
  });

  it("envia eventos aos sockets registrados e incrementa métricas de broadcast", async () => {
    const hub = new RealtimeHub("redis://test", "realtime.catalogo", logger);

    const socket = createSocket();
    hub.addConnection("org-1", "actor-1", socket as unknown as WebSocket);

    const payload = JSON.stringify({
      name: "Catalogo.ProdutoCadastrado.v1",
      metadata: { orgId: "org-1" },
    });

    // @ts-expect-error - acesso intencional ao método privado para fins de teste
    hub.broadcast("org-1", payload, "Catalogo.ProdutoCadastrado.v1");

    expect(socket.send).toHaveBeenCalledWith(payload);
    const broadcastMetric = await broadcastCounter.get();
    const totalBroadcasts = broadcastMetric.values?.[0]?.value ?? 0;
    expect(totalBroadcasts).toBeGreaterThanOrEqual(1);

    await hub.stop();
  });

  it("filtra Notification.Created por actorId (entrega somente ao destinatário)", async () => {
    const hub = new RealtimeHub("redis://test", "realtime.notifications", logger);

    const socket1 = createSocket();
    const socket2 = createSocket();
    hub.addConnection("org-1", "actor-1", socket1 as unknown as WebSocket);
    hub.addConnection("org-1", "actor-2", socket2 as unknown as WebSocket);

    const payload = JSON.stringify({
      name: "Notification.Created",
      metadata: { orgId: "org-1", actorId: "actor-2" },
      payload: { type: "info", title: "t", message: "m" },
    });

    // @ts-expect-error - acesso intencional ao método privado para fins de teste
    hub.broadcast("org-1", payload, "Notification.Created");

    expect(socket1.send).not.toHaveBeenCalled();
    expect(socket2.send).toHaveBeenCalledWith(payload);

    await hub.stop();
  });

  it("emite alerta quando mensagens pendentes excedem o limite configurado", async () => {
    const hub = new RealtimeHub("redis://test", "realtime.catalogo", logger, {
      pendingAlertThreshold: 5,
      pendingAlertIntervalMs: 1000,
    });

    const instances = getRedisInstances();
    const instance = instances[0];
    instance.xpending = vi.fn().mockResolvedValue(["42", null, null, []] as const);

    // @ts-expect-error - acessando método privado para verificar métrica diretamente
    await hub.checkPendingMessages();

    expect(instance.xpending).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ pending: 42 }),
      expect.stringContaining("acima do limite"),
    );
    const pendingMetric = await pendingMessagesGauge.get();
    const gauge = pendingMetric.values?.[0]?.value ?? 0;
    expect(gauge).toBe(42);

    await hub.stop();
  });
});
