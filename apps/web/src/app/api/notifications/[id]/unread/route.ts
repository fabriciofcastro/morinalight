import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{ id: string;
   }>;
};

export async function PUT(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const response = await fetch(`${apiUrl}/notifications/${id}/unread`, {
    method: "PUT",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao marcar notificação como não lida" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}



