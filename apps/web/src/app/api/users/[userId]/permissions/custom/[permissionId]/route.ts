import { NextResponse } from "next/server";

import { apiUrl } from "@/lib/env";
import { buildAuthHeaders } from "../../../../../_lib/auth-headers";

export async function DELETE(
  _request: Request,
  { params }: { params: { userId: string; permissionId: string } },
) {
  const response = await fetch(
    `${apiUrl}/users/${params.userId}/permissions/custom/${params.permissionId}`,
    {
      method: "DELETE",
      headers: await buildAuthHeaders({ "Content-Type": "application/json" }),
    },
  );

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}


