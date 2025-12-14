import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  const entityType = searchParams.get("entityType");
  if (entityType) {
    params.append("entityType", entityType);
  }
  const isDefault = searchParams.get("isDefault");
  if (isDefault) {
    params.append("isDefault", isDefault);
  }
  const isSystem = searchParams.get("isSystem");
  if (isSystem) {
    params.append("isSystem", isSystem);
  }

  const response = await fetch(`${apiUrl}/permissions/templates?${params.toString()}`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar templates de permissões" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/permissions/templates`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro ao criar template de permissões" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
