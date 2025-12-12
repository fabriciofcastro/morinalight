import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

type RouteParams = {
  params: {
    departmentId: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/departments/${params.departmentId}/permissions`, {
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/departments/${params.departmentId}/permissions`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
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
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    },
  );

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
