"use client";

import { createRealtimeClient, type RealtimeEvent } from "@morina/realtime-client";
import { useEffect, useRef, useState } from "react";
import { invalidatePermissionsCache, refreshPermissionsCache } from "@/hooks/use-permissions";
import { getAuthUser } from "@/lib/auth-client";
import { defaultActorId, defaultOrgId, realtimeUrl } from "@/lib/env";

function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }

  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0].organizationId;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

function isPermissionsEvent(eventName: unknown): boolean {
  if (typeof eventName !== "string") return false;

  // Eventos do RBAC que publicamos no backend (e também os já existentes: Permission/Role CRUD).
  if (eventName.startsWith("Permissions.")) return true;
  if (eventName.includes("Permission") || eventName.includes("Role")) return true;

  return false;
}

/**
 * Mantém o cache de permissões do usuário sempre coerente com a mensageria (Redis → realtime).
 * Ao receber eventos `Permissions.*`, invalida e refaz o cache do usuário atual.
 */
export function RealtimePermissionsProvider() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const clientRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
  const isConnectingRef = useRef(false);
  const lastRefreshAtRef = useRef<number>(0);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const user = getAuthUser();
    const nextOrgId = getCurrentOrgId() ?? defaultOrgId;
    const nextUserId = user?.userId ?? defaultActorId;
    queueMicrotask(() => {
      setOrgId(nextOrgId);
      setUserId(nextUserId);
    });
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !orgId || !userId) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (isConnectingRef.current || clientRef.current) {
      return;
    }

    isConnectingRef.current = true;

    const client = createRealtimeClient({
      apiUrl: typeof window !== "undefined" ? window.location.origin : "",
      realtimeUrl,
      orgId,
      actorId: userId,
      onEvent: (event: RealtimeEvent) => {
        if (!isPermissionsEvent(event.name)) return;

        // Invalida o cache do usuário atual. Em seguida, refaz para refletir imediatamente.
        invalidatePermissionsCache(userId);

        const now = Date.now();
        if (now - lastRefreshAtRef.current < 750) {
          return;
        }
        lastRefreshAtRef.current = now;

        void refreshPermissionsCache(userId).then(() => {
          window.dispatchEvent(
            new CustomEvent("realtime-permissions-refreshed", {
              detail: { event },
            }),
          );
        });
      },
      onOpen: () => {
        // conexão ok
      },
      onClose: () => {
        clientRef.current = null;
        isConnectingRef.current = false;
      },
      onError: () => {
        // não crítico (ambientes sem WS/Redis)
        clientRef.current = null;
        isConnectingRef.current = false;
      },
      reconnectAttempts: 10,
      reconnectIntervalMs: 3000,
    });

    clientRef.current = client;
    void client.connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
        isConnectingRef.current = false;
      }
    };
  }, [mounted, orgId, userId]);

  return null;
}
