import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const response = await fetch(`${apiUrl}/clientes/${params.id}/contatos`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao listar contatos" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/clientes/${params.id}/contatos`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao criar contato" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}


