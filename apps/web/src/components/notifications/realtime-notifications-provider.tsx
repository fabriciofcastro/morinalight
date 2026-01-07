"use client";

import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { getAuthUser } from "@/lib/auth-client";
import { defaultActorId, defaultOrgId } from "@/lib/env";
import { useEffect, useState } from "react";

/**
 * Obtém orgId atual (do localStorage ou JWT)
 */
function getCurrentOrgId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Tentar obter do localStorage primeiro (seletor de organização)
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }

  // Tentar obter da primeira organização da lista
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0]!.organizationId;
      }
    } catch {
      // Ignorar erro de parsing
    }
  }

  return null;
}

/**
 * Provider para inicializar conexão WebSocket de notificações
 * Deve ser usado no layout principal da aplicação
 */
export function RealtimeNotificationsProvider() {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const user = getAuthUser();

    // Obter orgId
    const currentOrgId = getCurrentOrgId() ?? defaultOrgId ?? null;
    queueMicrotask(() => setOrgId(currentOrgId));

    // Obter userId
    const currentUserId = user?.userId ?? defaultActorId ?? null;
    queueMicrotask(() => setUserId(currentUserId));
  }, [mounted]);

  useRealtimeNotifications({
    enabled: mounted && !!orgId && !!userId,
    orgId: orgId ?? undefined,
    userId: userId ?? undefined,
  });

  return null;
}
