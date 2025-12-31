import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{ userId: string;
    deviceId: string;
   }>;
};

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId, deviceId } = await params;
  const response = await fetch(`${apiUrl}/users/${userId}/trusted-devices/${deviceId}`, {
    method: "DELETE",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao remover dispositivo confiável" }));
    return NextResponse.json(error, { status: response.status });
  }

  return new NextResponse(null, { status: 204 });
}


