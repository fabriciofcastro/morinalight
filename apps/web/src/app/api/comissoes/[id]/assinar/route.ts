import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${apiUrl}/comissoes/${id}/assinar`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(
      { message: error.message || "Erro ao assinar comissão" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
