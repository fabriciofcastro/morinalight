import { NextResponse } from "next/server";

import { apiUrl } from "../../../../../lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  const response = await fetch(`${apiUrl}/users/${params.userId}/permissions/effective`, {
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Erro ao buscar permissões efetivas" },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
