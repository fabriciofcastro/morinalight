import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{ id: string;
   }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const response = await fetch(`${apiUrl}/suppliers/${id}`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Fornecedor não encontrado" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/suppliers/${id}`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar fornecedor" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const response = await fetch(`${apiUrl}/suppliers/${id}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao excluir fornecedor" },
      { status: response.status },
    );
  }

  return NextResponse.json({}, { status: 204 });
}
