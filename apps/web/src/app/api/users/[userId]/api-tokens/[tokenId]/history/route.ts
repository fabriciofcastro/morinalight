import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../../_lib/auth-headers";

type RouteParams = {
  params: Promise<{ userId: string;
    tokenId: string;
   }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { userId, tokenId } = await params;
  const { searchParams } = new URL(request.url);
  const paramsQuery = new URLSearchParams();

  searchParams.forEach((value, key) => {
    paramsQuery.append(key, value);
  });

  const response = await fetch(
    `${apiUrl}/users/${userId}/api-tokens/${tokenId}/history?${paramsQuery.toString()}`,
    {
      method: "GET",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao buscar histórico de token" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}


