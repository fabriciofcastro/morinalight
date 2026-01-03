import { NextResponse } from "next/server";

import { apiUrl, defaultActorId, defaultOrgId } from "@/lib/env";
import { buildAuthHeaders } from "../../../../_lib/auth-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{
    orgId?: string;
    inviteId: string;
  }>;
};

function resolveOrgId(paramOrgId?: string) {
  return paramOrgId ?? defaultOrgId;
}

function resolveActorId(request: Request): string {
  return request.headers.get("x-user-id") ?? defaultActorId ?? "";
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const actorId = resolveActorId(request);
  const { orgId: paramOrgId, inviteId } = await params;
  const orgId = resolveOrgId(paramOrgId);
  const authHeaders = await buildAuthHeaders();

  const response = await fetch(`${apiUrl}/organizations/${orgId}/invites/${inviteId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": actorId,
      ...authHeaders,
    },
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = (isJson ? await response.json() : await response.text()) as
    | { message?: string }
    | string;

  if (isJson) {
    return NextResponse.json(payload as { message?: string }, { status: response.status });
  }

  return NextResponse.json({ message: String(payload) }, { status: response.status });
}
