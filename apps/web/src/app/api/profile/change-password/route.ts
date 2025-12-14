import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../_lib/auth-headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { message: "Senha atual e nova senha são obrigatórias" },
        { status: 400 },
      );
    }

    const response = await fetch(`${apiUrl}/profile/change-password`, {
      method: "POST",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro ao alterar senha" }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { message: "Erro ao alterar senha" },
      { status: 500 },
    );
  }
}

