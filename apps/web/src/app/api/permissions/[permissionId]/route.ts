import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: Promise<{ permissionId: string }> }) {
  const { permissionId } = await params;
  const response = await fetch(`${apiUrl}/permissions/${permissionId}`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao buscar permissão" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: Promise<{ permissionId: string }> }) {
  const { permissionId } = await params;
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${apiUrl}/permissions/${permissionId}`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Erro ao atualizar permissão");
    return NextResponse.json({ message }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ permissionId: string }> }) {
  const { permissionId } = await params;
  const response = await fetch(`${apiUrl}/permissions/${permissionId}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Erro ao deletar permissão");
    return NextResponse.json({ message }, { status: response.status });
  }

  return NextResponse.json(null, { status: 204 });
}
