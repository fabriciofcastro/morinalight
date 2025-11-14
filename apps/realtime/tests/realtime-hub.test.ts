import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebSocket } from "ws";

const redisInstances = vi.hoisted(() => [] as Array<Record<string, any>>);

vi.mock("ioredis", () => {
  class RedisMock {
    static instances = redisInstances;

    status = "ready";
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
};

type MockSocket = {
  readyState: number;
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
