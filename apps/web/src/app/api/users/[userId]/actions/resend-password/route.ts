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

    const response = await fetch(`${apiUrl}/users/${userId}/actions/resend-password`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao reenviar senha" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao reenviar senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao reenviar senha" },
      { status: 500 },
    );
  }
}
