import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const body = await request.json().catch(() => ({}));
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    const response = await fetch(`${apiUrl}/users/${params.userId}/actions/suspend`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao suspender usuário" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao suspender usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao suspender usuário" },
      { status: 500 },
    );
  }
}

