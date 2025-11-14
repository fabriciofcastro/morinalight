"use client";

import { useEffect, useState } from "react";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { getAuthToken, getAuthUser } from "@/lib/auth-client";
import { defaultActorId, defaultOrgId } from "@/lib/env";

/**
 * Decodifica JWT para obter informações do usuário
 */
function decodeJwt(token: string): {
  sub?: string;
  email?: string;
  defaultOrgId?: string | null;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Obtém orgId atual (do localStorage ou JWT)
 */
function getCurrentOrgId(token: string | null): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Tentar obter do localStorage primeiro (seletor de organização)
  const selectedOrgId = localStorage.getItem("selected_org_id");
  if (selectedOrgId) {
    return selectedOrgId;
  }

  // Tentar obter do JWT
  if (token) {
    const payload = decodeJwt(token);
    if (payload?.defaultOrgId) {
      return payload.defaultOrgId;
    }
  }

  // Tentar obter da primeira organização da lista
  const orgsStr = localStorage.getItem("auth_organizations");
  if (orgsStr) {
    try {
      const orgs = JSON.parse(orgsStr) as Array<{ organizationId: string }>;
      if (orgs.length > 0) {
        return orgs[0].organizationId;
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
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const token = getAuthToken();
    const user = getAuthUser();

    // Obter orgId
    const currentOrgId = getCurrentOrgId(token) ?? defaultOrgId;
    setOrgId(currentOrgId);

    // Obter userId
    const currentUserId = user?.userId ?? (token ? decodeJwt(token)?.sub : null) ?? defaultActorId;
    setUserId(currentUserId);
  }, [mounted]);

  useRealtimeNotifications({
    enabled: mounted && !!orgId && !!userId,
    orgId: orgId ?? undefined,
    userId: userId ?? undefined,
  });

  return null;
}
