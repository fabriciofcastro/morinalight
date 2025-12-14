import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  const response = await fetch(`${apiUrl}/users/${params.userId}/permissions/custom`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${apiUrl}/users/${params.userId}/permissions/custom`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}


