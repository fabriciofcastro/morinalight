
import { NextRequest, NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../_lib/auth-headers";
import { requirePermission } from "@/lib/auth/middleware";
import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";
import { CreateUserUseCase } from "@/lib/use-cases/create-user";
import { container } from "@/lib/di/container";
import { protectedRouteMiddleware } from "@/lib/middleware/security-middleware";

export async function GET(request: NextRequest, context: { params: any }) {
  // Aplicar middleware de segurança
  const middlewareResult = await protectedRouteMiddleware(request, context);
  if (middlewareResult) return middlewareResult;

  // Check Permissions
  const authResult = await requirePermission(ACTIONS.READ, RESOURCES.USERS)(request, context);
  if (authResult) return authResult;

  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  const response = await fetch(`${apiUrl}/users?${params.toString()}`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao buscar usuários" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, context: { params: any }) {
  // Aplicar middleware de segurança
  const middlewareResult = await protectedRouteMiddleware(request, context);
  if (middlewareResult) return middlewareResult;

  // Check Permissions
  const authResult = await requirePermission(ACTIONS.CREATE, RESOURCES.USERS)(request, context);
  if (authResult) return authResult;

  const body = await request.json();

  try {
    // Clean Architecture: Controller -> Use Case
    const createUserUseCase = new CreateUserUseCase(); // Or container.resolve if we register UseCases
    const newUser = await createUserUseCase.execute(body);

    return NextResponse.json(newUser, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Erro ao criar usuário" }, { status: 400 });
  }
}
