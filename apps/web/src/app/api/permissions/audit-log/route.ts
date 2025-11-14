import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";

function getAuthHeaders(): HeadersInit {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return {};
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const orgId = cookieStore.get("selected_org_id")?.value;
  if (orgId) {
    headers["x-org-id"] = orgId;
  }

  return headers;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  if (searchParams.get("entityType")) {
    params.append("entityType", searchParams.get("entityType")!);
  }
  if (searchParams.get("entityId")) {
    params.append("entityId", searchParams.get("entityId")!);
  }
  if (searchParams.get("permissionId")) {
    params.append("permissionId", searchParams.get("permissionId")!);
  }
  if (searchParams.get("action")) {
    params.append("action", searchParams.get("action")!);
  }
  if (searchParams.get("actorId")) {
    params.append("actorId", searchParams.get("actorId")!);
  }
  if (searchParams.get("dataInicio")) {
    params.append("dataInicio", searchParams.get("dataInicio")!);
  }
  if (searchParams.get("dataFim")) {
    params.append("dataFim", searchParams.get("dataFim")!);
  }
  if (searchParams.get("cursor")) {
    params.append("cursor", searchParams.get("cursor")!);
  }
  if (searchParams.get("limite")) {
    params.append("limite", searchParams.get("limite")!);
  }

  const response = await fetch(`${apiUrl}/permissions/audit-log?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
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
