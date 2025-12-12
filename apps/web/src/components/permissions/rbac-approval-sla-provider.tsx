"use client";

import { useEffect, useRef } from "react";

type Props = {
  enabled?: boolean;
  intervalMs?: number;
};

export function RbacApprovalSlaProvider({ enabled = true, intervalMs = 60_000 }: Props) {
  const runningRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const tick = async () => {
      if (runningRef.current) return;
      runningRef.current = true;
      try {
        await fetch("/api/permissions/change-requests/sweep-sla", { method: "POST" });
      } catch {
        // silencioso: SLA sweep é best-effort
      } finally {
        runningRef.current = false;
      }
    };

    // executar logo ao montar
    void tick();
    const id = window.setInterval(() => {
      void tick();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);

  return null;
}
