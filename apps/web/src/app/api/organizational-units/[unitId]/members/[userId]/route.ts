import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ unitId: string; userId: string }> },
) {
  const { unitId, userId } = await params;
  const response = await fetch(
    `${apiUrl}/organizational-units/${unitId}/members/${userId}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao remover membro da unidade" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true }, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ unitId: string; userId: string }> },
) {
  const { unitId, userId } = await params;
  const body = await request.json();

  const response = await fetch(
    `${apiUrl}/organizational-units/${unitId}/members/${userId}`,
    {
      method: "PATCH",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    },
  );

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
