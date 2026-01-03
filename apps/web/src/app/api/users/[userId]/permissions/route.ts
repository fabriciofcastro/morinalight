import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const permission = searchParams.get("permission");

  let url = `${apiUrl}/users/${userId}/permissions`;
  if (permission) {
    url += `/check?permission=${encodeURIComponent(permission)}`;
  }

  const response = await fetch(url, {
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json({ message: "Erro ao buscar permissões" }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
}
