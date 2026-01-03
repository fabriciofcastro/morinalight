import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
    
    const response = await fetch(`${apiUrl}/auth/logout/${sessionId}`, {
      method: "POST",
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao encerrar sessão" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);
    return NextResponse.json(
      { message: "Erro ao encerrar sessão" },
      { status: 500 },
    );
  }
}
