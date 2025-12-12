import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function GET(request: Request, { params }: { params: { userId: string } }) {
  const { searchParams } = new URL(request.url);
  const permission = searchParams.get("permission");

  if (!permission) {
    return NextResponse.json({ message: "permission é obrigatório" }, { status: 400 });
  }

  const response = await fetch(
    `${apiUrl}/users/${params.userId}/permissions/check?permission=${encodeURIComponent(permission)}`,
    {
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao verificar permissão" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
