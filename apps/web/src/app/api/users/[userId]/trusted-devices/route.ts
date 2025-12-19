import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

type RouteParams = {
  params: {
    userId: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { searchParams } = new URL(_request.url);
  const queryParams = new URLSearchParams();

  searchParams.forEach((value, key) => {
    queryParams.append(key, value);
  });

  const response = await fetch(`${apiUrl}/users/${params.userId}/trusted-devices?${queryParams.toString()}`, {
    method: "GET",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao buscar dispositivos confiáveis" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: RouteParams) {
  const body = await request.json();

  const response = await fetch(`${apiUrl}/users/${params.userId}/trusted-devices`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro ao adicionar dispositivo confiável" }));
    return NextResponse.json(error, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 201 });
}


