import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params;
  const response = await fetch(`${apiUrl}/branches/${branchId}/members`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar membros da filial" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ branchId: string }> }) {
  const { branchId } = await params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/branches/${branchId}/members`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao adicionar membro à filial" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await params;
  const { membershipId, ...body } = await request.json();

  const response = await fetch(
    `${apiUrl}/branches/${branchId}/members/${membershipId}`,
    {
      method: "PATCH",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar membro da filial" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> },
) {
  const { branchId } = await params;
  const url = new URL(request.url);
  const membershipId = url.searchParams.get("membershipId");

  if (!membershipId) {
    return NextResponse.json({ message: "membershipId é obrigatório" }, { status: 400 });
  }

  const response = await fetch(
    `${apiUrl}/branches/${branchId}/members/${membershipId}`,
    {
      method: "DELETE",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao remover membro da filial" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}


