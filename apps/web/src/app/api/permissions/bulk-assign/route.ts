import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${apiUrl}/permissions/bulk-assign`, {
      method: "POST",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ message: error.message || "Erro ao executar operação em massa" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao executar operação em massa:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao executar operação em massa" },
      { status: 500 },
    );
  }
}









