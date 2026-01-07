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
  isRealtime?: boolean;
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
  const seenIdsRef = useRef<Set<string>>(new Set());

  const inicioTime = inicio?.getTime();
  const fimTime = fim?.getTime();

  const matchesFilters = useCallback(
    (item: AuditTimelineItem) => {
      if (acao && item.acao !== acao) return false;

      const created = new Date(item.criadoEm).getTime();
      if (typeof inicioTime === "number" && !Number.isNaN(inicioTime) && created < inicioTime) {
        return false;
      }

      if (typeof fimTime === "number" && !Number.isNaN(fimTime) && created > fimTime) {
        return false;
      }

      return true;
    },
    [acao, fimTime, inicioTime],
  );

  const normalizeAuditItem = useCallback(
    (item: AuditTimelineResponse["auditoria"]["itens"][number]): AuditTimelineItem => ({
      id: item.id,
      acao: item.acao,
      actorId: item.actorId,
      payload: item.payload ?? null,
      criadoEm: item.criadoEm,
      isRealtime: false,
    }),
    [],
  );

  const sortByDateDesc = useCallback((items: AuditTimelineItem[]) => {
    return [...items].sort(
      (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
    );
  }, []);

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
            "x-org-id": orgId || "",
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
      const normalized = auditoria.itens.map(normalizeAuditItem);
      seenIdsRef.current = new Set(normalized.map((item) => item.id));
      setState({
        items: sortByDateDesc(normalized),
        loading: false,
        error: null,
        cursor: auditoria.proximoCursor,
      });
      lastEventIdRef.current = normalized[0]?.id ?? null;
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
    }
  }, [fetchAudit, normalizeAuditItem, sortByDateDesc]);

  const loadMore = useCallback(async () => {
    let cursorToFetch: string | undefined;
    let isAlreadyLoading = false;

    setState((prev) => {
      cursorToFetch = prev.cursor;
      isAlreadyLoading = prev.loading;
      if (!prev.cursor || prev.loading) {
        return prev;
      }
      return { ...prev, loading: true };
    });

    if (!cursorToFetch || isAlreadyLoading) return;

    try {
      const auditoria = await fetchAudit(cursorToFetch);
      const freshItems = auditoria.itens.map(normalizeAuditItem).filter((item) => {
        if (seenIdsRef.current.has(item.id)) return false;
        if (!matchesFilters(item)) return false;
        seenIdsRef.current.add(item.id);
        return true;
      });

      setState((prev) => ({
        items: sortByDateDesc([...prev.items, ...freshItems]),
        cursor: auditoria.proximoCursor,
        loading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
    }
  }, [fetchAudit, matchesFilters, normalizeAuditItem, sortByDateDesc]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const client = createRealtimeClient({
      apiUrl,
      realtimeUrl,
      orgId: orgId || "",
      actorId: actorId || "",
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
            if (!mapped || !matchesFilters(mapped)) return prev;

            if (seenIdsRef.current.has(mapped.id)) {
              return prev;
            }
            seenIdsRef.current.add(mapped.id);

            const updatedItems = sortByDateDesc([{ ...mapped, isRealtime: true }, ...prev.items]);

            return { ...prev, items: updatedItems };
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
  }, [actorId, matchesFilters, orgId, produtoId, sortByDateDesc]);

  const meta = useMemo(
    () => ({
      hasMore: Boolean(state.cursor),
      isRealtimeActive,
      realtimeHighlights: state.items.filter((item) => item.isRealtime).length,
    }),
    [state.cursor, isRealtimeActive, state.items],
  );

  const acknowledgeRealtime = useCallback(() => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.isRealtime ? { ...item, isRealtime: false } : item)),
    }));
  }, []);

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    hasMore: meta.hasMore,
    isRealtimeActive: meta.isRealtimeActive,
    realtimeHighlights: meta.realtimeHighlights,
    refresh,
    loadMore,
    lastEventId: lastEventIdRef.current,
    acknowledgeRealtime,
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
    isRealtime: true,
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
