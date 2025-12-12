import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../../_lib/auth-headers";

export async function DELETE(
  _request: Request,
  { params }: { params: { sectorId: string; userId: string } },
) {
  const response = await fetch(`${apiUrl}/sectors/${params.sectorId}/members/${params.userId}`, {
    method: "DELETE",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao remover membro do setor" },
      { status: response.status },
    );
  }

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { sectorId: string; userId: string } },
) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/sectors/${params.sectorId}/members/${params.userId}`, {
    method: "PATCH",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar role do membro" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
