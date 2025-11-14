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

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  const { searchParams } = new URL(request.url);
  const permission = searchParams.get("permission");

  if (!permission) {
    return NextResponse.json(
      { message: "permission é obrigatório" },
      { status: 400 },
    );
  }

  const response = await fetch(
    `${apiUrl}/users/${params.userId}/permissions/check?permission=${encodeURIComponent(permission)}`,
    {
      headers: getAuthHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao verificar permissão" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}


