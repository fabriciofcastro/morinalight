export type RealtimeEvent<T = unknown> = {
  name: string;
  version: string;
  metadata: {
    eventId: string;
    orgId: string;
    actorId: string;
    timestamp: string;
    [key: string]: unknown;
  };
  payload: T;
};

export type RealtimeClientOptions = {
  apiUrl: string;
  realtimeUrl: string;
  orgId: string;
  actorId: string;
  fetchImpl?: typeof fetch;
  onEvent?: (event: RealtimeEvent) => void;
  onOpen?: () => void;
  onClose?: (event?: CloseEvent) => void;
  onError?: (error: unknown) => void;
  reconnectAttempts?: number;
  reconnectIntervalMs?: number;
};

type ConnectionState = "idle" | "connecting" | "connected" | "closed";

export function createRealtimeClient(options: RealtimeClientOptions) {
  let ws: WebSocket | null = null;
  let state: ConnectionState = "idle";
  let attempts = 0;
  let shouldReconnect = true;

  const reconnectInterval = options.reconnectIntervalMs ?? 3000;
  const maxAttempts = options.reconnectAttempts ?? 5;

  async function connect() {
    if (state === "connecting" || state === "connected") {
      return;
    }

    state = "connecting";

    try {
      const token = await fetchToken();
      const url = new URL("/ws", options.realtimeUrl);
      url.searchParams.set("token", token);

      ws = new WebSocket(url.toString());

      ws.onopen = () => {
        state = "connected";
        attempts = 0;
        options.onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeEvent;
          options.onEvent?.(data);
        } catch (error) {
          options.onError?.(error);
        }
      };

      ws.onclose = (event) => {
        state = "closed";
        options.onClose?.(event);
        ws = null;

        if (shouldReconnect && attempts < maxAttempts) {
          attempts += 1;
          setTimeout(() => {
            void connect();
          }, reconnectInterval * attempts);
        }
      };

      ws.onerror = (event) => {
        options.onError?.(event);
      };
    } catch (error) {
      state = "closed";
      options.onError?.(error);
      scheduleReconnect();
    }
  }

  async function fetchToken(): Promise<string> {
    const fetcher = options.fetchImpl ?? fetch;
    const response = await fetcher(`${options.apiUrl}/realtime/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": options.orgId,
        "x-actor-id": options.actorId,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter token realtime: ${response.status}`);
    }

    const data = (await response.json()) as { token: string };
    if (!data.token) {
      throw new Error("Token realtime ausente na resposta");
    }

    return data.token;
  }

  function scheduleReconnect() {
    if (!shouldReconnect || attempts >= maxAttempts) {
      return;
    }

    attempts += 1;
    setTimeout(() => {
      void connect();
    }, reconnectInterval * attempts);
  }

  function disconnect() {
    shouldReconnect = false;
    if (ws && (state === "connected" || state === "connecting")) {
      ws.close();
    }
    ws = null;
    state = "closed";
  }

  return {
    connect,
    disconnect,
    get state() {
      return state;
    },
  };
}

export function isRealtimeEvent(value: unknown): value is RealtimeEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.version === "string" &&
    typeof candidate.metadata === "object" &&
    candidate.metadata !== null &&
    "orgId" in (candidate.metadata as Record<string, unknown>)
  );
}
