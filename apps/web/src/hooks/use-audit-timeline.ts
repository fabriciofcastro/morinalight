"use client";

import { createRealtimeClient, type RealtimeEvent } from "@morina/realtime-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { apiUrl, defaultActorId, defaultOrgId, realtimeUrl } from "@/lib/env";

export type AuditTimelineItem = {
  id: string;
  acao: string;
  actorId: string;
  payload: Record<string, unknown> | null;
  criadoEm: string;
};

type AuditTimelineResponse = {
  produto: {
    produtoId: string;
    nome: string;
    status: string;
  };
  auditoria: {
    itens: Array<{
      id: string;
      acao: string;
      actorId: string;
      payload: Record<string, unknown> | null;
      criadoEm: string;
    }>;
    proximoCursor?: string;
  };
};

type UseAuditTimelineOptions = {
  produtoId: string;
  orgId?: string;
  actorId?: string;
  acao?: string;
  inicio?: Date;
  fim?: Date;
};

type State = {
  items: AuditTimelineItem[];
  loading: boolean;
  error: string | null;
  cursor?: string;
};

export function useAuditTimeline({
  produtoId,
  orgId = defaultOrgId,
  actorId = defaultActorId,
  acao,
  inicio,
  fim,
}: UseAuditTimelineOptions) {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null });
  const [isRealtimeActive, setRealtimeActive] = useState(false);
  const realtimeRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
  const lastEventIdRef = useRef<string | null>(null);

  const fetchAudit = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      params.set("limite", "50");
      if (cursor) params.set("cursor", cursor);
      if (acao) params.set("acao", acao);
      if (inicio) params.set("inicio", inicio.toISOString());
      if (fim) params.set("fim", fim.toISOString());

      const response = await fetch(
        `${apiUrl}/catalogo/produtos/${produtoId}/auditoria?${params.toString()}`,
        {
          headers: {
            "x-org-id": orgId,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(`Falha ao buscar auditoria (${response.status})`);
      }

      const data = (await response.json()) as AuditTimelineResponse;
      return data.auditoria;
    },
    [acao, fim, inicio, orgId, produtoId],
  );

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const auditoria = await fetchAudit();
      setState({
        items: auditoria.itens,
        loading: false,
        error: null,
        cursor: auditoria.proximoCursor,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
    }
  }, [fetchAudit]);

  const loadMore = useCallback(async () => {
    if (!state.cursor || state.loading) return;
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const auditoria = await fetchAudit(state.cursor);
      setState((prev) => ({
        items: [...prev.items, ...auditoria.itens],
        cursor: auditoria.proximoCursor,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
    }
  }, [fetchAudit, state.cursor, state.loading]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const client = createRealtimeClient({
      apiUrl,
      realtimeUrl,
      orgId,
      actorId,
      onEvent: (event) => {
        lastEventIdRef.current = event.metadata.eventId;
        if (
          event.payload &&
          typeof event.payload === "object" &&
          "produtoId" in event.payload &&
          (event.payload as Record<string, unknown>).produtoId === produtoId
        ) {
          setState((prev) => {
            const exists = prev.items.some((item) => item.id === event.metadata.eventId);
            if (exists) return prev;

            const mapped = mapEventToTimelineItem(event);
            if (!mapped) return prev;

            return {
              ...prev,
              items: [mapped, ...prev.items],
            };
          });
        }
      },
      onOpen: () => setRealtimeActive(true),
      onClose: () => setRealtimeActive(false),
      onError: () => setRealtimeActive(false),
    });

    realtimeRef.current = client;
    void client.connect();

    return () => {
      client.disconnect();
    };
  }, [actorId, orgId, produtoId]);

  const meta = useMemo(
    () => ({ hasMore: Boolean(state.cursor), isRealtimeActive }),
    [state.cursor, isRealtimeActive],
  );

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    hasMore: meta.hasMore,
    isRealtimeActive: meta.isRealtimeActive,
    refresh,
    loadMore,
    lastEventId: lastEventIdRef.current,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Erro inesperado";
}

function mapEventToTimelineItem(event: RealtimeEvent): AuditTimelineItem | null {
  const action = mapEventNameToAction(event.name);
  if (!action) return null;

  return {
    id: event.metadata.eventId,
    acao: action,
    actorId: event.metadata.actorId,
    payload: (event.payload as Record<string, unknown>) ?? null,
    criadoEm: event.metadata.timestamp ?? new Date().toISOString(),
  };
}

function mapEventNameToAction(eventName: string) {
  switch (eventName) {
    case "Catalogo.ProdutoCadastrado":
      return "produto_criado";
    case "Catalogo.ProdutoAprovado":
      return "produto_aprovado";
    case "Catalogo.ProdutoReprovado":
      return "produto_reprovado";
    default:
      return null;
  }
}
