import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../_lib/auth-headers";

export async function GET(_request: Request) {
  void _request;
  const response = await fetch(`${apiUrl}/organizations`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar organizações" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/organizations`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao criar organização" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}
