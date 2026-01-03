import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    const response = await fetch(`${apiUrl}/users/${userId}/actions/reactivate`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao reativar usuário" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao reativar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao reativar usuário" },
      { status: 500 },
    );
  }
}



