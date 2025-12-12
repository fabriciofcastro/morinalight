import { NextResponse } from "next/server";

import { apiUrl } from "../../../../lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();

  const response = await fetch(`${apiUrl}/permissions/change-requests${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: buildAuthHeaders({ "Content-Type": "application/json" }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
