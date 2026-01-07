import { ListUsersQuery } from "@/application/queries";
import { CreateUserUseCase } from "@/application/use-cases";
import { getContainer } from "@/infrastructure/di/container";
import { requirePermission } from "@/lib/auth/middleware";
import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";
import { apiUrl } from "@/lib/env";
import { protectedRouteMiddleware } from "@/lib/middleware/security-middleware";
import { isOk } from "@/shared/kernel/types";
import { NextRequest, NextResponse } from "next/server";
import { buildAuthHeaders } from "../_lib/auth-headers";

export async function GET(request: NextRequest, context: { params: any }) {
  // Aplicar middleware de segurança
  const middlewareResult = await protectedRouteMiddleware(request, context);
  if (middlewareResult) return middlewareResult;

  // Check Permissions
  const authResult = await requirePermission(ACTIONS.READ, RESOURCES.USERS)(request, context);
  if (authResult) return authResult;

  try {
    const container = getContainer();
    const listUsersQuery = container.resolve<ListUsersQuery>('ListUsersQuery');
    
    // TODO: Implement pagination in ListUsersQuery if needed
    const users = await listUsersQuery.execute();
    
    return NextResponse.json(users);
  } catch (err: any) {
    // Fallback to old API if query fails or is not yet optimized for all use cases
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => params.append(key, value));

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
    const container = getContainer();
    const createUserUseCase = container.resolve<CreateUserUseCase>('CreateUserUseCase');
    
    const result = await createUserUseCase.execute(body);

    if (!isOk(result)) {
      return NextResponse.json({ 
        message: result.error.message,
        code: (result.error as any).code 
      }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Erro ao criar usuário" }, { status: 400 });
  }
}
