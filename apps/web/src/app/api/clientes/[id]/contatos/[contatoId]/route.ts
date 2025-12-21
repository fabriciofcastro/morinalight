import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function PUT(
  request: Request,
  { params }: { params: { id: string; contatoId: string } },
) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/clientes/${params.id}/contatos/${params.contatoId}`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar contato" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; contatoId: string } },
) {
  const response = await fetch(`${apiUrl}/clientes/${params.id}/contatos/${params.contatoId}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao deletar contato" },
      { status: response.status },
    );
  }

  return NextResponse.json(null, { status: 204 });
}


