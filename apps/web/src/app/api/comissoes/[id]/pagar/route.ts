import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/comissoes/${params.id}/pagar`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao pagar comissão" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
