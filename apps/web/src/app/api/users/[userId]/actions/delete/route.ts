import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const body = await request.json().catch(() => ({}));
    
    if (!body.reason || body.reason.trim() === "") {
      return NextResponse.json(
        { error: "Motivo da exclusão é obrigatório" },
        { status: 400 },
      );
    }

    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    const response = await fetch(`${apiUrl}/users/${userId}/actions/delete`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao excluir usuário" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir usuário" },
      { status: 500 },
    );
  }
}
