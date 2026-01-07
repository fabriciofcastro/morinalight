import { NextResponse, type NextRequest } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

import { requirePermission } from "@/lib/auth/middleware";
import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";

export async function GET(request: NextRequest, context: { params: unknown }) {
  // RBAC Check
  const authResponse = await requirePermission(ACTIONS.READ, RESOURCES.PRODUCTS)(request, context);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  const response = await fetch(`${apiUrl}/catalogo/produtos?${params.toString()}`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao buscar produtos" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, context: { params: unknown }) {
  // RBAC Check
  const authResponse = await requirePermission(ACTIONS.CREATE, RESOURCES.PRODUCTS)(request, context);
  if (authResponse) return authResponse;

  const body = await request.json();

  const response = await fetch(`${apiUrl}/catalogo/produtos`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao criar produto" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}
