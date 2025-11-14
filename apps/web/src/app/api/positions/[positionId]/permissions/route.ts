import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";

type RouteParams = {
  params: {
    positionId: string;
  };
};

function getAuthHeaders(): HeadersInit {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return {};
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const orgId = cookieStore.get("selected_org_id")?.value;
  if (orgId) {
    headers["x-org-id"] = orgId;
  }

  return headers;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { positionId } = params;

  const response = await fetch(`${apiUrl}/positions/${positionId}/permissions`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar permissões do cargo" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { positionId } = params;
  const body = await request.json();

  const response = await fetch(`${apiUrl}/positions/${positionId}/permissions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro ao atribuir permissão ao cargo" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { positionId } = params;
  const { searchParams } = new URL(request.url);
  const permissionId = searchParams.get("permissionId");

  if (!permissionId) {
    return NextResponse.json({ message: "permissionId é obrigatório" }, { status: 400 });
  }

  const response = await fetch(`${apiUrl}/positions/${positionId}/permissions/${permissionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erro ao remover permissão do cargo" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
