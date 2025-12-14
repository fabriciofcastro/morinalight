import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(_request: Request, { params }: RouteParams) {
  const response = await fetch(`${apiUrl}/notifications/${params.id}/read`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao marcar notificação como lida" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

