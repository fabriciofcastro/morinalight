import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } },
) {
  try {
    const response = await fetch(`${apiUrl}/profile/sessions/${params.sessionId}/revoke`, {
      method: "POST",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao revogar sessão" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao revogar sessão:", error);
    return NextResponse.json(
      { message: "Erro ao revogar sessão" },
      { status: 500 },
    );
  }
}



