import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/notifications/${params.id}`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao buscar notificação" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/notifications/${params.id}`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao atualizar notificação" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/notifications/${params.id}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao excluir notificação" }));
    return NextResponse.json(error, { status: response.status });
  }

  return new NextResponse(null, { status: 204 });
}

