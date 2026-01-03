import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../_lib/auth-headers";

export async function GET() {
  try {
    const response = await fetch(`${apiUrl}/profile`, {
      method: "GET",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao buscar perfil" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { message: "Erro ao buscar perfil do usuário" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${apiUrl}/profile`, {
      method: "PUT",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao atualizar perfil" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar perfil do usuário" },
      { status: 500 },
    );
  }
}



