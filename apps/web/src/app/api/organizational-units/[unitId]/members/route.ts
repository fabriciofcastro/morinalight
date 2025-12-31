import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const response = await fetch(`${apiUrl}/organizational-units/${unitId}/members`, {
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar membros da unidade" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/organizational-units/${unitId}/members`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao adicionar membro à unidade" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}
