import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { searchParams } = new URL(request.url);
  const paramsQuery = new URLSearchParams();

  // Filtrar por usuário específico
  paramsQuery.append("entityType", "user");
  paramsQuery.append("entityId", params.userId);

  // Parâmetros opcionais
  const action = searchParams.get("action");
  if (action) paramsQuery.append("action", action);
  const search = searchParams.get("search");
  if (search) paramsQuery.append("search", search);
  const dataInicio = searchParams.get("dataInicio");
  if (dataInicio) paramsQuery.append("dataInicio", dataInicio);
  const dataFim = searchParams.get("dataFim");
  if (dataFim) paramsQuery.append("dataFim", dataFim);
  const cursor = searchParams.get("cursor");
  if (cursor) paramsQuery.append("cursor", cursor);
  const limite = searchParams.get("limite");
  if (limite) paramsQuery.append("limite", limite);

  const response = await fetch(`${apiUrl}/permissions/audit-log?${paramsQuery.toString()}`, {
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



