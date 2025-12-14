import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    // Forward query parameters
    const period = searchParams.get("period");
    if (period) params.set("period", period);
    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) params.set("dateFrom", dateFrom);
    const dateTo = searchParams.get("dateTo");
    if (dateTo) params.set("dateTo", dateTo);

    const queryString = params.toString();
    const url = `${apiUrl}/profile/stats${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar estatísticas" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do perfil:", error);
    return NextResponse.json(
      { message: "Erro ao buscar estatísticas do perfil" },
      { status: 500 },
    );
  }
}

