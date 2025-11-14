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

  // Tentar obter orgId do cookie ou do JWT
  const orgId = cookieStore.get("selected_org_id")?.value;
  if (orgId) {
    headers["x-org-id"] = orgId;
  }

  return headers;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const response = await fetch(`${apiUrl}/comissoes/${params.id}/assinar`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao assinar comissão" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

