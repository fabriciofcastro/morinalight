import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function PUT(request: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/organizational-units/${unitId}`, {
    method: "PUT",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar unidade organizacional" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const response = await fetch(`${apiUrl}/organizational-units/${unitId}`, {
    method: "DELETE",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao deletar unidade organizacional" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true }, { status: 204 });
}
