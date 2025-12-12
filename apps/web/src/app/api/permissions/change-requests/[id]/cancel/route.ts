import { NextResponse } from "next/server";

import { apiUrl } from "../../../../../../lib/env";
import { buildAuthHeaders } from "../../../../../_lib/auth-headers";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));

  const response = await fetch(`${apiUrl}/permissions/change-requests/${params.id}/cancel`, {
    method: "POST",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
