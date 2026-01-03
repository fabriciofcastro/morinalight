import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  const entityType = searchParams.get("entityType");
  if (entityType) params.append("entityType", entityType);
  const entityId = searchParams.get("entityId");
  if (entityId) params.append("entityId", entityId);
  const permissionId = searchParams.get("permissionId");
  if (permissionId) params.append("permissionId", permissionId);
  const action = searchParams.get("action");
  if (action) params.append("action", action);
  const actorId = searchParams.get("actorId");
  if (actorId) params.append("actorId", actorId);
  const userId = searchParams.get("userId");
  if (userId) params.append("userId", userId);
  const search = searchParams.get("search");
  if (search) params.append("search", search);
  const dataInicio = searchParams.get("dataInicio");
  if (dataInicio) params.append("dataInicio", dataInicio);
  const dataFim = searchParams.get("dataFim");
  if (dataFim) params.append("dataFim", dataFim);
  const cursor = searchParams.get("cursor");
  if (cursor) params.append("cursor", cursor);
  const limite = searchParams.get("limite");
  if (limite) params.append("limite", limite);

  const response = await fetch(`${apiUrl}/permissions/audit-log?${params.toString()}`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar histórico de permissões" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
