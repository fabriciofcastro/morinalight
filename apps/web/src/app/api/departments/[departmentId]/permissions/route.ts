import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";

type RouteParams = {
  params: {
    departmentId: string;
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
  const response = await fetch(`${apiUrl}/departments/${params.departmentId}/permissions`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/departments/${params.departmentId}/permissions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { searchParams } = new URL(request.url);
  const permissionId = searchParams.get("permissionId");

  if (!permissionId) {
    return NextResponse.json({ message: "permissionId é obrigatório" }, { status: 400 });
  }

  const response = await fetch(
    `${apiUrl}/departments/${params.departmentId}/permissions/${permissionId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    },
  );

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
