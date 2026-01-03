import { NextRequest, NextResponse } from "next/server";
import { adminRouteMiddleware } from "@/lib/middleware/security-middleware";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../_lib/auth-headers";

export async function GET(request: NextRequest, context: any) {
  // Aplicar middleware de segurança admin
  const middlewareResult = await adminRouteMiddleware(request, context);
  if (middlewareResult) return middlewareResult;

  const response = await fetch(`${apiUrl}/roles`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao listar perfis" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, context: any) {
  // Aplicar middleware de segurança admin
  const middlewareResult = await adminRouteMiddleware(request, context);
  if (middlewareResult) return middlewareResult;

  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${apiUrl}/roles`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Erro ao criar perfil");
    return NextResponse.json({ message }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}
