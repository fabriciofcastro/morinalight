import { NextResponse, NextRequest } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

import { requirePermission } from "@/lib/auth/middleware";
import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";

export async function GET(request: NextRequest, { params }: RouteParams) {
  // RBAC Check
  const authResponse = await requirePermission(ACTIONS.READ, RESOURCES.PRODUCTS)(request, { params });
  if (authResponse) return authResponse;

  const { id } = await params;
  const response = await fetch(`${apiUrl}/catalogo/produtos/${id}`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Produto não encontrado" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  // RBAC Check
  const authResponse = await requirePermission(ACTIONS.UPDATE, RESOURCES.PRODUCTS)(request, { params });
  if (authResponse) return authResponse;

  const { id } = await params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/catalogo/produtos/${id}`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar produto" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // RBAC Check
  const authResponse = await requirePermission(ACTIONS.DELETE, RESOURCES.PRODUCTS)(request, { params });
  if (authResponse) return authResponse;

  const { id } = await params;
  const response = await fetch(`${apiUrl}/catalogo/produtos/${id}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao excluir produto" }, { status: response.status });
  }

  return NextResponse.json({}, { status: 204 });
}
