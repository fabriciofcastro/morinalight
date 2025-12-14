import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../_lib/auth-headers";

export async function POST() {
  const response = await fetch(`${apiUrl}/permissions/change-requests/sweep-sla`, {
    method: "POST",
    headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
  });

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}


