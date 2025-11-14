import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";

type RouteParams = {
  params: {
    id: string;
  };
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) {
    return {};
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Tentar obter orgId do cookie ou do JWT
  const orgId = cookieStore.get("selected_org_id")?.value;
  if (orgId) {
    headers["x-org-id"] = orgId;
  }

  return headers;
}

export async function GET(request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/catalogo/produtos/${params.id}`, {
    headers: await getAuthHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Produto não encontrado" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/catalogo/produtos/${params.id}`, {
    method: "PUT",
    headers: {
      ...(await getAuthHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao atualizar produto" },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/catalogo/produtos/${params.id}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao excluir produto" },
      { status: response.status }
    );
  }

  return NextResponse.json({}, { status: 204 });
}

