import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

type RouteParams = {
  params: {
    sectorId: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { sectorId } = params;

  const response = await fetch(`${apiUrl}/sectors/${sectorId}`, {
    method: "GET",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao buscar setor" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const body = await request.json().catch(() => ({}));
  const { sectorId } = params;

  const response = await fetch(`${apiUrl}/sectors/${sectorId}`, {
    method: "PUT",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { sectorId } = params;

  const response = await fetch(`${apiUrl}/sectors/${sectorId}`, {
    method: "DELETE",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
