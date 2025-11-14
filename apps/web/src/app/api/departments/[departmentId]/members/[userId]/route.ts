import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";

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

export async function DELETE(
  _request: Request,
  { params }: { params: { departmentId: string; userId: string } },
) {
  const response = await fetch(
    `${apiUrl}/departments/${params.departmentId}/members/${params.userId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao remover membro do departamento" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true }, { status: 204 });
}

export async function PATCH(
  request: Request,
  { params }: { params: { departmentId: string; userId: string } },
) {
  const body = await request.json();

  const response = await fetch(
    `${apiUrl}/departments/${params.departmentId}/members/${params.userId}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
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
