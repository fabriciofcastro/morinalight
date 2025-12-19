import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: { sectorId: string } }) {
  const response = await fetch(`${apiUrl}/sectors/${params.sectorId}/permissions`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar permissões do setor" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: { sectorId: string } }) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/sectors/${params.sectorId}/permissions`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao adicionar permissão ao setor" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { sectorId: string } },
) {
  const url = new URL(request.url);
  const permissionId = url.searchParams.get("permissionId");

  if (!permissionId) {
    return NextResponse.json({ message: "permissionId é obrigatório" }, { status: 400 });
  }

  const response = await fetch(
    `${apiUrl}/sectors/${params.sectorId}/permissions/${permissionId}`,
    {
      method: "DELETE",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao remover permissão do setor" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}
