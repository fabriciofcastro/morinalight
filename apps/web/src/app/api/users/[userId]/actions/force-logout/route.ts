import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function POST(
  _request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });

    const response = await fetch(`${apiUrl}/users/${params.userId}/actions/force-logout`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Erro ao forçar logout" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao forçar logout:", error);
    return NextResponse.json(
      { error: "Erro interno ao forçar logout" },
      { status: 500 },
    );
  }
}



