import { CreateProductUseCase } from "@/application/use-cases";
import { getContainer } from "@/infrastructure/di/container";
import { isOk } from "@/shared/kernel/types";
import { NextResponse, type NextRequest } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

import { requirePermission } from "@/lib/auth/middleware";
import { ACTIONS, RESOURCES } from "@/lib/auth/rbac";

export async function GET(request: NextRequest, context: { params: unknown }) {
  // RBAC Check
  const authResponse = await requirePermission(ACTIONS.READ, RESOURCES.PRODUCTS)(request, context);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const params = new URLSearchParams();

  searchParams.forEach((value, key) => {
    params.append(key, value);
  });

  const response = await fetch(`${apiUrl}/catalogo/produtos?${params.toString()}`, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao buscar produtos" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, context: { params: unknown }) {
  // RBAC Check
  const authResponse = await requirePermission(ACTIONS.CREATE, RESOURCES.PRODUCTS)(request, context);
  if (authResponse) return authResponse;

  const body = await request.json();

  try {
    const container = getContainer();
    const createProductUseCase = container.resolve<CreateProductUseCase>('CreateProductUseCase');
    
    const result = await createProductUseCase.execute(body);

    if (!isOk(result)) {
      // Map error to appropriate status code
      return NextResponse.json({ 
        message: result.error.message,
        // Add error details/code if available in your error classes
      }, { status: 400 });
    }

    return NextResponse.json(result.value, { status: 201 });
  } catch (err: any) {
    console.error("Error creating product:", err);
    return NextResponse.json({ message: err.message || "Erro ao criar produto" }, { status: 500 });
  }
}
