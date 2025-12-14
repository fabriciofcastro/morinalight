import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paramsQuery = new URLSearchParams();

  // Parâmetros opcionais
  const entityType = searchParams.get("entityType");
  if (entityType) paramsQuery.append("entityType", entityType);
  const entityId = searchParams.get("entityId");
  if (entityId) paramsQuery.append("entityId", entityId);
  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) paramsQuery.append("dataInicio", dateFrom);
  const dateTo = searchParams.get("dateTo");
  if (dateTo) paramsQuery.append("dataFim", dateTo);
  const search = searchParams.get("search");
  if (search) paramsQuery.append("search", search);
  const cursor = searchParams.get("cursor");
  if (cursor) paramsQuery.append("cursor", cursor);
  const limite = searchParams.get("limite");
  if (limite) paramsQuery.append("limite", limite);

  try {
    const response = await fetch(`${apiUrl}/organizational-structure/audit-log?${paramsQuery.toString()}`, {
      method: "GET",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ itens: [] });
    }

    const data = await response.json();

    // Mapear os dados para o formato esperado pelo frontend
    const mappedItems = (data.itens || []).map((item: {
      id: string;
      entityType: string;
      entityId: string;
      action: string;
      actorId: string;
      createdAt: string;
      payload?: {
        field?: string;
        oldValue?: string | null;
        newValue?: string | null;
        reason?: string | null;
        performedByEmail?: string | null;
      };
    }) => {
      const payload = item.payload || {};
      return {
        id: item.id,
        entityType: item.entityType,
        entityId: item.entityId,
        action: item.action,
        field: payload.field || "unknown",
        oldValue: payload.oldValue || null,
        newValue: payload.newValue || null,
        performedBy: item.actorId,
        performedByEmail: payload.performedByEmail || null,
        performedAt: item.createdAt,
        reason: payload.reason || null,
      };
    });

    return NextResponse.json({ itens: mappedItems });
  } catch (error) {
    console.error("Erro ao buscar auditoria da estrutura organizacional:", error);
    return NextResponse.json({ itens: [] });
  }
}

