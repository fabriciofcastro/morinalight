import { NextRequest, NextResponse } from "next/server";
import { getAuthHeadersWithTenant } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get("orgId");
    const status = searchParams.get("status") || "ativo";
    const departmentId = searchParams.get("departmentId");
    const busca = searchParams.get("busca");
    const cursor = searchParams.get("cursor");
    const limite = searchParams.get("limite") || "50";

    if (!orgId) {
      return NextResponse.json({ error: "orgId é obrigatório" }, { status: 400 });
    }

    const params = new URLSearchParams();
    params.append("orgId", orgId);
    params.append("status", status);
    if (departmentId) params.append("departmentId", departmentId);
    if (busca) params.append("busca", busca);
    if (cursor) params.append("cursor", cursor);
    params.append("limite", limite);

    const headers = getAuthHeadersWithTenant();
    const response = await fetch(`${API_URL}/organizations/${orgId}/subdepartments?${params.toString()}`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar subdepartamentos" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar subdepartamentos:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar subdepartamentos" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.orgId;

    if (!orgId) {
      return NextResponse.json({ error: "orgId é obrigatório" }, { status: 400 });
    }

    const headers = getAuthHeadersWithTenant();
    const response = await fetch(`${API_URL}/organizations/${orgId}/subdepartments`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao criar subdepartamento" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao criar subdepartamento:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar subdepartamento" },
      { status: 500 },
    );
  }
}




