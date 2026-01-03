import { describe, expect, it } from "vitest";

import type { AuditTimelineItem } from "@/hooks/use-audit-timeline";
import { groupByDate } from "./audit-timeline";

describe("groupByDate", () => {
  it("agrupa eventos por data formatada", () => {
    const base = new Date("2025-01-01T12:00:00Z");
    const items: AuditTimelineItem[] = [
      {
        id: "1",
        acao: "produto_criado",
        actorId: "user-1",
        payload: null,
        criadoEm: new Date(base).toISOString(),
      },
      {
        id: "2",
        acao: "produto_aprovado",
        actorId: "user-2",
        payload: null,
        criadoEm: new Date(base.getTime() + 60_000).toISOString(),
      },
      {
        id: "3",
        acao: "produto_reprovado",
        actorId: "user-3",
        payload: null,
        criadoEm: new Date("2025-01-02T09:00:00Z").toISOString(),
      },
    ];

    const groups = groupByDate(items);

    expect(groups).toHaveLength(2);
    expect(groups[0].entries).toHaveLength(2);
    expect(groups[1].entries).toHaveLength(1);
  });
});
