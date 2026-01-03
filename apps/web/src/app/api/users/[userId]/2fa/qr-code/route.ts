import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{ userId: string;
   }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId } = await params;
  const response = await fetch(`${apiUrl}/users/${userId}/2fa/qr-code`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao buscar QR code do 2FA" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}


