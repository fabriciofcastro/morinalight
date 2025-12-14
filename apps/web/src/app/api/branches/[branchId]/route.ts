import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

type RouteParams = {
  params: {
    branchId: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/branches/${params.branchId}`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${apiUrl}/branches/${params.branchId}`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/branches/${params.branchId}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
