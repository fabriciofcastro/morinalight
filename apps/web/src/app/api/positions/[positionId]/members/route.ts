import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: Promise<{ positionId: string }> }) {
  const { positionId } = await params;
  const response = await fetch(`${apiUrl}/positions/${positionId}/members`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar membros do cargo" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ positionId: string }> }) {
  const { positionId } = await params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/positions/${positionId}/members`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao adicionar membro ao cargo" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ positionId: string }> },
) {
  const { positionId } = await params;
  const { membershipId, ...body } = await request.json();

  const response = await fetch(
    `${apiUrl}/positions/${positionId}/members/${membershipId}`,
    {
      method: "PATCH",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar membro do cargo" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ positionId: string }> },
) {
  const { positionId } = await params;
  const url = new URL(request.url);
  const membershipId = url.searchParams.get("membershipId");

  if (!membershipId) {
    return NextResponse.json({ message: "membershipId é obrigatório" }, { status: 400 });
  }

  const response = await fetch(
    `${apiUrl}/positions/${positionId}/members/${membershipId}`,
    {
      method: "DELETE",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao remover membro do cargo" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}
