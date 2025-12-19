import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const cursor = searchParams.get("cursor") || "";

    const params = new URLSearchParams();
    if (limit) params.append("limit", limit);
    if (cursor) params.append("cursor", cursor);

    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    const response = await fetch(`${apiUrl}/profile/password-history?${params.toString()}`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao buscar histórico de senhas" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar histórico de senhas:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar histórico de senhas" },
      { status: 500 },
    );
  }
}



