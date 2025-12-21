import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  const userId = searchParams.get("userId");
  if (userId) params.append("userId", userId);
  const permission = searchParams.get("permission");
  if (permission) params.append("permission", permission);
  const granted = searchParams.get("granted");
  if (granted) params.append("granted", granted);
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

  const response = await fetch(`${apiUrl}/permissions/access-audit-log?${params.toString()}`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar logs de acesso" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}





