import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    // Forward query parameters
    const limit = searchParams.get("limit");
    if (limit) params.set("limit", limit);
    const cursor = searchParams.get("cursor");
    if (cursor) params.set("cursor", cursor);
    const type = searchParams.get("type");
    if (type) params.set("type", type);
    const dateFrom = searchParams.get("dateFrom");
    if (dateFrom) params.set("dateFrom", dateFrom);
    const dateTo = searchParams.get("dateTo");
    if (dateTo) params.set("dateTo", dateTo);

    const queryString = params.toString();
    const url = `${apiUrl}/profile/activity${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar atividade" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar atividade do perfil:", error);
    return NextResponse.json(
      { message: "Erro ao buscar atividade do perfil" },
      { status: 500 },
    );
  }
}

