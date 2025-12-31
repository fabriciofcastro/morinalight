import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{
    branchId: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { branchId } = await params;
  const response = await fetch(`${apiUrl}/branches/${branchId}`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { branchId } = await params;
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${apiUrl}/branches/${branchId}`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { branchId } = await params;
  const response = await fetch(`${apiUrl}/branches/${branchId}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
