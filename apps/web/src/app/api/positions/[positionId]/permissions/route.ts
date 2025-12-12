import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

type RouteParams = {
  params: {
    positionId: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { positionId } = params;

  const response = await fetch(`${apiUrl}/positions/${positionId}/permissions`, {
    method: "GET",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar permissões do cargo" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { positionId } = params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/positions/${positionId}/permissions`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro ao atribuir permissão ao cargo" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { positionId } = params;
  const { searchParams } = new URL(request.url);
  const permissionId = searchParams.get("permissionId");

  if (!permissionId) {
    return NextResponse.json({ message: "permissionId é obrigatório" }, { status: 400 });
  }

  const response = await fetch(`${apiUrl}/positions/${positionId}/permissions/${permissionId}`, {
    method: "DELETE",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro ao remover permissão do cargo" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
