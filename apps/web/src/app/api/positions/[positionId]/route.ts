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

export async function PUT(
  request: Request,
  { params }: { params: { positionId: string } },
) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/positions/${params.positionId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(
  request: Request,
  { params }: { params: { positionId: string } },
) {
  const response = await fetch(`${apiUrl}/positions/${params.positionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

